import { Module } from '@nestjs/common';
import { RestocksController } from './restocks.controller';
import { RestocksService } from './restocks.service';

@Module({
  controllers: [RestocksController],
  providers: [RestocksService],
})
export class RestocksModule {}
