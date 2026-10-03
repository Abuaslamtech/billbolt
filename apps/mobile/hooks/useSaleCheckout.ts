import { useCallback, useMemo, useEffect } from "react";
import { BackHandler, LayoutAnimation } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
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
  const depositAmount = useSaleStore((s) => s.depositAmount);
  const setDepositAmount = useSaleStore((s) => s.setDepositAmount);
  const dueDate = useSaleStore((s) => s.dueDate);
  const setDueDate = useSaleStore((s) => s.setDueDate);
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
  const removeFromCart = useSaleStore((s) => s.removeFromCart);
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
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toLocaleDateString("en-NG", {
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
    if (isSubmitting) return;

    if (paymentMethod === "Credit" && !customerName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show({
        type: "error",
        text1: "Customer Name Required",
        text2: "Please enter the customer's name for a credit sale.",
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const receipt = await recordSale();
    if (receipt) {
      router.replace("/(sale)/success");
    }
  }, [isSubmitting, paymentMethod, customerName, recordSale]);


  const handleBackToCatalog = useCallback(() => {
    if (isSubmitting) return;
    router.back();
  }, [isSubmitting]);

  // Guard: if cart is empty and not currently in submission, redirect back to catalog
  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      router.replace("/(sale)");
    }
  }, [cart.length, isSubmitting]);

  // Hardware Back Button Intercept: dismiss modal/drawers or return to catalog safely
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isSubmitting) {
        return true;
      }
      if (quantityPickerTarget) {
        setQuantityPickerTarget(null);
        return true;
      }
      if (isClearCartDialogOpen) {
        setIsClearCartDialogOpen(false);
        return true;
      }
      if (isDiscountOpen) {
        setIsDiscountOpen(false);
        return true;
      }
      if (isHistoricalOpen) {
        setIsHistoricalOpen(false);
        return true;
      }
      handleBackToCatalog();
      return true;
    });
    return () => subscription.remove();
  }, [
    isSubmitting,
    quantityPickerTarget,
    isClearCartDialogOpen,
    isDiscountOpen,
    isHistoricalOpen,
    handleBackToCatalog,
    setQuantityPickerTarget,
    setIsClearCartDialogOpen,
    setIsDiscountOpen,
    setIsHistoricalOpen,
  ]);

  const handleSelectPaymentMethod = useCallback(
    (method: "Cash" | "Transfer" | "Card" | "Credit") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPaymentMethod(method);
    },
    [setPaymentMethod]
  );

  const handleToggleDiscount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    depositAmount,
    setDepositAmount,
    dueDate,
    setDueDate,
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
    removeFromCart,
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
