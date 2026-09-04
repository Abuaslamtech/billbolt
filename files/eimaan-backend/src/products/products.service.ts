import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Product "${dto.name}" already exists`);
    return this.prisma.product.create({
      data: {
        name: dto.name,
        category: dto.category,
        costPrice: dto.costPrice,
        sellingPrice: dto.sellingPrice,
        reorderLevel: dto.reorderLevel,
        openingStock: dto.openingStock ?? 0,
      },
    });
  }

  async findAllWithStock() {
    const products = await this.prisma.product.findMany({ orderBy: { name: 'asc' } });
    const results: (typeof products[number] & { currentStock: number; status: string })[] = [];
    for (const p of products) {
      const [restocked, sold] = await Promise.all([
        this.prisma.restock.aggregate({ where: { productId: p.id }, _sum: { qty: true } }),
        this.prisma.sale.aggregate({ where: { productId: p.id }, _sum: { qty: true } }),
      ]);
      const currentStock =
        p.openingStock + (restocked._sum.qty ?? 0) - (sold._sum.qty ?? 0);
      const status =
        currentStock <= 0 ? 'OUT OF STOCK' : currentStock <= p.reorderLevel ? 'REORDER' : 'OK';
      results.push({ ...p, currentStock, status });
    }
    return results;
  }

  async findNames(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return products.map((p) => p.name);
  }

  async findByName(name: string) {
    return this.prisma.product.findUnique({ where: { name } });
  }
}
