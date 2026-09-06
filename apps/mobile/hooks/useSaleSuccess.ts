import { useState, useCallback, useMemo, useEffect } from "react";
import { BackHandler } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSaleStore } from "@/store/saleStore";

export function useSaleSuccess() {
  const completedReceipt = useSaleStore((s) => s.completedReceipt);
  const resetSale = useSaleStore((s) => s.resetSale);
  const [showReceiptDetail, setShowReceiptDetail] = useState(false);

  const handleRecordAnother = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(sale)");
    resetSale();
  }, [resetSale]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(main)");
    resetSale();
  }, [resetSale]);

  // Hardware Back Button Intercept: physical back returns Home
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleDone();
      return true;
    });
    return () => subscription.remove();
  }, [handleDone]);

  // Guard: if no completed receipt exists on mount, redirect to main
  useEffect(() => {
    if (!completedReceipt) {
      router.replace("/(main)");
    }
  }, [completedReceipt]);

  const items = completedReceipt?.items;
  const totalUnits = useMemo(() => {
    if (!items) return 0;
    return items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }, [items]);

  const formattedDateTime = useMemo(() => {
    if (!completedReceipt) return "Today";
    const rawDate = completedReceipt.createdAt || completedReceipt.date;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return "Today";
    return d.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [completedReceipt]);

  return {
    completedReceipt,
    totalUnits,
    formattedDateTime,
    showReceiptDetail,
    setShowReceiptDetail,
    handleRecordAnother,
    handleDone,
  };
}

