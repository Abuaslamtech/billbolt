import { useState, useEffect, useMemo } from "react";
import { useAppDataStore } from "@/store/AppDataStore";
import { useSyncStore } from "@/store/syncStore";
import { Receipt } from "@/types/models";
import { countTodayReceipts } from "@/services/storage/cycleUtils";
import { useAppLockPrimer } from "./useAppLockPrimer";

export function useDashboardScreen() {
  const { metrics, receipts, refresh } = useAppDataStore();
  const { isOnline, pendingCount } = useSyncStore();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // App Lock privacy discovery modal
  const {
    showPrimerModal,
    handleEnableAppLock,
    handleDismissPrimer,
  } = useAppLockPrimer();

  // Safety net: trigger a refresh if we arrive with empty metrics
  useEffect(() => {
    if (!metrics) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Computed dashboard metrics
  const todaySales = metrics?.todaySales || 0;
  const yesterdaySales = metrics?.yesterdaySales || 0;
  const receiptsToday = useMemo(() => countTodayReceipts(receipts), [receipts]);
  const growth = metrics?.todaySalesGrowth || 0;
  const needReorder = (metrics?.needReorderCount || 0) + (metrics?.outOfStockCount || 0);
  const recentReceipts = useMemo(() => receipts.slice(0, 3), [receipts]);

  return {
    metrics,
    receipts,
    isOnline,
    pendingCount,
    // Modal states & controls
    isScannerOpen,
    setIsScannerOpen,
    selectedReceipt,
    setSelectedReceipt,
    // Pull to refresh
    refreshing,
    handleRefresh,
    // Computed numbers
    todaySales,
    yesterdaySales,
    receiptsToday,
    growth,
    needReorder,
    recentReceipts,
    // Primer modal
    showPrimerModal,
    handleEnableAppLock,
    handleDismissPrimer,
  };
}
