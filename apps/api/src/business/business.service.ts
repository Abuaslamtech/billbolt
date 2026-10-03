import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Express } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /** Create business for authenticated user and return fresh tokens with businessId */
  async create(data: CreateBusinessDto, userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.business) {
      throw new ConflictException('User already has a registered business');
    }

    // Prevent phone collision if assigning new phone to user
    if (data.phone && !user.phone) {
      const existingPhone = await this.prismaService.user.findFirst({
        where: { phone: data.phone, NOT: { id: user.id } },
      });
      if (existingPhone) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    const newBusiness = await this.prismaService.$transaction(async (tx) => {
      const created = await tx.business.create({
        data: {
          name: data.name,
          type: data.type,
          address: data.address,
          phone: data.phone || user.phone,
          email: data.email || user.email,
          currency: data.currency || 'NGN',
          logoUrl: data.logoUrl || null,
          ownerId: user.id,
        },
      });

      // Update user phone if provided
      if (data.phone && !user.phone) {
        await tx.user.update({
          where: { id: user.id },
          data: { phone: data.phone },
        });
      }

      return created;
    });

    const auth = await this.authService.buildAuthResponse(user.id);

    return {
      success: true,
      message: 'Business created successfully',
      ...auth,
      business: newBusiness,
    };
  }

  /** Get authenticated user's business */
  async getMyBusiness(userId: string) {
    const business = await this.prismaService.business.findUnique({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException('No business found for this user');
    }

    return business;
  }

  /** Update authenticated user's business */
  async updateMyBusiness(userId: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.prismaService.business.findUnique({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException('No business found for this user');
    }

    return this.prismaService.business.update({
      where: { id: business.id },
      data: updateBusinessDto,
    });
  }

  async findOne(id: string, userId: string) {
    const business = await this.prismaService.business.findFirst({
      where: { id, ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException('Business not found or unauthorized');
    }

    return business;
  }

  async remove(id: string, userId: string) {
    const business = await this.prismaService.business.findFirst({
      where: { id, ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException('Business not found or unauthorized');
    }

    return this.prismaService.business.delete({
      where: { id },
    });
  }

  /** Upload business logo to Cloudinary */
  async uploadLogo(logo: Express.Multer.File, userId: string) {
    if (!logo || !userId) {
      throw new BadRequestException('Invalid file or user ID');
    }

    const business = await this.prismaService.business.findUnique({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException('Business not found for this user');
    }

    try {
      const result = await this.cloudinaryService.uploadImage(
        logo,
        `business_logo/${business.id}`,
        {
          publicId: 'logo',
          overwrite: true,
          transformation: [
            { width: 600, height: 600, crop: 'limit', quality: 'auto' },
          ],
        },
      );

      const updated = await this.prismaService.business.update({
        where: { id: business.id },
        data: { logoUrl: result.secure_url },
      });

      return {
        success: true,
        logoUrl: updated.logoUrl,
        message: 'Store logo uploaded successfully',
      };
    } catch (error) {
      console.error('Store logo upload error:', error);
      throw new BadRequestException('Failed to upload store logo');
    }
  }
}
