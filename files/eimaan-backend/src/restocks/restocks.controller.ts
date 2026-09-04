import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { CreateRestockDto } from './dto/create-restock.dto';
import { RestocksService } from './restocks.service';

@Controller('restocks')
@UseGuards(ApiKeyGuard)
export class RestocksController {
  constructor(private restocks: RestocksService) {}

  @Post()
  create(@Body() dto: CreateRestockDto) {
    return this.restocks.create(dto);
  }
}
