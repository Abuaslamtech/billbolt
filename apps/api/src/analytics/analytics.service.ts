import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { cycleKey, formatYMD, parseDateSafe } from 'src/common/utils/cycle.utils';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(businessId: string) {
    const now = new Date();
    const todayStr = formatYMD(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatYMD(yesterday);
    const currentCycle = cycleKey(now);

    const [
      todayReceiptAgg,
      yesterdayReceiptAgg,
      cycleReceiptAgg,
      totalReceiptsCount,
      uniqueCustomers,
      products,
      restockGroups,
      saleGroups,
    ] = await Promise.all([
      this.prisma.receipt.aggregate({
        where: { businessId, date: todayStr, isDeleted: false },
        _sum: { total: true },
      }),
      this.prisma.receipt.aggregate({
        where: { businessId, date: yesterdayStr, isDeleted: false },
        _sum: { total: true },
      }),
      this.prisma.receipt.aggregate({
        where: { businessId, cycle: currentCycle, isDeleted: false },
        _sum: { total: true },
      }),
      this.prisma.receipt.count({
        where: { businessId, isDeleted: false },
      }),
      this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT "customerName")::int as count
        FROM "Receipt"
        WHERE "businessId" = ${businessId} AND "isDeleted" = false
      `,
      this.prisma.product.findMany({
        where: { businessId },
        select: { id: true, openingStock: true, reorderLevel: true },
      }),
      this.prisma.restock.groupBy({
        by: ['productId'],
        where: { businessId },
        _sum: { qty: true },
      }),
      this.prisma.sale.groupBy({
        by: ['productId'],
        where: { businessId },
        _sum: { qty: true },
      }),
    ]);

    // Today's sales
    const todaySales = todayReceiptAgg._sum.total ?? 0;

    // Yesterday's sales
    const yesterdaySales = yesterdayReceiptAgg._sum.total ?? 0;

    let todaySalesGrowth = 0;
    if (yesterdaySales > 0) {
      todaySalesGrowth = Math.round(
        ((todaySales - yesterdaySales) / yesterdaySales) * 100,
      );
    } else if (todaySales > 0) {
      todaySalesGrowth = 100;
    }

    // This cycle revenue
    const thisMonthRevenue = cycleReceiptAgg._sum.total ?? 0;

    // Unique customers count
    const totalCustomersCount = Number(uniqueCustomers[0]?.count ?? 0);

    // Stock alerts via O(1) Map lookups
    const restockMap = new Map(
      restockGroups.map((r) => [r.productId, r._sum.qty ?? 0]),
    );
    const saleMap = new Map(
      saleGroups.map((s) => [s.productId, s._sum.qty ?? 0]),
    );

    let needReorderCount = 0;
    let outOfStockCount = 0;

    for (const p of products) {
      const currentStock =
        p.openingStock + (restockMap.get(p.id) ?? 0) - (saleMap.get(p.id) ?? 0);

      if (currentStock <= 0) outOfStockCount++;
      else if (currentStock <= p.reorderLevel) needReorderCount++;
    }

    return {
      todaySales,
      yesterdaySales,
      todaySalesGrowth,
      thisMonthRevenue,
      totalReceiptsCount,
      totalCustomersCount,
      needReorderCount,
      outOfStockCount,
      currentCycle,
    };
  }

  async getTopProducts(businessId: string) {
    const salesByProduct = await this.prisma.sale.groupBy({
      by: ['productId', 'productName'],
      where: { businessId },
      _sum: { qty: true, revenue: true, cost: true, profit: true },
      orderBy: {
        _sum: {
          revenue: 'desc',
        },
      },
      take: 20,
    });

    if (salesByProduct.length === 0) return [];

    const topProductIds = salesByProduct.map((s) => s.productId);

    const [restocksByProduct, products] = await Promise.all([
      this.prisma.restock.groupBy({
        by: ['productId'],
        where: { businessId, productId: { in: topProductIds } },
        _sum: { qty: true },
      }),
      this.prisma.product.findMany({
        where: { businessId, id: { in: topProductIds } },
        select: {
          id: true,
          category: true,
          openingStock: true,
          reorderLevel: true,
        },
      }),
    ]);

    const restockMap = new Map(
      restocksByProduct.map((r) => [r.productId, r._sum.qty ?? 0]),
    );
    const productMetaMap = new Map(products.map((p) => [p.id, p]));

    return salesByProduct.map((s) => {
      const p = productMetaMap.get(s.productId);
      const totalUnitsSold = s._sum.qty ?? 0;
      const totalRevenue = s._sum.revenue ?? 0;
      const totalCost = s._sum.cost ?? 0;
      const totalProfit = s._sum.profit ?? 0;

      const totalRestocked = restockMap.get(s.productId) ?? 0;
      const openingStock = p?.openingStock ?? 0;
      const reorderLevel = p?.reorderLevel ?? 0;
      const currentStock = openingStock + totalRestocked - totalUnitsSold;

      const status =
        currentStock <= 0
          ? 'Out of Stock'
          : currentStock <= reorderLevel
            ? 'Low Stock'
            : 'In Stock';

      const margin =
        totalRevenue > 0
          ? Math.round((totalProfit / totalRevenue) * 100)
          : null;

      return {
        productId: s.productId,
        productName: s.productName,
        category: p?.category ?? null,
        totalUnitsSold,
        totalRevenue,
        totalCost,
        totalProfit,
        currentStock,
        status,
        margin,
      };
    });
  }

  async getCycleSummaries(businessId: string) {
    const [salesByCycle, restocksByCycle] = await Promise.all([
      this.prisma.sale.groupBy({
        by: ['cycle'],
        where: { businessId },
        _sum: { revenue: true, cost: true, profit: true, qty: true },
      }),
      this.prisma.restock.groupBy({
        by: ['cycle'],
        where: { businessId },
        _sum: { totalCost: true },
      }),
    ]);

    const restockCostMap = new Map(
      restocksByCycle.map((r) => [r.cycle, r._sum.totalCost ?? 0]),
    );

    const allCycles = Array.from(
      new Set([
        ...salesByCycle.map((s) => s.cycle),
        ...restocksByCycle.map((r) => r.cycle),
      ]),
    );

    const fmtDate = (s: string) => {
      const d = parseDateSafe(s);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
    };

    const salesMap = new Map(salesByCycle.map((s) => [s.cycle, s]));

    return allCycles
      .sort((a, b) => b.localeCompare(a)) // newest first
      .map((cycle) => {
        const s = salesMap.get(cycle);
        const revenue = s?._sum.revenue ?? 0;
        const cost = s?._sum.cost ?? 0;
        const profit = s?._sum.profit ?? 0;
        const unitsSold = s?._sum.qty ?? 0;
        const restockSpend = restockCostMap.get(cycle) ?? 0;

        const parts = cycle.split('_');
        const label =
          parts.length === 2
            ? `${fmtDate(parts[0])} – ${fmtDate(parts[1])}, ${parseDateSafe(parts[1]).getFullYear()}`
            : cycle;
        const margin =
          revenue > 0 ? Math.round((profit / revenue) * 100) : null;

        return {
          cycle,
          label,
          revenue,
          cost,
          profit,
          restockSpend,
          unitsSold,
          margin,
        };
      });
  }
}
