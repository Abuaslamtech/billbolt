import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(ApiKeyGuard)
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  // GET /products            -> full list with computed stock + status
  // GET /products?namesOnly=1 -> lightweight list of names (for dropdowns)
  @Get()
  findAll(@Query('namesOnly') namesOnly?: string) {
    if (namesOnly) return this.products.findNames();
    return this.products.findAllWithStock();
  }
}
