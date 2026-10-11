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
import {
  CreateProductDto,
  CreateRestockDto,
  UpdateProductDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Products ────────────────────────────────────────────────────────────────

  async getProductsWithStock(businessId: string, storeId?: string) {
    const isSpecificStore = !!storeId && storeId !== 'all';

    const [products, stores, restockGroups, saleGroups] = await Promise.all([
      this.prisma.product.findMany({
        where: { businessId },
        include: {
          storeStocks: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store?.findMany
        ? this.prisma.store.findMany({
            where: { businessId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
          })
        : Promise.resolve([]),
      this.prisma.restock.groupBy({
        by: ['productId', 'storeId'],
        where: { businessId },
        _sum: { qty: true },
      }),
      this.prisma.sale.groupBy({
        by: ['productId', 'storeId'],
        where: { businessId },
        _sum: { qty: true },
      }),
    ]);

    // Build lookup maps: key = "storeId:productId" or "all:productId"
    const storeRestockMap = new Map<string, number>();
    const totalRestockMap = new Map<string, number>();
    for (const r of restockGroups) {
      const qty = r._sum.qty ?? 0;
      totalRestockMap.set(r.productId, (totalRestockMap.get(r.productId) ?? 0) + qty);
      if (r.storeId) {
        storeRestockMap.set(`${r.storeId}:${r.productId}`, qty);
      }
    }

    const storeSaleMap = new Map<string, number>();
    const totalSaleMap = new Map<string, number>();
    for (const s of saleGroups) {
      const qty = s._sum.qty ?? 0;
      totalSaleMap.set(s.productId, (totalSaleMap.get(s.productId) ?? 0) + qty);
      if (s.storeId) {
        storeSaleMap.set(`${s.storeId}:${s.productId}`, qty);
      }
    }

    return products.map((p) => {
      // Calculate per-store breakdown for quick modal/inspection
      const storeBreakdown = stores.map((st) => {
        const ss = p.storeStocks.find((s) => s.storeId === st.id);
        const opening = ss?.openingStock ?? 0;
        const restocked = storeRestockMap.get(`${st.id}:${p.id}`) ?? 0;
        const sold = storeSaleMap.get(`${st.id}:${p.id}`) ?? 0;
        const current = opening + restocked - sold;
        return {
          storeId: st.id,
          storeName: st.name,
          isDefault: st.isDefault,
          currentStock: current,
          reorderLevel: ss?.reorderLevel ?? p.reorderLevel,
        };
      });

      let currentStock: number;
      let targetReorderLevel = p.reorderLevel;

      if (isSpecificStore) {
        const targetStoreStock = storeBreakdown.find((b) => b.storeId === storeId);
        currentStock = targetStoreStock ? targetStoreStock.currentStock : 0;
        targetReorderLevel = targetStoreStock ? targetStoreStock.reorderLevel : p.reorderLevel;
      } else {
        const totalRestocked = totalRestockMap.get(p.id) ?? 0;
        const totalSold = totalSaleMap.get(p.id) ?? 0;
        currentStock = p.openingStock + totalRestocked - totalSold;
      }

      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (currentStock <= 0) status = 'Out of Stock';
      else if (currentStock <= targetReorderLevel) status = 'Low Stock';

      return {
        ...p,
        qrCode: p.qrCode,
        totalRestocked: totalRestockMap.get(p.id) ?? 0,
        totalSold: totalSaleMap.get(p.id) ?? 0,
        currentStock,
        status,
        storeBreakdown,
      };
    });
  }

  async createProduct(businessId: string, dto: CreateProductDto) {
    if (!businessId) {
      throw new BadRequestException(
        'User does not have an active business registered. Please complete store setup.',
      );
    }

    // Ensure at least one store exists
    const stores = this.prisma.store?.findMany
      ? await this.prisma.store.findMany({
          where: { businessId },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        })
      : [];

    let targetStore = stores.find((s) => s.id === dto.storeId) || stores.find((s) => s.isDefault);
    if (!targetStore && stores.length > 0) {
      targetStore = stores[0];
    }

    return this.prisma.$transaction(async (tx) => {
      // Create fallback store if none exists
      if (!targetStore && tx.store?.create) {
        targetStore = await tx.store.create({
          data: {
            businessId,
            name: 'Main Store',
            isDefault: true,
          },
        });
      }

      const product = await tx.product.create({
        data: {
          name: dto.name,
          category: dto.category,
          costPrice: dto.costPrice,
          sellingPrice: dto.sellingPrice,
          openingStock: dto.openingStock,
          reorderLevel: dto.reorderLevel,
          qrCode: dto.qrCode?.trim() || null,
          businessId,
        },
      });

      // Initialize StoreStock for target store with opening stock if StoreStock exists
      if (targetStore && tx.storeStock?.create) {
        await tx.storeStock.create({
          data: {
            storeId: targetStore.id,
            productId: product.id,
            openingStock: dto.openingStock,
            reorderLevel: dto.reorderLevel,
          },
        });
      }

      // For any other stores, initialize with 0 opening stock
      const otherStores = stores.filter((s) => targetStore && s.id !== targetStore.id);
      if (otherStores.length > 0 && tx.storeStock?.createMany) {
        await tx.storeStock.createMany({
          data: otherStores.map((os) => ({
            storeId: os.id,
            productId: product.id,
            openingStock: 0,
            reorderLevel: dto.reorderLevel,
          })),
          skipDuplicates: true,
        });
      }

      return product;
    });
  }

  async updateProduct(
    productId: string,
    businessId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, businessId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
    });
  }

  // ─── Restocks ────────────────────────────────────────────────────────────────

  async getRestocks(businessId: string, limit = 100) {
    if (!businessId) return [];
    const safeLimit = Math.min(Math.max(1, limit), 100);
    return this.prisma.restock.findMany({
      where: { businessId },
      include: {
        store: true,
      },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  }

  async createRestock(businessId: string, dto: CreateRestockDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, businessId },
    });
    if (!product)
      throw new BadRequestException('Product not found in this business');

    const restockDate = parseDateSafe(dto.date);
    if (isNaN(restockDate.getTime())) {
      throw new BadRequestException('Invalid restock date');
    }
    const dateStr = formatYMD(restockDate);

    // Resolve target store
    let targetStoreId = dto.storeId;
    if (!targetStoreId && this.prisma.store?.findFirst) {
      const defaultStore = await this.prisma.store.findFirst({
        where: { businessId, isDefault: true },
      });
      targetStoreId = defaultStore?.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const restock = await tx.restock.create({
        data: {
          businessId,
          productId: product.id,
          productName: product.name,
          storeId: targetStoreId,
          date: dateStr,
          cycle: cycleKey(restockDate),
          qty: dto.qty,
          costPerUnit: dto.costPerUnit,
          totalCost: dto.qty * dto.costPerUnit,
          notes: dto.notes,
        },
        include: {
          store: true,
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: { costPrice: dto.costPerUnit },
      });

      return restock;
    });
  }
}
