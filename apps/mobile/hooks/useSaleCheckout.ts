import { useCallback, useMemo } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSaleStore } from "@/store/saleStore";
import { useAppDataStore } from "@/store/AppDataStore";

export function useSaleCheckout() {
  const { businessInfo } = useAppDataStore();
  const businessName = businessInfo?.name || "Billbolt Store";

  const cart = useSaleStore((s) => s.cart);
  const customerName = useSaleStore((s) => s.customerName);
  const setCustomerName = useSaleStore((s) => s.setCustomerName);
  const customerPhone = useSaleStore((s) => s.customerPhone);
  const setCustomerPhone = useSaleStore((s) => s.setCustomerPhone);
  const paymentMethod = useSaleStore((s) => s.paymentMethod);
  const setPaymentMethod = useSaleStore((s) => s.setPaymentMethod);
  const isSubmitting = useSaleStore((s) => s.isSubmitting);

  const isDiscountOpen = useSaleStore((s) => s.isDiscountOpen);
  const setIsDiscountOpen = useSaleStore((s) => s.setIsDiscountOpen);
  const discountType = useSaleStore((s) => s.discountType);
  const setDiscountType = useSaleStore((s) => s.setDiscountType);
  const discountValue = useSaleStore((s) => s.discountValue);
  const setDiscountValue = useSaleStore((s) => s.setDiscountValue);

  const isHistoricalOpen = useSaleStore((s) => s.isHistoricalOpen);
  const setIsHistoricalOpen = useSaleStore((s) => s.setIsHistoricalOpen);
  const isHistorical = useSaleStore((s) => s.isHistorical);
  const setIsHistorical = useSaleStore((s) => s.setIsHistorical);
  const datePreset = useSaleStore((s) => s.datePreset);
  const setDatePreset = useSaleStore((s) => s.setDatePreset);
  const customDateInput = useSaleStore((s) => s.customDateInput);
  const setCustomDateInput = useSaleStore((s) => s.setCustomDateInput);

  const isClearCartDialogOpen = useSaleStore((s) => s.isClearCartDialogOpen);
  const setIsClearCartDialogOpen = useSaleStore((s) => s.setIsClearCartDialogOpen);
  const quantityPickerTarget = useSaleStore((s) => s.quantityPickerTarget);
  const setQuantityPickerTarget = useSaleStore((s) => s.setQuantityPickerTarget);

  const setDirectQty = useSaleStore((s) => s.setDirectQty);
  const clearCart = useSaleStore((s) => s.clearCart);
  const recordSale = useSaleStore((s) => s.recordSale);
  const getCartSubtotal = useSaleStore((s) => s.getCartSubtotal);
  const getDiscountAmount = useSaleStore((s) => s.getDiscountAmount);
  const getCartTotal = useSaleStore((s) => s.getCartTotal);
  const getTotalItemsCount = useSaleStore((s) => s.getTotalItemsCount);

  const totalItemsCount = getTotalItemsCount();
  const cartSubtotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const cartTotal = getCartTotal();

  const formattedDate = useMemo(() => {
    if (datePreset === "today") {
      return new Date().toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (datePreset === "yesterday") {
      return new Date(Date.now() - 86400000).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return customDateInput || "Custom Date";
  }, [datePreset, customDateInput]);

  const handleTriggerClearCart = useCallback(() => {
    if (cart.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsClearCartDialogOpen(true);
  }, [cart.length, setIsClearCartDialogOpen]);

  const handleConfirmClearCart = useCallback(() => {
    clearCart();
    setIsClearCartDialogOpen(false);
    router.back();
  }, [clearCart, setIsClearCartDialogOpen]);

  const handleConfirmSale = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const receipt = await recordSale();
    if (receipt) {
      router.replace("/(sale)/success");
    }
  }, [recordSale]);

  const handleBackToCatalog = useCallback(() => {
    router.back();
  }, []);

  const handleSelectPaymentMethod = useCallback(
    (method: "Cash" | "Transfer" | "Card") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPaymentMethod(method);
    },
    [setPaymentMethod]
  );

  const handleToggleDiscount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDiscountOpen(!isDiscountOpen);
  }, [isDiscountOpen, setIsDiscountOpen]);

  const handleSelectDiscountType = useCallback(
    (type: "fixed" | "percent") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDiscountType(type);
    },
    [setDiscountType]
  );

  const handleSelectDiscountPreset = useCallback(
    (preset: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDiscountValue(preset);
    },
    [setDiscountValue]
  );

  const handleToggleHistorical = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsHistoricalOpen(!isHistoricalOpen);
  }, [isHistoricalOpen, setIsHistoricalOpen]);

  const handleSelectDatePreset = useCallback(
    (preset: "today" | "yesterday" | "custom") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDatePreset(preset);
      setIsHistorical(preset !== "today");
    },
    [setDatePreset, setIsHistorical]
  );

  return {
    cart,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    paymentMethod,
    isSubmitting,
    isDiscountOpen,
    discountType,
    discountValue,
    setDiscountValue,
    isHistoricalOpen,
    isHistorical,
    datePreset,
    customDateInput,
    setCustomDateInput,
    isClearCartDialogOpen,
    setIsClearCartDialogOpen,
    quantityPickerTarget,
    setQuantityPickerTarget,
    setDirectQty,
    totalItemsCount,
    cartSubtotal,
    discountAmount,
    cartTotal,
    businessName,
    businessInfo,
    formattedDate,
    handleTriggerClearCart,
    handleConfirmClearCart,
    handleConfirmSale,
    handleBackToCatalog,
    handleSelectPaymentMethod,
    handleToggleDiscount,
    handleSelectDiscountType,
    handleSelectDiscountPreset,
    handleToggleHistorical,
    handleSelectDatePreset,
  };
}
