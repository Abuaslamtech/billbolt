import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** Executive Platform Overview & KPI Aggregates */
  async getDashboardMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalMerchants,
      totalReceipts,
      totalProducts,
      todayReceipts,
      allReceiptsTotal,
      recentReceipts,
      businesses,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.business.count(),
      this.prisma.receipt.count({ where: { isDeleted: false } }),
      this.prisma.product.count(),
      this.prisma.receipt.findMany({
        where: { createdAt: { gte: today }, isDeleted: false },
        select: { total: true },
      }),
      this.prisma.receipt.aggregate({
        where: { isDeleted: false },
        _sum: { total: true },
      }),
      this.prisma.receipt.findMany({
        where: { isDeleted: false },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, currency: true } },
          items: {
            take: 4,
          },
        },
      }),
      this.prisma.business.findMany({
        select: {
          id: true,
          name: true,
          currency: true,
          _count: { select: { receipts: true, products: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue = allReceiptsTotal._sum.total ?? 0;
    const todayRevenue = todayReceipts.reduce((sum, r) => sum + r.total, 0);

    // Compute payment method distribution
    const paymentMethods = await this.prisma.receipt.groupBy({
      by: ['paymentMethod'],
      where: { isDeleted: false },
      _sum: { total: true },
      _count: { id: true },
    });

    const paymentBreakdown = {
      cash: 0,
      transfer: 0,
      card: 0,
      other: 0,
    };

    for (const p of paymentMethods) {
      const method = p.paymentMethod?.toLowerCase() || '';
      const amount = p._sum.total ?? 0;
      if (method.includes('cash')) paymentBreakdown.cash += amount;
      else if (method.includes('transfer')) paymentBreakdown.transfer += amount;
      else if (method.includes('card')) paymentBreakdown.card += amount;
      else paymentBreakdown.other += amount;
    }

    return {
      totalPlatformRevenue: totalRevenue,
      todayRevenue,
      todayReceiptsCount: todayReceipts.length,
      totalReceiptsCount: totalReceipts,
      totalMerchantsCount: totalMerchants,
      totalProductsCount: totalProducts,
      totalUsersCount: totalUsers,
      paymentBreakdown,
      recentReceipts,
      topMerchants: businesses,
    };
  }

  /** Platform Merchants Directory */
  async getMerchants(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { owner: { fullName: { contains: q, mode: 'insensitive' } } },
        { owner: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              receipts: true,
              products: true,
              stores: true,
            },
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    // Calculate revenue for each merchant
    const merchantIds = items.map((m) => m.id);
    const revenueStats = await this.prisma.receipt.groupBy({
      by: ['businessId'],
      where: { businessId: { in: merchantIds }, isDeleted: false },
      _sum: { total: true },
    });

    const revenueMap = new Map<string, number>();
    revenueStats.forEach((r) => {
      revenueMap.set(r.businessId, r._sum.total ?? 0);
    });

    const enrichedItems = items.map((b) => ({
      ...b,
      totalRevenue: revenueMap.get(b.id) ?? 0,
    }));

    return {
      items: enrichedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Global Receipts Ledger */
  async getReceipts(params: {
    search?: string;
    businessId?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, businessId, paymentMethod, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (businessId && businessId !== 'ALL') {
      where.businessId = businessId;
    }
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod as any;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { receiptNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { business: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, currency: true } },
          items: true,
        },
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Global Inventory Catalog */
  async getInventory(params: {
    search?: string;
    businessId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, businessId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (businessId && businessId !== 'ALL') {
      where.businessId = businessId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { qrCode: { contains: q, mode: 'insensitive' } },
        { business: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, currency: true } },
          storeStocks: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** System Infrastructure Health */
  async getSystemHealth() {
    const startTime = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    const [usersCount, merchantsCount, receiptsCount, productsCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.business.count(),
        this.prisma.receipt.count({ where: { isDeleted: false } }),
        this.prisma.product.count(),
      ]);

    return {
      status: 'OPERATIONAL',
      database: 'CONNECTED',
      dbLatencyMs,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      stats: {
        usersCount,
        merchantsCount,
        receiptsCount,
        productsCount,
      },
    };
  }
}
