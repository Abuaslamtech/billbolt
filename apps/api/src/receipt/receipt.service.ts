import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

function cycleKey(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  if (d >= 14) {
    const start = new Date(y, m, 14);
    const end = new Date(y, m + 1, 13);
    return `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
  } else {
    const start = new Date(y, m - 1, 14);
    const end = new Date(y, m, 13);
    return `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
  }
}

function generateReceiptNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async createReceipt(
    dto: CreateReceiptDto,
    ownerId: string,
    businessId: string,
  ) {
    const products = await this.prisma.product.findMany({
      where: { businessId },
    });

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('A receipt must contain at least one item');
    }

    if (!dto.date) {
      throw new BadRequestException('Transaction date is required');
    }
    const finalDate = new Date(dto.date);
    if (isNaN(finalDate.getTime())) {
      throw new BadRequestException('Invalid transaction date');
    }
    const dateStr = finalDate.toISOString().split('T')[0];
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
        throw new BadRequestException(`Invalid quantity for product ${product.name}`);
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

    // Create receipt + items + sales in a single transaction
    const receipt = await this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.create({
        data: {
          receiptNumber: generateReceiptNumber(),
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          subtotal,
          discount,
          total: finalTotal,
          paymentMethod: (dto.paymentMethod ?? 'Cash') as any,
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
        include: { items: true },
      });

      // Create sale records and link to receipt
      await tx.sale.createMany({
        data: salesToCreate.map((s) => ({ ...s, receiptId: receipt.id })),
      });

      return receipt;
    });

    return receipt;
  }

  async getSales(businessId: string) {
    if (!businessId) return [];
    return this.prisma.sale.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReceipts(businessId: string, page = 1, limit = 20) {
    if (!businessId) return { receipts: [], total: 0, page, limit };
    const skip = (page - 1) * limit;
    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where: { businessId, isDeleted: false },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.receipt.count({ where: { businessId, isDeleted: false } }),
    ]);
    return { receipts, total, page, limit };
  }

  async getReceiptById(receiptId: string, businessId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, businessId, isDeleted: false },
      include: { items: true },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async softDeleteReceipt(receiptId: string, businessId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id: receiptId, businessId },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { isDeleted: true },
    });
    return { message: 'Receipt deleted' };
  }
}
