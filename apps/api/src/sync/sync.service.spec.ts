import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  let service: SyncService;
  let txMock: any;
  let prisma: {
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    txMock = {
      product: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      restock: {
        create: jest.fn(),
      },
      receipt: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      sale: {
        createMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ fullName: 'Owner User' }),
      },
    };

    prisma = {
      $transaction: jest.fn(async (cb: (tx: any) => Promise<any>) => cb(txMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if businessId is missing', async () => {
    await expect(service.syncBatch({}, 'user_1', '')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should atomically sync products, restocks, and receipts with temp ID resolution', async () => {
    txMock.product.findFirst.mockResolvedValueOnce(null); // qrCode check
    txMock.product.create.mockResolvedValueOnce({
      id: 'server_prod_1',
      name: 'Milk',
      sellingPrice: 1000,
      costPrice: 800,
    });

    // For restock lookup
    txMock.product.findFirst.mockResolvedValueOnce({
      id: 'server_prod_1',
      name: 'Milk',
      costPrice: 800,
    });
    txMock.restock.create.mockResolvedValueOnce({ id: 'restock_1' });
    txMock.product.update.mockResolvedValueOnce({ id: 'server_prod_1' });

    // For receipt lookup
    txMock.receipt.findFirst.mockResolvedValueOnce(null); // not existing yet
    txMock.product.findMany.mockResolvedValueOnce([
      {
        id: 'server_prod_1',
        name: 'Milk',
        sellingPrice: 1000,
        costPrice: 800,
      },
    ]);
    txMock.receipt.create.mockResolvedValueOnce({ id: 'rcpt_1' });
    txMock.sale.createMany.mockResolvedValueOnce({ count: 1 });

    const result = await service.syncBatch(
      {
        products: [
          {
            clientTempId: 'temp_p1',
            name: 'Milk',
            costPrice: 800,
            sellingPrice: 1000,
            openingStock: 10,
            reorderLevel: 2,
            qrCode: 'BAR_123',
          },
        ],
        restocks: [
          {
            clientTempId: 'temp_r1',
            productId: 'temp_p1', // references temp ID from same batch
            qty: 5,
            costPerUnit: 800,
          },
        ],
        receipts: [
          {
            receiptNumber: 'RCP-101',
            customerName: 'John',
            date: '2026-09-10T10:00:00Z',
            items: [{ productId: 'temp_p1', qty: 2 }],
          },
        ],
      },
      'owner_1',
      'biz_1',
    );

    expect(result.success).toBe(true);
    expect(result.syncedProductIds).toEqual({ temp_p1: 'server_prod_1' });
    expect(result.syncedRestockTempIds).toEqual(['temp_r1']);
    expect(result.syncedReceiptNumbers).toEqual(['RCP-101']);
    expect(txMock.product.create).toHaveBeenCalledTimes(1);
    expect(txMock.restock.create).toHaveBeenCalledTimes(1);
    expect(txMock.receipt.create).toHaveBeenCalledTimes(1);
    expect(txMock.sale.createMany).toHaveBeenCalledTimes(1);
  });

  it('should acknowledge already synced receipts without creating duplicates (idempotency)', async () => {
    txMock.receipt.findFirst.mockResolvedValueOnce({
      id: 'existing_rcpt_1',
      receiptNumber: 'RCP-101',
    });

    const result = await service.syncBatch(
      {
        receipts: [
          {
            receiptNumber: 'RCP-101',
            customerName: 'John',
            date: '2026-09-10T10:00:00Z',
            items: [{ productId: 'prod_1', qty: 2 }],
          },
        ],
      },
      'owner_1',
      'biz_1',
    );

    expect(result.success).toBe(true);
    expect(result.syncedReceiptNumbers).toEqual(['RCP-101']);
    expect(txMock.receipt.create).not.toHaveBeenCalled();
    expect(txMock.sale.createMany).not.toHaveBeenCalled();
  });
});
