import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { businessCycleStart } from '../common/cycle.util';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto) {
    const product = await this.prisma.product.findUnique({ where: { name: dto.product } });
    if (!product) throw new NotFoundException(`No product named "${dto.product}"`);

    const date = new Date(dto.date);
    if (isNaN(date.getTime())) throw new BadRequestException('Invalid date');

    const unitPrice = Number(product.sellingPrice);
    const unitCost = Number(product.costPrice);
    const revenue = unitPrice * dto.qty;
    const cost = unitCost * dto.qty;
    const profit = revenue - cost;

    // A single INSERT — Postgres handles concurrent writes safely,
    // unlike the old spreadsheet "find the next empty row" approach.
    return this.prisma.sale.create({
      data: {
        date,
        cycle: businessCycleStart(date),
        productId: product.id,
        qty: dto.qty,
        soldBy: dto.soldBy,
        unitPrice,
        unitCost,
        revenue,
        cost,
        profit,
      },
    });
  }
}
