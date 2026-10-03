import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from 'prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    receipt: {
      aggregate: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
    sale: {
      groupBy: jest.Mock;
    };
    restock: {
      groupBy: jest.Mock;
    };
    product: {
      findMany: jest.Mock;
    };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      receipt: {
        aggregate: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      sale: {
        groupBy: jest.fn(),
      },
      restock: {
        groupBy: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should aggregate metrics from database queries', async () => {
      prisma.receipt.aggregate
        .mockResolvedValueOnce({ _sum: { total: 5000 } }) // today
        .mockResolvedValueOnce({ _sum: { total: 4000 } }) // yesterday
        .mockResolvedValueOnce({ _sum: { total: 25000 } }); // cycle
      prisma.receipt.count.mockResolvedValue(45);
      prisma.$queryRaw.mockResolvedValue([{ count: 2 }]);
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', openingStock: 5, reorderLevel: 10 },
      ]);
      prisma.restock.groupBy.mockResolvedValue([
        { productId: 'p1', _sum: { qty: 0 } },
      ]);
      prisma.sale.groupBy.mockResolvedValue([
        { productId: 'p1', _sum: { qty: 2 } },
      ]);

      const result = await service.getDashboardMetrics('biz_1');

      expect(result.todaySales).toBe(5000);
      expect(result.yesterdaySales).toBe(4000);
      expect(result.todaySalesGrowth).toBe(25); // ((5000 - 4000) / 4000) * 100
      expect(result.thisMonthRevenue).toBe(25000);
      expect(result.totalReceiptsCount).toBe(45);
      expect(result.totalCustomersCount).toBe(2);
      expect(result.needReorderCount).toBe(1); // 5 - 2 = 3 <= 10
      expect(result.outOfStockCount).toBe(0);
    });
  });

  describe('getTopProducts', () => {
    it('should return top products sorted by revenue from groupBy aggregations', async () => {
      prisma.sale.groupBy.mockResolvedValue([
        {
          productId: 'p2',
          productName: 'Butter',
          _sum: { qty: 10, revenue: 15000, cost: 9000, profit: 6000 },
        },
        {
          productId: 'p1',
          productName: 'Bread',
          _sum: { qty: 20, revenue: 10000, cost: 6000, profit: 4000 },
        },
      ]);
      prisma.restock.groupBy.mockResolvedValue([]);
      prisma.product.findMany.mockResolvedValue([
        { id: 'p2', category: 'Dairy', openingStock: 20, reorderLevel: 5 },
        { id: 'p1', category: 'Bakery', openingStock: 50, reorderLevel: 10 },
      ]);

      const result = await service.getTopProducts('biz_1');

      expect(prisma.sale.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['productId', 'productName'],
          where: { businessId: 'biz_1' },
          orderBy: { _sum: { revenue: 'desc' } },
          take: 20,
        }),
      );

      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe('p2');
      expect(result[0].totalRevenue).toBe(15000);
      expect(result[0].margin).toBe(40); // (6000 / 15000) * 100
      expect(result[1].productId).toBe('p1');
      expect(result[1].totalRevenue).toBe(10000);
      expect(result[1].margin).toBe(40); // (4000 / 10000) * 100
    });
  });
});
