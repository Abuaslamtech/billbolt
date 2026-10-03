import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { cycleKey, formatYMD, parseDateSafe } from 'src/common/utils/cycle.utils';
import {
  CreateProductDto,
  CreateRestockDto,
  UpdateProductDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Products ────────────────────────────────────────────────────────────────

  async getProductsWithStock(businessId: string) {
    const [products, restockGroups, saleGroups] = await Promise.all([
      this.prisma.product.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.restock.groupBy({
        by: ['productId'],
        where: { businessId },
        _sum: { qty: true },
      }),
      this.prisma.sale.groupBy({
        by: ['productId'],
        where: { businessId },
        _sum: { qty: true },
      }),
    ]);

    const restockMap = new Map(
      restockGroups.map((r) => [r.productId, r._sum.qty ?? 0]),
    );
    const saleMap = new Map(
      saleGroups.map((s) => [s.productId, s._sum.qty ?? 0]),
    );

    return products.map((p) => {
      const totalRestocked = restockMap.get(p.id) ?? 0;
      const totalSold = saleMap.get(p.id) ?? 0;
      const currentStock = p.openingStock + totalRestocked - totalSold;

      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (currentStock <= 0) status = 'Out of Stock';
      else if (currentStock <= p.reorderLevel) status = 'Low Stock';

      return {
        ...p,
        qrCode: p.qrCode,
        totalRestocked,
        totalSold,
        currentStock,
        status,
      };
    });
  }

  async createProduct(businessId: string, dto: CreateProductDto) {
    if (!businessId) {
      throw new BadRequestException(
        'User does not have an active business registered. Please complete store setup.',
      );
    }
    return this.prisma.product.create({
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

    return this.prisma.$transaction(async (tx) => {
      const restock = await tx.restock.create({
        data: {
          businessId,
          productId: product.id,
          productName: product.name,
          date: dateStr,
          cycle: cycleKey(restockDate),
          qty: dto.qty,
          costPerUnit: dto.costPerUnit,
          totalCost: dto.qty * dto.costPerUnit,
          notes: dto.notes,
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
