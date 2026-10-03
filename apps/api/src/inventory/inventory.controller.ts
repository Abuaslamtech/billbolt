import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { PrismaService } from 'prisma/prisma.service';
import { resolveBusinessId } from 'src/common/utils/business.utils';
import {
  CreateProductDto,
  CreateRestockDto,
  UpdateProductDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Products ────────────────────────────────────────────────────────────────

  /** All products with computed stock levels for the authenticated business */
  @Get('products')
  async getProductsWithStock(@GetUser() user: JwtPayload) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.inventoryService.getProductsWithStock(businessId);
  }

  /** Create a new product */
  @Post('products')
  async createProduct(
    @GetUser() user: JwtPayload,
    @Body() dto: CreateProductDto,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.inventoryService.createProduct(businessId, dto);
  }

  /** Update product details (pricing, reorder level, etc.) */
  @Patch('products/:id')
  async updateProduct(
    @GetUser() user: JwtPayload,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.inventoryService.updateProduct(productId, businessId, dto);
  }

  // ─── Restocks ────────────────────────────────────────────────────────────────

  /** All restock records for the authenticated business */
  @Get('restocks')
  async getRestocks(
    @GetUser() user: JwtPayload,
    @Query('limit') limit = '100',
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.inventoryService.getRestocks(businessId, +limit);
  }

  /** Log a new restock for a product */
  @Post('restocks')
  async createRestock(
    @GetUser() user: JwtPayload,
    @Body() dto: CreateRestockDto,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.inventoryService.createRestock(businessId, dto);
  }
}
