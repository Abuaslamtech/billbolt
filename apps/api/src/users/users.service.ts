import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Express } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /** Upload user avatar by JWT userId */
  async uploadAvatarByUserId(avatar: Express.Multer.File, userId: string) {
    if (!avatar || !userId) {
      throw new BadRequestException('Invalid file or user ID');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const result = await this.cloudinaryService.uploadImage(
        avatar,
        `avatar/${user.id}`,
        {
          publicId: 'avatar',
          overwrite: true,
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
          ],
        },
      );

      await this.prismaService.user.update({
        where: { id: userId },
        data: { avatarUrl: result.secure_url },
      });

      return {
        success: true,
        avatarUrl: result.secure_url,
        message: 'Avatar uploaded successfully',
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  /** Get user profile safely excluding passwordHash */
  async getProfileByUserId(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        googleId: true,
        firebaseUid: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        credit: true,
        createdAt: true,
        updatedAt: true,
        business: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }
}
