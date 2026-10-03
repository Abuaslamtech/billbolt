import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { PrismaService } from 'prisma/prisma.service';
import { resolveBusinessId } from 'src/common/utils/business.utils';
import { ReceiptService } from './receipt.service';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(
    private readonly receiptService: ReceiptService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getSales(@GetUser() user: JwtPayload, @Query('limit') limit = '100') {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.receiptService.getSales(businessId, +limit);
  }
}
