import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { InventoryModule } from './inventory/inventory.module';
import { ReceiptModule } from './receipt/receipt.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    CloudinaryModule,
    AuthModule,
    UsersModule,
    BusinessModule,
    ReceiptModule,
    InventoryModule,
    AnalyticsModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
