import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { resolveBusinessId } from './business.utils';

describe('resolveBusinessId', () => {
  let mockPrisma: {
    business: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      business: {
        findUnique: jest.fn(),
      },
    };
  });

  it('should return businessId immediately if present in jwt payload', async () => {
    const user: JwtPayload = {
      sub: 'user_1',
      email: 'test@example.com',
      businessId: 'biz_123',
      role: 'USER',
    };

    const result = await resolveBusinessId(
      mockPrisma as unknown as PrismaService,
      user,
    );

    expect(result).toBe('biz_123');
    expect(mockPrisma.business.findUnique).not.toHaveBeenCalled();
  });

  it('should look up business by ownerId if businessId is empty in jwt payload', async () => {
    const user: JwtPayload = {
      sub: 'user_2',
      email: 'test2@example.com',
      businessId: '',
      role: 'USER',
    };

    mockPrisma.business.findUnique.mockResolvedValue({ id: 'biz_found_456' });

    const result = await resolveBusinessId(
      mockPrisma as unknown as PrismaService,
      user,
    );

    expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
      where: { ownerId: 'user_2' },
      select: { id: true },
    });
    expect(result).toBe('biz_found_456');
  });

  it('should throw BadRequestException if business does not exist for owner', async () => {
    const user: JwtPayload = {
      sub: 'user_no_store',
      email: 'nostore@example.com',
      businessId: '',
      role: 'USER',
    };

    mockPrisma.business.findUnique.mockResolvedValue(null);

    await expect(
      resolveBusinessId(mockPrisma as unknown as PrismaService, user),
    ).rejects.toThrow(BadRequestException);
  });
});
