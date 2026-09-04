import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { businessCycleStart } from '../common/cycle.util';
import { CreateRestockDto } from './dto/create-restock.dto';

@Injectable()
export class RestocksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestockDto) {
    const product = await this.prisma.product.findUnique({ where: { name: dto.product } });
    if (!product) throw new NotFoundException(`No product named "${dto.product}"`);

    const date = new Date(dto.date);
    if (isNaN(date.getTime())) throw new BadRequestException('Invalid date');

    return this.prisma.restock.create({
      data: {
        date,
        cycle: businessCycleStart(date),
        productId: product.id,
        qty: dto.qty,
        costPerUnit: dto.costPerUnit,
        totalCost: dto.costPerUnit * dto.qty,
      },
    });
  }
}
