import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from 'prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: {
    product: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    restock: {
      findMany: jest.Mock;
      groupBy: jest.Mock;
      create: jest.Mock;
    };
    sale: {
      groupBy: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      restock: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
        create: jest.fn(),
      },
      sale: {
        groupBy: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductsWithStock', () => {
    it('should compute stock accurately using groupBy aggregations', async () => {
      const mockProducts = [
        {
          id: 'prod_1',
          name: 'Bread',
          openingStock: 10,
          reorderLevel: 5,
          qrCode: '123456',
        },
        {
          id: 'prod_2',
          name: 'Milk',
          openingStock: 2,
          reorderLevel: 5,
          qrCode: null,
        },
      ];

      prisma.product.findMany.mockResolvedValue(mockProducts);
      prisma.restock.groupBy.mockResolvedValue([
        { productId: 'prod_1', _sum: { qty: 20 } },
      ]);
      prisma.sale.groupBy.mockResolvedValue([
        { productId: 'prod_1', _sum: { qty: 15 } },
        { productId: 'prod_2', _sum: { qty: 2 } },
      ]);

      const result = await service.getProductsWithStock('biz_1');

      expect(prisma.restock.groupBy).toHaveBeenCalledWith({
        by: ['productId'],
        where: { businessId: 'biz_1' },
        _sum: { qty: true },
      });
      expect(prisma.sale.groupBy).toHaveBeenCalledWith({
        by: ['productId'],
        where: { businessId: 'biz_1' },
        _sum: { qty: true },
      });

      // prod_1: 10 + 20 - 15 = 15 ('In Stock')
      expect(result[0].currentStock).toBe(15);
      expect(result[0].totalRestocked).toBe(20);
      expect(result[0].totalSold).toBe(15);
      expect(result[0].status).toBe('In Stock');

      // prod_2: 2 + 0 - 2 = 0 ('Out of Stock')
      expect(result[1].currentStock).toBe(0);
      expect(result[1].totalRestocked).toBe(0);
      expect(result[1].totalSold).toBe(2);
      expect(result[1].status).toBe('Out of Stock');
    });
  });

  describe('createRestock', () => {
    it('should create restock and atomically update Product.costPrice in a transaction', async () => {
      const mockProduct = {
        id: 'prod_1',
        name: 'Bread',
        costPrice: 50,
        sellingPrice: 100,
        businessId: 'biz_1',
      };
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.restock.create.mockResolvedValue({ id: 'rstk_1' });
      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        costPrice: 75,
      });

      await service.createRestock('biz_1', {
        productId: 'prod_1',
        qty: 10,
        costPerUnit: 75,
      });

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: 'prod_1', businessId: 'biz_1' },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
        data: { costPrice: 75 },
      });
    });
  });
});
