import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { PrismaService } from 'prisma/prisma.service';
import { resolveBusinessId } from 'src/common/utils/business.utils';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { StoresService } from './stores.service';

@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly prisma: PrismaService,
  ) {}

  /** List all stores for the authenticated business */
  @Get()
  async getStores(@GetUser() user: JwtPayload) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.storesService.getStores(businessId);
  }

  /** Create a new store */
  @Post()
  async createStore(
    @GetUser() user: JwtPayload,
    @Body() dto: CreateStoreDto,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.storesService.createStore(businessId, dto);
  }

  /** Update store */
  @Patch(':id')
  async updateStore(
    @GetUser() user: JwtPayload,
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.storesService.updateStore(businessId, storeId, dto);
  }

  /** Delete a store */
  @Delete(':id')
  async deleteStore(
    @GetUser() user: JwtPayload,
    @Param('id') storeId: string,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.storesService.deleteStore(businessId, storeId);
  }
}
