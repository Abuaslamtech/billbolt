import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all stores for a business with summary counts */
  async getStores(businessId: string) {
    const stores = await this.prisma.store.findMany({
      where: { businessId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      include: {
        stocks: {
          include: {
            product: true,
          },
        },
      },
    });

    // Also get restock and sale groups per store to calculate live currentStock per store
    const [restockGroups, saleGroups] = await Promise.all([
      this.prisma.restock.groupBy({
        by: ['storeId', 'productId'],
        where: { businessId, storeId: { not: null } },
        _sum: { qty: true },
      }),
      this.prisma.sale.groupBy({
        by: ['storeId', 'productId'],
        where: { businessId, storeId: { not: null } },
        _sum: { qty: true },
      }),
    ]);

    const restockMap = new Map<string, number>();
    for (const r of restockGroups) {
      if (r.storeId) restockMap.set(`${r.storeId}:${r.productId}`, r._sum.qty ?? 0);
    }

    const saleMap = new Map<string, number>();
    for (const s of saleGroups) {
      if (s.storeId) saleMap.set(`${s.storeId}:${s.productId}`, s._sum.qty ?? 0);
    }

    return stores.map((store) => {
      let totalStockUnits = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      for (const stock of store.stocks) {
        const key = `${store.id}:${stock.productId}`;
        const restocked = restockMap.get(key) ?? 0;
        const sold = saleMap.get(key) ?? 0;
        const currentStock = stock.openingStock + restocked - sold;

        totalStockUnits += currentStock;
        if (currentStock <= 0) {
          outOfStockCount++;
        } else if (currentStock <= stock.reorderLevel) {
          lowStockCount++;
        }
      }

      return {
        id: store.id,
        businessId: store.businessId,
        name: store.name,
        location: store.location,
        isDefault: store.isDefault,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        productCount: store.stocks.length,
        totalStockUnits,
        lowStockCount,
        outOfStockCount,
      };
    });
  }

  /** Create a new store and initialize StoreStock for existing products */
  async createStore(businessId: string, dto: CreateStoreDto) {
    if (!businessId) {
      throw new BadRequestException('Active business is required');
    }

    const existingCount = await this.prisma.store.count({ where: { businessId } });
    const isFirstStore = existingCount === 0;
    const shouldBeDefault = isFirstStore || !!dto.isDefault;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.store.updateMany({
          where: { businessId },
          data: { isDefault: false },
        });
      }

      const store = await tx.store.create({
        data: {
          businessId,
          name: dto.name.trim(),
          location: dto.location?.trim() || null,
          isDefault: shouldBeDefault,
        },
      });

      // Initialize StoreStock with 0 opening stock for all existing products of this business
      const products = await tx.product.findMany({
        where: { businessId },
        select: { id: true, reorderLevel: true },
      });

      if (products.length > 0) {
        await tx.storeStock.createMany({
          data: products.map((p) => ({
            storeId: store.id,
            productId: p.id,
            openingStock: 0,
            reorderLevel: p.reorderLevel ?? 5,
          })),
          skipDuplicates: true,
        });
      }

      return store;
    });
  }

  /** Update an existing store */
  async updateStore(businessId: string, storeId: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, businessId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.store.updateMany({
          where: { businessId, id: { not: storeId } },
          data: { isDefault: false },
        });
      }

      return tx.store.update({
        where: { id: storeId },
        data: {
          name: dto.name ? dto.name.trim() : undefined,
          location: dto.location !== undefined ? dto.location?.trim() || null : undefined,
          isDefault: dto.isDefault !== undefined ? dto.isDefault : undefined,
        },
      });
    });
  }

  /** Delete a non-default store */
  async deleteStore(businessId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, businessId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.isDefault) {
      throw new BadRequestException('Cannot delete the default primary store');
    }

    const [salesCount, restocksCount] = await Promise.all([
      this.prisma.sale.count({ where: { storeId } }),
      this.prisma.restock.count({ where: { storeId } }),
    ]);

    if (salesCount > 0 || restocksCount > 0) {
      throw new BadRequestException(
        `Cannot delete store with recorded activity (${salesCount} sale(s), ${restocksCount} restock(s)). Rename or archive instead.`,
      );
    }

    return this.prisma.store.delete({
      where: { id: storeId },
    });
  }
}
