import { useState, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { useAppDataStore } from "@/store/AppDataStore";
import {
  getMonthlyCycleSummaries,
  getProductPerformanceList,
} from "@/services/storage/analyticsEngine";
import { CycleSummary, ProductPerformance } from "@/types/models";
import { Colors } from "@/lib/colors";

import { formatCurrency } from "@/lib/formatters";

export type Timeframe = "this_month" | "last_month" | "this_week";

export function formatPeriodLabel(cycle: string): string {
  if (!cycle) return "—";
  const parts = cycle.split("_");
  if (parts.length === 2) {
    const fmtDate = (s: string) => {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    };
    const year = new Date(parts[1]).getFullYear();
    return `${fmtDate(parts[0])} – ${fmtDate(parts[1])}, ${year}`;
  }
  return cycle;
}

export function useReportScreen() {
  const { refresh, products: storeProducts, sales, restocks } = useAppDataStore();

  const [timeframe, setTimeframe] = useState<Timeframe>("this_month");
  const [rawCycleData, setRawCycleData] = useState<CycleSummary[]>([]);
  const [rawProductData, setRawProductData] = useState<ProductPerformance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [cycles, products] = await Promise.all([
        getMonthlyCycleSummaries(),
        getProductPerformanceList(),
      ]);
      setRawCycleData(cycles || []);
      setRawProductData(products || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await loadData();
    setRefreshing(false);
  };

  // ─── Derived Cycle Data ───────────────────────────────────────────────────
  const cycleData = useMemo(() => {
    return rawCycleData.map((c) => {
      const rev = c.revenue ?? 0;
      const prof = c.profit ?? 0;
      const margin =
        c.margin != null
          ? Number(c.margin)
          : rev > 0
          ? Math.round((prof / rev) * 100)
          : 0;

      let units = c.unitsSold;
      if (units == null) {
        units = (sales || [])
          .filter((s) => s.cycle === c.cycle)
          .reduce((sum, s) => sum + s.qty, 0);
      }

      return {
        ...c,
        revenue: rev,
        profit: prof,
        margin,
        unitsSold: units ?? 0,
        restockSpend: c.restockSpend ?? 0,
      };
    });
  }, [rawCycleData, sales]);

  const currentCycle = cycleData[0];

  // ─── Selected Stats for active timeframe ─────────────────────────────────
  const selectedStats = useMemo(() => {
    if (timeframe === "this_week") {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weekSales = (sales || []).filter((s) => {
        const d = new Date(s.createdAt || s.date);
        return !isNaN(d.getTime()) && d >= oneWeekAgo;
      });
      const rev = weekSales.reduce((sum, s) => sum + (s.revenue ?? 0), 0);
      const prof = weekSales.reduce((sum, s) => sum + (s.profit ?? 0), 0);
      const cost = weekSales.reduce((sum, s) => sum + (s.cost ?? 0), 0);
      const margin = rev > 0 ? Math.round((prof / rev) * 100) : 0;
      const units = weekSales.reduce((sum, s) => sum + (s.qty ?? 0), 0);

      const weekRestocks = (restocks || []).filter((r) => {
        const d = new Date(r.createdAt || r.date);
        return !isNaN(d.getTime()) && d >= oneWeekAgo;
      });
      const restockSpend = weekRestocks.reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

      return {
        revenue: rev,
        profit: prof,
        cost,
        margin,
        units,
        restockSpend,
        label: "Past 7 Days",
      };
    }

    if (timeframe === "last_month") {
      const prev = cycleData[1];
      if (prev) {
        const rev = prev.revenue;
        const prof = prev.profit;
        const cost = Math.max(0, rev - prof);
        const margin =
          prev.margin ?? (rev > 0 ? Math.round((prof / rev) * 100) : 0);
        const units = prev.unitsSold;
        const restockSpend = prev.restockSpend;
        return {
          revenue: rev,
          profit: prof,
          cost,
          margin,
          units,
          restockSpend,
          label: formatPeriodLabel(prev.cycle),
        };
      }

      // Explicit empty state if store has no data for last month
      return {
        revenue: 0,
        profit: 0,
        cost: 0,
        margin: 0,
        units: 0,
        restockSpend: 0,
        label: "No records for last month yet",
      };
    }

    // Default: This Month
    const rev = currentCycle?.revenue ?? 0;
    const prof = currentCycle?.profit ?? 0;
    const cost = Math.max(0, rev - prof);
    const margin =
      currentCycle?.margin ?? (rev > 0 ? Math.round((prof / rev) * 100) : 0);
    const units = currentCycle?.unitsSold ?? 0;
    const restockSpend = currentCycle?.restockSpend ?? 0;
    return {
      revenue: rev,
      profit: prof,
      cost,
      margin,
      units,
      restockSpend,
      label: currentCycle ? formatPeriodLabel(currentCycle.cycle) : "Current Month",
    };
  }, [timeframe, currentCycle, cycleData, sales, restocks]);

  const profitPct =
    selectedStats.revenue > 0
      ? Math.round((selectedStats.profit / selectedStats.revenue) * 100)
      : 0;
  const costPct = selectedStats.revenue > 0 ? 100 - profitPct : 0;

  const profitPerThousand = useMemo(() => {
    return Math.round((selectedStats.margin / 100) * 1000);
  }, [selectedStats.margin]);

  const netCashFlow = useMemo(() => {
    return selectedStats.revenue - selectedStats.restockSpend;
  }, [selectedStats.revenue, selectedStats.restockSpend]);

  // ─── Timeframe-Specific Top Money Makers ──────────────────────────────────
  const currentPeriodSales = useMemo(() => {
    if (timeframe === "this_week") {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return (sales || []).filter((s) => {
        const d = new Date(s.createdAt || s.date);
        return !isNaN(d.getTime()) && d >= oneWeekAgo;
      });
    }

    if (timeframe === "last_month") {
      const prevCycleKey = cycleData[1]?.cycle;
      if (!prevCycleKey) return [];
      return (sales || []).filter((s) => s.cycle === prevCycleKey);
    }

    // Default: this_month
    const currentCycleKey = cycleData[0]?.cycle;
    return (sales || []).filter((s) => !currentCycleKey || s.cycle === currentCycleKey);
  }, [timeframe, sales, cycleData]);

  const topMoneyMakers = useMemo(() => {
    const map = new Map<string, {
      productId: string;
      productName: string;
      category: string;
      totalUnitsSold: number;
      totalRevenue: number;
      totalProfit: number;
    }>();

    for (const s of currentPeriodSales) {
      const storeProduct = (storeProducts || []).find((p) => p.id === s.productId);
      const existing = map.get(s.productId) ?? {
        productId: s.productId,
        productName: s.productName,
        category: storeProduct?.category || "General",
        totalUnitsSold: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };

      existing.totalUnitsSold += s.qty ?? 0;
      existing.totalRevenue += s.revenue ?? 0;
      existing.totalProfit += s.profit ?? 0;
      map.set(s.productId, existing);
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);
  }, [currentPeriodSales, storeProducts]);

  const handleTimeframeChange = (tf: Timeframe) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeframe(tf);
  };

  return {
    timeframe,
    handleTimeframeChange,
    loading,
    refreshing,
    handleRefresh,
    selectedStats,
    profitPct,
    costPct,
    profitPerThousand,
    netCashFlow,
    topMoneyMakers,
    fmt: formatCurrency,
    fmtFull: formatCurrency,
  };
}
