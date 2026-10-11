import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('merchants')
  getMerchants(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.getMerchants(search, +page, +limit);
  }

  @Get('receipts')
  getReceipts(
    @Query('search') search?: string,
    @Query('businessId') businessId?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.getReceipts({
      search,
      businessId,
      paymentMethod,
      page: +page,
      limit: +limit,
    });
  }

  @Get('inventory')
  getInventory(
    @Query('search') search?: string,
    @Query('businessId') businessId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.getInventory({
      search,
      businessId,
      page: +page,
      limit: +limit,
    });
  }

  @Get('system')
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
}
