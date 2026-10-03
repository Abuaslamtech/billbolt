import {
  Controller,
  Get,
  Post,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Get profile of the currently authenticated user */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: JwtPayload) {
    return this.usersService.getProfileByUserId(user.sub);
  }

  /** Upload avatar for the currently authenticated user */
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException(
              'Only JPG, PNG, and WebP image files are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadUserAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    if (!avatar) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.uploadAvatarByUserId(avatar, user.sub);
  }
}
