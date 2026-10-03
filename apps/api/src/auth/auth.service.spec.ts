import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    refreshToken: {
      deleteMany: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      refreshToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
        findUnique: jest.fn(),
        delete: jest.fn().mockResolvedValue({ id: 'rt-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_access_token'),
          },
        },
        {
          provide: GoogleAuthService,
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refresh', () => {
    it('should hash incoming raw token with SHA-256 and query database with hash', async () => {
      const rawToken = 'raw_client_refresh_token_xyz_123';
      const expectedHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: expectedHash,
        userId: 'user-123',
        expiresAt: futureDate,
        user: { id: 'user-123', isActive: true },
      });

      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        business: { id: 'biz-1' },
        role: 'OWNER',
      });

      const response = await service.refresh({ refreshToken: rawToken });

      // Verify that database was queried with the SHA-256 hash, NOT raw token
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: expectedHash },
        include: { user: true },
      });

      expect(response).toHaveProperty('accessToken', 'mock_access_token');
      expect(response).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user account is disabled (isActive: false)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-disabled',
        token: crypto.createHash('sha256').update('some_token').digest('hex'),
        userId: 'user-disabled',
        expiresAt: futureDate,
        user: { id: 'user-disabled', isActive: false },
      });

      await expect(
        service.refresh({ refreshToken: 'some_token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not exist in DB', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh({ refreshToken: 'nonexistent-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException and delete expired token', async () => {
      const expiredDate = new Date(Date.now() - 1000 * 60); // 1 min ago
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-expired',
        token: 'hashed',
        userId: 'user-123',
        expiresAt: expiredDate,
      });

      await expect(
        service.refresh({ refreshToken: 'expired-token' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-expired' },
      });
    });
  });

  describe('logout', () => {
    it('should purge all refresh tokens for the user', async () => {
      const res = await service.logout('user-123');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(res).toEqual({ message: 'Logged out successfully' });
    });
  });
});
