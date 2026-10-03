import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from 'prisma/prisma.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { resolveBusinessId } from 'src/common/utils/business.utils';
import { SyncBatchDto } from './dto/sync.dto';
import { SyncService } from './sync.service';

@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Process offline batch sync payload atomically.
   */
  @Post()
  async syncBatch(
    @GetUser() user: JwtPayload,
    @Body() dto: SyncBatchDto,
  ) {
    const businessId = await resolveBusinessId(this.prisma, user);
    return this.syncService.syncBatch(dto, user.sub, businessId);
  }
}
