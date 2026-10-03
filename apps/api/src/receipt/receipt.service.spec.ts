import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptService } from './receipt.service';
import { generateReceiptNumber } from './utils/receipt.utils';
import { cycleKey } from 'src/common/utils/cycle.utils';
import { PrismaService } from 'prisma/prisma.service';

describe('ReceiptService', () => {
  let service: ReceiptService;
  let prisma: {
    receipt: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    product: {
      findMany: jest.Mock;
    };
    sale: {
      findMany: jest.Mock;
      createMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      receipt: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ fullName: 'Alice Staff' }),
      },
      sale: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((arg: unknown) => {
        if (Array.isArray(arg)) return Promise.all(arg);
        if (typeof arg === 'function')
          return (arg as (tx: typeof prisma) => unknown)(prisma);
        return Promise.resolve(arg);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReceiptService>(ReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReceiptNumber', () => {
    it('should generate receipt number formatted as BB-YYMMDD-XXXXXXXX', () => {
      const fixedDate = new Date('2026-03-15T10:00:00Z');
      const receiptNo = generateReceiptNumber(fixedDate);

      // Verify format: BB-YYMMDD-XXXXXXXX where X is 8 hex characters (4 bytes)
      expect(receiptNo).toMatch(/^BB-260315-[0-9A-F]{8}$/);
    });

    it('should generate unique values across consecutive calls', () => {
      const numbers = new Set<string>();
      for (let i = 0; i < 50; i++) {
        numbers.add(generateReceiptNumber());
      }
      expect(numbers.size).toBe(50);
    });
  });

  describe('cycleKey', () => {
    it('should compute cycle key for dates on or after the 14th', () => {
      const date = new Date('2026-03-15T12:00:00Z');
      const key = cycleKey(date);
      expect(key).toContain('_');
      const [start, end] = key.split('_');
      expect(start).toContain('-14');
      expect(end).toContain('-13');
    });

    it('should compute cycle key for dates before the 14th', () => {
      const date = new Date('2026-03-10T12:00:00Z');
      const key = cycleKey(date);
      expect(key).toContain('_');
      const [start, end] = key.split('_');
      expect(start).toContain('-14');
      expect(end).toContain('-13');
    });
  });

  describe('createReceipt idempotency', () => {
    it('should return existing receipt when receiptNumber is already registered for business', async () => {
      const mockReceipt = {
        id: 'rcpt_123',
        receiptNumber: 'BB-260315-A1B2C3D4',
        businessId: 'biz_1',
        total: 1000,
        items: [],
      };
      prisma.receipt.findFirst.mockResolvedValue(mockReceipt);

      const result = await service.createReceipt(
        {
          customerName: 'Alice',
          receiptNumber: 'BB-260315-A1B2C3D4',
          items: [{ productId: 'prod_1', qty: 1 }],
          date: '2026-03-15T10:00:00Z',
        },
        'user_1',
        'biz_1',
      );

      expect(result).toBe(mockReceipt);
      expect(prisma.receipt.findFirst).toHaveBeenCalledWith({
        where: { businessId: 'biz_1', receiptNumber: 'BB-260315-A1B2C3D4' },
        include: { items: true },
      });
      // Should NOT attempt database transaction
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteReceipt', () => {
    it('should mark receipt as deleted and delete associated sales in a transaction', async () => {
      const mockReceipt = {
        id: 'rcpt_99',
        businessId: 'biz_1',
        isDeleted: false,
      };
      prisma.receipt.findFirst.mockResolvedValue(mockReceipt);

      const res = await service.softDeleteReceipt('rcpt_99', 'biz_1');

      expect(prisma.receipt.findFirst).toHaveBeenCalledWith({
        where: { id: 'rcpt_99', businessId: 'biz_1' },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(res).toEqual({ message: 'Receipt deleted' });
    });
  });

  describe('getSales', () => {
    it('should cap limit at 100 and query database with take', async () => {
      prisma.sale.findMany.mockResolvedValue([]);

      await service.getSales('biz_1', 500);

      expect(prisma.sale.findMany).toHaveBeenCalledWith({
        where: { businessId: 'biz_1' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('createReceipt product query', () => {
    it('should query only products included in items list', async () => {
      prisma.receipt.findFirst.mockResolvedValue(null);
      prisma.product.findMany.mockResolvedValue([
        { id: 'prod_1', name: 'Item 1', costPrice: 10, sellingPrice: 20 },
      ]);
      prisma.receipt.create = jest
        .fn()
        .mockResolvedValue({ id: 'r1', items: [] });
      prisma.sale.createMany = jest.fn().mockResolvedValue({ count: 1 });

      await service.createReceipt(
        {
          customerName: 'Bob',
          items: [{ productId: 'prod_1', qty: 2 }],
          date: '2026-03-15T10:00:00Z',
        },
        'user_1',
        'biz_1',
      );

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { businessId: 'biz_1', id: { in: ['prod_1'] } },
      });
    });
  });
});
