import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@UseGuards(JwtAuthGuard)
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  /** Create new business for currently logged-in user */
  @Post()
  create(
    @Body() createBusinessDto: CreateBusinessDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.businessService.create(createBusinessDto, user.sub);
  }

  /** Upload or update business logo */
  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  uploadLogo(
    @UploadedFile() logo: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    if (!logo) {
      throw new BadRequestException('No logo file uploaded');
    }
    return this.businessService.uploadLogo(logo, user.sub);
  }

  /** Get current authenticated user's business profile */
  @Get('me')
  getMyBusiness(@GetUser() user: JwtPayload) {
    return this.businessService.getMyBusiness(user.sub);
  }

  /** Update current authenticated user's business profile */
  @Patch('me')
  updateMyBusiness(
    @Body() updateBusinessDto: UpdateBusinessDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.businessService.updateMyBusiness(user.sub, updateBusinessDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }
}
