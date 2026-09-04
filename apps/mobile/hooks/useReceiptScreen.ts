import { useState, useMemo, useCallback } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAppDataStore } from "@/store/AppDataStore";
import { ProductWithStock } from "@/types/models";
import { countTodayReceipts } from "@/services/storage/cycleUtils";

export function useReceiptScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { metrics, receipts, refresh } = useAppDataStore();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // ── Derived stats (Logic isolated from UI) ──
  const todaySales = metrics?.todaySales ?? 0;
  const yesterdaySales = metrics?.yesterdaySales ?? 0;
  const monthRevenue = metrics?.thisMonthRevenue ?? 0;
  const growth = metrics?.todaySalesGrowth ?? 0;

  const todayReceiptsCount = useMemo(() => {
    return countTodayReceipts(receipts);
  }, [receipts]);

  // Screen navigation handlers
  const openRecordSaleScreen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(sale)");
  }, []);

  const openScanner = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsScannerOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  const handleProductScanned = useCallback((product: ProductWithStock) => {
    setIsScannerOpen(false);
    router.push({
      pathname: "/(sale)",
      params: { initialProductId: product.id },
    });
  }, []);

  return {
    refreshing,
    handleRefresh,
    todaySales,
    yesterdaySales,
    todayReceiptsCount,
    monthRevenue,
    growth,
    openRecordSaleScreen,
    isScannerOpen,
    openScanner,
    closeScanner,
    handleProductScanned,
  };
}
