import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  cycleKey,
  formatYMD,
  parseDateSafe,
} from 'src/common/utils/cycle.utils';
import { CreateReceiptDto, RecordRepaymentDto } from './dto/create-receipt.dto';
import { generateReceiptNumber } from './utils/receipt.utils';

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async createReceipt(
    dto: CreateReceiptDto,
    ownerId: string,
    businessId: string,
  ) {
    // Idempotent sync: if client provided an offline receiptNumber, return existing if already synced
    if (dto.receiptNumber?.trim()) {
      const existing = await this.prisma.receipt.findFirst({
        where: {
          businessId,
          receiptNumber: dto.receiptNumber.trim(),
        },
        include: { items: true },
      });
      if (existing) {
        return existing;
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('A receipt must contain at least one item');
    }

    const productIds = Array.from(new Set(dto.items.map((i) => i.productId)));
    const products = await this.prisma.product.findMany({
      where: { businessId, id: { in: productIds } },
    });

    if (!dto.date) {
      throw new BadRequestException('Transaction date is required');
    }
    const finalDate = parseDateSafe(dto.date);
    if (isNaN(finalDate.getTime())) {
      throw new BadRequestException('Invalid transaction date');
    }
    const dateStr = formatYMD(finalDate);
    const cycle = cycleKey(finalDate);

    let soldBy = dto.soldBy?.trim();
    if (!soldBy || soldBy.toLowerCase() === 'staff') {
      const user = await this.prisma.user.findUnique({
        where: { id: ownerId },
        select: { fullName: true },
      });
      soldBy = user?.fullName?.trim() || 'Owner';
    }

    const receiptItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      total: number;
    }> = [];

    const salesToCreate: Array<{
      businessId: string;
      productId: string;
      productName: string;
      date: string;
      cycle: string;
      qty: number;
      soldBy: string;
      unitPrice: number;
      unitCost: number;
      discount: number;
      revenue: number;
      cost: number;
      profit: number;
      customerName: string;
      createdAt: Date;
    }> = [];

    let subtotal = 0;

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new BadRequestException(`Product ${item.productId} not found`);

      const itemQty = Number(item.qty);
      if (!itemQty || isNaN(itemQty) || itemQty <= 0) {
        throw new BadRequestException(
          `Invalid quantity for product ${product.name}`,
        );
      }

      const lineTotal = itemQty * product.sellingPrice;
      const lineCost = itemQty * product.costPrice;
      subtotal += lineTotal;

      receiptItems.push({
        productId: product.id,
        productName: product.name,
        quantity: itemQty,
        unitPrice: product.sellingPrice,
        discount: 0,
        total: lineTotal,
      });

      salesToCreate.push({
        businessId,
        productId: product.id,
        productName: product.name,
        date: dateStr,
        cycle,
        qty: itemQty,
        soldBy,
        unitPrice: product.sellingPrice,
        unitCost: product.costPrice,
        discount: 0,
        revenue: lineTotal,
        cost: lineCost,
        profit: lineTotal - lineCost,
        customerName: dto.customerName,
        createdAt: finalDate,
      });
    }

    const discount = Math.max(0, Number(dto.discount) || 0);
    const finalTotal = Math.max(0, subtotal - discount);

    // Prorate discount across sales records so product revenue and profit reflect actual collected amounts
    let allocatedDiscount = 0;
    for (let i = 0; i < salesToCreate.length; i++) {
      const sale = salesToCreate[i];
      let itemDiscount = 0;
      if (discount > 0 && subtotal > 0) {
        if (i === salesToCreate.length - 1) {
          itemDiscount = discount - allocatedDiscount;
        } else {
          itemDiscount = Math.round((sale.revenue / subtotal) * discount);
          allocatedDiscount += itemDiscount;
        }
      }
      const netRevenue = Math.max(0, sale.revenue - itemDiscount);
      sale.discount = itemDiscount;
      sale.revenue = netRevenue;
      sale.profit = netRevenue - sale.cost;

      if (receiptItems[i]) {
        receiptItems[i].discount = itemDiscount;
        receiptItems[i].total = netRevenue;
      }
    }

    const isCredit = dto.paymentMethod === 'Credit';
    const depositAmount = isCredit
      ? Math.max(0, Math.min(finalTotal, Number(dto.depositAmount) || 0))
      : finalTotal;
    const amountPaid = depositAmount;
    const balanceOwed = Math.max(0, finalTotal - amountPaid);
    const paymentStatus =
      balanceOwed <= 0 ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'unpaid';

    // Create receipt + items + sales in a single transaction
    const receiptNumber =
      dto.receiptNumber?.trim() || generateReceiptNumber(finalDate);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.receipt.create({
        data: {
          receiptNumber,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          subtotal,
          discount,
          total: finalTotal,
          paymentMethod: dto.paymentMethod ?? 'Cash',
          paymentStatus,
          amountPaid,
          balanceOwed,
          dueDate: isCredit ? dto.dueDate : undefined,
          soldBy,
          cycle,
          date: dateStr,
          createdAt: finalDate,
          notes: dto.notes,
          ownerId,
          businessId,
          items: {
            create: receiptItems,
          },
        },
        include: { items: true, repayments: true },
      });

      // If initial deposit on credit was paid, record initial repayment log
      if (isCredit && depositAmount > 0) {
        await tx.debtRepayment.create({
          data: {
            receiptId: created.id,
            businessId,
            customerPhone: dto.customerPhone || '',
            customerName: dto.customerName,
            amount: depositAmount,
            paymentMethod: 'Cash',
            date: dateStr,
            note: 'Initial deposit at checkout',
          },
        });
      }

      // Create sale records and link to receipt
      await tx.sale.createMany({
        data: salesToCreate.map((s) => ({ ...s, receiptId: created.id })),
      });

      return created;
    });
  }

  async recordRepayment(businessId: string, dto: RecordRepaymentDto) {
    if (!businessId) throw new BadRequestException('Business ID is required');
    if (!dto.amount || dto.amount <= 0)
      throw new BadRequestException('Payment amount must be greater than zero');

    return this.prisma.$transaction(async (tx) => {
      let remainingPayment = dto.amount;
      const targetReceipts = dto.receiptId
        ? await tx.receipt.findMany({
            where: { id: dto.receiptId, businessId, isDeleted: false },
          })
        : await tx.receipt.findMany({
            where: {
              businessId,
              customerPhone: dto.customerPhone,
              balanceOwed: { gt: 0 },
              isDeleted: false,
            },
            orderBy: { createdAt: 'asc' },
          });

      for (const r of targetReceipts) {
        if (remainingPayment <= 0) break;
        const currentBalance = r.balanceOwed;
        const payForThisReceipt = Math.min(remainingPayment, currentBalance);
        const newAmountPaid = r.amountPaid + payForThisReceipt;
        const newBalance = Math.max(0, r.total - newAmountPaid);
        const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

        await tx.receipt.update({
          where: { id: r.id },
          data: {
            amountPaid: newAmountPaid,
            balanceOwed: newBalance,
            paymentStatus: newStatus,
          },
        });

        remainingPayment -= payForThisReceipt;
      }

      const repayment = await tx.debtRepayment.create({
        data: {
          businessId,
          receiptId: dto.receiptId || (targetReceipts[0]?.id ?? null),
          customerPhone: dto.customerPhone,
          customerName: dto.customerName,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod ?? 'Cash',
          date: dto.date,
          note: dto.note,
        },
      });

      return repayment;
    });
  }

  async getSales(businessId: string, limit = 100) {
    if (!businessId) return [];
    const safeLimit = Math.min(Math.max(1, limit), 100);
    return this.prisma.sale.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  }

  async getReceipts(businessId: string, page = 1, limit = 20) {
    if (!businessId) return { receipts: [], total: 0, page, limit };
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;
    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where: { businessId, isDeleted: false },
        include: { items: true, repayments: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.receipt.count({ where: { businessId, isDeleted: false } }),
    ]);
    return { receipts, total, page: safePage, limit: safeLimit };
  }

  async getDebtors(businessId: string) {
    if (!businessId) return [];
    const unpaidReceipts = await this.prisma.receipt.findMany({
      where: {
        businessId,
        balanceOwed: { gt: 0 },
        isDeleted: false,
      },
      include: { items: true, repayments: true },
      orderBy: { createdAt: 'desc' },
    });

    const debtorMap = new Map<
      string,
      {
        customerName: string;
        customerPhone: string;
        totalOwed: number;
        totalPaid: number;
        remainingBalance: number;
        receiptCount: number;
        latestReceiptDate: string;
        earliestDueDate?: string;
        isOverdue: boolean;
        receipts: any[];
      }
    >();

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const r of unpaidReceipts) {
      const key = (r.customerPhone || r.customerName).trim().toLowerCase();
      const existing = debtorMap.get(key);

      const isOverdue = Boolean(r.dueDate && r.dueDate < todayStr);

      if (!existing) {
        debtorMap.set(key, {
          customerName: r.customerName,
          customerPhone: r.customerPhone || '',
          totalOwed: r.total,
          totalPaid: r.amountPaid,
          remainingBalance: r.balanceOwed,
          receiptCount: 1,
          latestReceiptDate: r.date,
          earliestDueDate: r.dueDate || undefined,
          isOverdue,
          receipts: [r],
        });
      } else {
        existing.totalOwed += r.total;
        existing.totalPaid += r.amountPaid;
        existing.remainingBalance += r.balanceOwed;
        existing.receiptCount += 1;
        existing.receipts.push(r);
        if (isOverdue) existing.isOverdue = true;
        if (
          r.dueDate &&
          (!existing.earliestDueDate || r.dueDate < existing.earliestDueDate)
        ) {
          existing.earliestDueDate = r.dueDate;
        }
      }
    }

    return Array.from(debtorMap.values());
  }

  async getReceiptById(receiptId: string, businessId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, businessId, isDeleted: false },
      include: { items: true, repayments: true },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async softDeleteReceipt(receiptId: string, businessId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, businessId },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');

    await this.prisma.$transaction([
      this.prisma.receipt.update({
        where: { id: receiptId },
        data: { isDeleted: true },
      }),
      this.prisma.sale.deleteMany({
        where: { receiptId },
      }),
    ]);

    return { message: 'Receipt deleted' };
  }
}
