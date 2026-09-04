import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(ApiKeyGuard)
export class SalesController {
  constructor(private sales: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.sales.create(dto);
  }
}
