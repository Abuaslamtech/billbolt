import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { businessCycleStart, cycleLabel } from '../common/cycle.util';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // One row per cycle the business has ever had data for, revenue/cost/profit/units/restock spend.
  async monthly() {
    const sales = await this.prisma.sale.findMany({ select: { cycle: true, revenue: true, cost: true, profit: true, qty: true } });
    const restocks = await this.prisma.restock.findMany({ select: { cycle: true, totalCost: true } });

    const byCycle = new Map<string, any>();
    const key = (d: Date) => d.toISOString().slice(0, 10);

    for (const s of sales) {
      const k = key(s.cycle);
      const row = byCycle.get(k) ?? this.emptyRow(s.cycle);
      row.revenue += Number(s.revenue);
      row.cost += Number(s.cost);
      row.profit += Number(s.profit);
      row.unitsSold += s.qty;
      byCycle.set(k, row);
    }
    for (const r of restocks) {
      const k = key(r.cycle);
      const row = byCycle.get(k) ?? this.emptyRow(r.cycle);
      row.restockSpend += Number(r.totalCost);
      byCycle.set(k, row);
    }

    return Array.from(byCycle.values())
      .sort((a, b) => a.cycle.localeCompare(b.cycle))
      .map((r) => ({ ...r, margin: r.revenue > 0 ? r.profit / r.revenue : null }));
  }

  private emptyRow(cycle: Date) {
    const iso = cycle.toISOString().slice(0, 10);
    return {
      cycle: iso,
      label: cycleLabel(cycle),
      revenue: 0,
      cost: 0,
      profit: 0,
      unitsSold: 0,
      restockSpend: 0,
    };
  }

  // Groups the monthly rows into blocks of `size` cycles (3=quarter, 6=half, 12=annual)
  async grouped(size: number) {
    const rows = await this.monthly();
    const groups: any[] = [];
    for (let i = 0; i < rows.length; i += size) {
      const chunk = rows.slice(i, i + size);
      groups.push({
        periodCovered: `${chunk[0].label.split(' - ')[0]} - ${chunk[chunk.length - 1].label.split(' - ')[1]}`,
        revenue: sum(chunk, 'revenue'),
        cost: sum(chunk, 'cost'),
        profit: sum(chunk, 'profit'),
        unitsSold: sum(chunk, 'unitsSold'),
        margin: sum(chunk, 'revenue') > 0 ? sum(chunk, 'profit') / sum(chunk, 'revenue') : null,
      });
    }
    return groups;
  }

  async productPerformance() {
    const products = await this.prisma.product.findMany({ select: { id: true, name: true } });
    const sales = await this.prisma.sale.findMany({
      select: { productId: true, cycle: true, revenue: true, profit: true, qty: true },
    });

    return products.map((p) => {
      const mine = sales.filter((s) => s.productId === p.id);
      const byCycle = new Map<string, { revenue: number; profit: number; unitsSold: number }>();
      for (const s of mine) {
        const k = s.cycle.toISOString().slice(0, 10);
        const row = byCycle.get(k) ?? { revenue: 0, profit: 0, unitsSold: 0 };
        row.revenue += Number(s.revenue);
        row.profit += Number(s.profit);
        row.unitsSold += s.qty;
        byCycle.set(k, row);
      }
      return {
        product: p.name,
        totalRevenue: mine.reduce((a, s) => a + Number(s.revenue), 0),
        totalProfit: mine.reduce((a, s) => a + Number(s.profit), 0),
        totalUnitsSold: mine.reduce((a, s) => a + s.qty, 0),
        byCycle: Array.from(byCycle.entries()).map(([cycle, v]) => ({ cycle, ...v })),
      };
    });
  }

  async dashboard() {
    const [monthly, quarterly, half, annual, products] = await Promise.all([
      this.monthly(),
      this.grouped(3),
      this.grouped(6),
      this.grouped(12),
      this.prisma.product.findMany(),
    ]);

    const currentCycleKey = businessCycleStart(new Date()).toISOString().slice(0, 10);
    const currentMonthRow = monthly.find((r) => r.cycle === currentCycleKey) ?? null;
    const currentIndex = monthly.findIndex((r) => r.cycle === currentCycleKey);

    const currentQuarter = currentIndex >= 0 ? quarterly[Math.floor(currentIndex / 3)] ?? null : null;
    const currentHalf = currentIndex >= 0 ? half[Math.floor(currentIndex / 6)] ?? null : null;
    const currentYear = currentIndex >= 0 ? annual[Math.floor(currentIndex / 12)] ?? null : null;

    const totalProfit = monthly.reduce((a, r) => a + r.profit, 0);
    const totalRestockSpend = monthly.reduce((a, r) => a + r.restockSpend, 0);

    const withStock = await this.productsWithStock(products);
    const needReorder = withStock.filter((p) => p.status === 'REORDER').length;
    const outOfStock = withStock.filter((p) => p.status === 'OUT OF STOCK').length;

    return {
      thisCycle: currentMonthRow,
      thisQuarter: currentQuarter,
      thisHalfYear: currentHalf,
      thisYear: currentYear,
      totalProfitAllTime: totalProfit,
      totalRestockSpendAllTime: totalRestockSpend,
      productsTracked: products.length,
      needReorder,
      outOfStock,
    };
  }

  private async productsWithStock(products: { id: string; openingStock: number; reorderLevel: number }[]) {
    const results: { id: string; openingStock: number; reorderLevel: number; currentStock: number; status: string }[] = [];
    for (const p of products) {
      const [restocked, sold] = await Promise.all([
        this.prisma.restock.aggregate({ where: { productId: p.id }, _sum: { qty: true } }),
        this.prisma.sale.aggregate({ where: { productId: p.id }, _sum: { qty: true } }),
      ]);
      const currentStock = p.openingStock + (restocked._sum.qty ?? 0) - (sold._sum.qty ?? 0);
      const status = currentStock <= 0 ? 'OUT OF STOCK' : currentStock <= p.reorderLevel ? 'REORDER' : 'OK';
      results.push({ ...p, currentStock, status });
    }
    return results;
  }
}

function sum(rows: any[], field: string) {
  return rows.reduce((a, r) => a + r[field], 0);
}
