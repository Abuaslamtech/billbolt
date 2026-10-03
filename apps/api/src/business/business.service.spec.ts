import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

describe('BusinessService', () => {
  let service: BusinessService;

  let prisma: {
    business: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      business: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: AuthService,
          useValue: {
            buildAuthResponse: jest.fn().mockResolvedValue({
              accessToken: 'mock_access_token',
              refreshToken: 'mock_refresh_token',
              user: { id: 'u1', email: 'test@example.com' },
            }),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create business and update user in a transaction', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        business: null,
        phone: null,
      });
      prisma.user.findFirst.mockResolvedValue(null); // phone not taken
      prisma.business.create.mockResolvedValue({ id: 'b1', name: 'Shop 1' });

      const res = await service.create(
        { name: 'Shop 1', phone: '08012345678' },
        'u1',
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(res).toHaveProperty('success', true);
    });

    it('should throw ConflictException if phone is already taken by another user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        business: null,
        phone: null,
      });
      prisma.user.findFirst.mockResolvedValue({
        id: 'u2',
        phone: '08012345678',
      }); // phone taken

      await expect(
        service.create({ name: 'Shop 1', phone: '08012345678' }, 'u1'),
      ).rejects.toThrow('An account with this phone number already exists');
    });
  });
});
