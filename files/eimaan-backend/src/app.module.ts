import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { RestocksModule } from './restocks/restocks.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [PrismaModule, ProductsModule, SalesModule, RestocksModule, AnalyticsModule],
})
export class AppModule {}
