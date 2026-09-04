import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(ApiKeyGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('dashboard')
  dashboard() {
    return this.analytics.dashboard();
  }

  @Get('monthly')
  monthly() {
    return this.analytics.monthly();
  }

  @Get('quarterly')
  quarterly() {
    return this.analytics.grouped(3);
  }

  @Get('half-yearly')
  halfYearly() {
    return this.analytics.grouped(6);
  }

  @Get('annual')
  annual() {
    return this.analytics.grouped(12);
  }

  @Get('product-performance')
  productPerformance() {
    return this.analytics.productPerformance();
  }
}
