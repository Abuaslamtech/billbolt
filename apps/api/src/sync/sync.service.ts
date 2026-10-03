import { BadRequestException, Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  cycleKey,
  formatYMD,
  parseDateSafe,
} from 'src/common/utils/cycle.utils';
import { SyncBatchDto } from './dto/sync.dto';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomic batch sync: flushes products, restocks, and receipts in a single
   * database transaction with full idempotency and client temporary ID resolution.
   */
  async syncBatch(dto: SyncBatchDto, ownerId: string, businessId: string) {
    if (!businessId) {
      throw new BadRequestException(
        'User does not have an active business registered. Please complete store setup.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const productIdMap = new Map<string, string>();
      const syncedProductIds: Record<string, string> = {};
      const syncedRestockTempIds: string[] = [];
      const syncedReceiptNumbers: string[] = [];

      // ── 1. Products ──────────────────────────────────────────────────────────
      if (dto.products && dto.products.length > 0) {
        for (const p of dto.products) {
          let product: Product | null = null;
          if (p.qrCode?.trim()) {
            product = await tx.product.findFirst({
              where: { businessId, qrCode: p.qrCode.trim() },
            });
          }

          if (!product) {
            product = await tx.product.create({
              data: {
                businessId,
                name: p.name,
                category: p.category,
                qrCode: p.qrCode,
                costPrice: p.costPrice,
                sellingPrice: p.sellingPrice,
                openingStock: p.openingStock,
                reorderLevel: p.reorderLevel,
              },
            });
          }

          productIdMap.set(p.clientTempId, product.id);
          syncedProductIds[p.clientTempId] = product.id;
        }
      }

      // ── 2. Restocks ──────────────────────────────────────────────────────────
      if (dto.restocks && dto.restocks.length > 0) {
        for (const r of dto.restocks) {
          const resolvedProductId =
            productIdMap.get(r.productId) ?? r.productId;
          const product = await tx.product.findFirst({
            where: { id: resolvedProductId, businessId },
          });

          if (!product) {
            throw new BadRequestException(
              `Product ${r.productId} not found in this business`,
            );
          }

          const restockDate = parseDateSafe(r.date);
          if (isNaN(restockDate.getTime())) {
            throw new BadRequestException(
              `Invalid restock date for product ${product.id}`,
            );
          }
          const dateStr = formatYMD(restockDate);
          const cycle = cycleKey(restockDate);

          await tx.restock.create({
            data: {
              businessId,
              productId: product.id,
              productName: product.name,
              date: dateStr,
              cycle,
              qty: r.qty,
              costPerUnit: r.costPerUnit,
              totalCost: r.qty * r.costPerUnit,
              notes: r.notes,
            },
          });

          await tx.product.update({
            where: { id: product.id },
            data: { costPrice: r.costPerUnit },
          });

          syncedRestockTempIds.push(r.clientTempId);
        }
      }

      // ── 3. Receipts & Sales ──────────────────────────────────────────────────
      if (dto.receipts && dto.receipts.length > 0) {
        let defaultSeller: string | undefined;

        for (const rcpt of dto.receipts) {
          const cleanReceiptNumber = rcpt.receiptNumber.trim();

          // Idempotency: if already created, acknowledge without duplicating
          const existing = await tx.receipt.findFirst({
            where: { businessId, receiptNumber: cleanReceiptNumber },
          });
          if (existing) {
            syncedReceiptNumbers.push(cleanReceiptNumber);
            continue;
          }

          if (!rcpt.items || rcpt.items.length === 0) {
            throw new BadRequestException(
              `Receipt ${cleanReceiptNumber} must contain at least one item`,
            );
          }

          const mappedItems = rcpt.items.map((item) => ({
            ...item,
            productId: productIdMap.get(item.productId) ?? item.productId,
          }));

          const uniqueProductIds = Array.from(
            new Set(mappedItems.map((i) => i.productId)),
          );
          const products = await tx.product.findMany({
            where: { businessId, id: { in: uniqueProductIds } },
          });

          const productMap = new Map(products.map((p) => [p.id, p]));

          const finalDate = parseDateSafe(rcpt.date);
          if (isNaN(finalDate.getTime())) {
            throw new BadRequestException(
              `Invalid transaction date on receipt ${cleanReceiptNumber}`,
            );
          }
          const dateStr = formatYMD(finalDate);
          const cycle = cycleKey(finalDate);

          let soldBy = rcpt.soldBy?.trim();
          if (!soldBy || soldBy.toLowerCase() === 'staff') {
            if (defaultSeller === undefined) {
              const user = tx.user
                ? await tx.user.findUnique({
                    where: { id: ownerId },
                    select: { fullName: true },
                  })
                : null;
              defaultSeller = user?.fullName?.trim() || 'Owner';
            }
            soldBy = defaultSeller;
          }

          let subtotal = 0;
          const receiptItemsToCreate: Array<{
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

          for (const item of mappedItems) {
            const product = productMap.get(item.productId);
            if (!product) {
              throw new BadRequestException(
                `Product with ID ${item.productId} not found in this business`,
              );
            }

            const itemQty = Number(item.qty);
            if (!itemQty || isNaN(itemQty) || itemQty <= 0) {
              throw new BadRequestException(
                `Invalid quantity for product ${product.name}`,
              );
            }

            const lineTotal = itemQty * product.sellingPrice;
            const lineCost = itemQty * product.costPrice;
            subtotal += lineTotal;

            receiptItemsToCreate.push({
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
              customerName: rcpt.customerName,
              createdAt: finalDate,
            });
          }

          const discount = Math.max(0, Number(rcpt.discount) || 0);
          const finalTotal = Math.max(0, subtotal - discount);

          // Prorate discount across sales and receipt items
          let allocatedDiscount = 0;
          for (let i = 0; i < salesToCreate.length; i++) {
            let itemDiscount = 0;
            if (discount > 0 && subtotal > 0) {
              if (i === salesToCreate.length - 1) {
                itemDiscount = discount - allocatedDiscount;
              } else {
                itemDiscount = Math.round(
                  (salesToCreate[i].revenue / subtotal) * discount,
                );
                allocatedDiscount += itemDiscount;
              }
            }
            salesToCreate[i].discount = itemDiscount;
            salesToCreate[i].revenue = Math.max(
              0,
              salesToCreate[i].revenue - itemDiscount,
            );
            salesToCreate[i].profit =
              salesToCreate[i].revenue - salesToCreate[i].cost;
            receiptItemsToCreate[i].discount = itemDiscount;
            receiptItemsToCreate[i].total = salesToCreate[i].revenue;
          }

          const isCredit = rcpt.paymentMethod === 'Credit';
          const depositAmount = isCredit
            ? Math.max(
                0,
                Math.min(
                  finalTotal,
                  Number(rcpt.depositAmount || rcpt.amountPaid) || 0,
                ),
              )
            : finalTotal;
          const amountPaid =
            rcpt.amountPaid !== undefined ? rcpt.amountPaid : depositAmount;
          const balanceOwed =
            rcpt.balanceOwed !== undefined
              ? rcpt.balanceOwed
              : Math.max(0, finalTotal - amountPaid);
          const paymentStatus =
            rcpt.paymentStatus ??
            (balanceOwed <= 0
              ? 'paid'
              : amountPaid > 0
                ? 'partially_paid'
                : 'unpaid');

          const createdReceipt = await tx.receipt.create({
            data: {
              receiptNumber: cleanReceiptNumber,
              customerName: rcpt.customerName,
              customerPhone: rcpt.customerPhone,
              subtotal,
              discount,
              total: finalTotal,
              paymentMethod: rcpt.paymentMethod ?? 'Cash',
              paymentStatus,
              amountPaid,
              balanceOwed,
              dueDate: isCredit ? rcpt.dueDate : undefined,
              soldBy,
              cycle,
              date: dateStr,
              notes: rcpt.notes,
              ownerId,
              businessId,
              createdAt: finalDate,
              items: {
                create: receiptItemsToCreate,
              },
            },
          });

          await tx.sale.createMany({
            data: salesToCreate.map((s) => ({
              ...s,
              receiptId: createdReceipt.id,
            })),
          });

          syncedReceiptNumbers.push(cleanReceiptNumber);
        }
      }

      // ── 4. Debt Repayments ──────────────────────────────────────────────────
      const syncedRepaymentTempIds: string[] = [];
      if (dto.repayments && dto.repayments.length > 0) {
        for (const rep of dto.repayments) {
          if (!rep.amount || rep.amount <= 0) continue;

          let remainingPayment = rep.amount;
          const targetReceipts = rep.receiptId
            ? await tx.receipt.findMany({
                where: { id: rep.receiptId, businessId, isDeleted: false },
              })
            : await tx.receipt.findMany({
                where: {
                  businessId,
                  customerPhone: rep.customerPhone,
                  balanceOwed: { gt: 0 },
                  isDeleted: false,
                },
                orderBy: { createdAt: 'asc' },
              });

          for (const r of targetReceipts) {
            if (remainingPayment <= 0) break;
            const currentBalance = r.balanceOwed;
            const payForThisReceipt = Math.min(
              remainingPayment,
              currentBalance,
            );
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

          await tx.debtRepayment.create({
            data: {
              businessId,
              receiptId: rep.receiptId || (targetReceipts[0]?.id ?? null),
              customerPhone: rep.customerPhone,
              customerName: rep.customerName,
              amount: rep.amount,
              paymentMethod: rep.paymentMethod ?? 'Cash',
              date: rep.date,
              note: rep.note,
            },
          });

          syncedRepaymentTempIds.push(rep.clientTempId);
        }
      }

      return {
        success: true,
        syncedProductIds,
        syncedRestockTempIds,
        syncedReceiptNumbers,
        syncedRepaymentTempIds,
        syncedAt: new Date().toISOString(),
      };
    });
  }
}
