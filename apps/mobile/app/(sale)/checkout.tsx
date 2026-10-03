import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import FlashIcon from '@hugeicons/core-free-icons/FlashIcon';
import Calendar03Icon from '@hugeicons/core-free-icons/Calendar03Icon';
import Tag01Icon from '@hugeicons/core-free-icons/Tag01Icon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import { BackButton } from "@/components/Elements/BackButton";
import { ConfirmDialog } from "@/components/Elements/ConfirmDialog";
import { QuantityPickerModal } from "@/components/Elements/QuantityPickerModal";
import { LoadingOverlay } from "@/components/Elements/LoadingOverlay";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { useAppDataStore } from "@/store/AppDataStore";
import { getCurrencySymbol } from "@/lib/formatters";
import { useSaleCheckout } from "@/hooks/useSaleCheckout";
import { Shadows } from "@/lib/styles";

export default function SaleCheckoutScreen() {
  const insets = useSafeAreaInsets();
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const {
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
    depositAmount,
    setDepositAmount,
    dueDate,
    setDueDate,
  } = useSaleCheckout();

  // Customer info is mandatory for credit, optional for others
  const isCredit = paymentMethod === "Credit";
  const [isCustomerOpen, setIsCustomerOpen] = useState(
    Boolean(customerName || customerPhone || isCredit)
  );

  const parsedDeposit = parseFloat(depositAmount) || 0;
  const balanceOwed = isCredit ? Math.max(0, cartTotal - parsedDeposit) : 0;

  const dueDatePresets = useMemo(() => {
    const addDays = (d: number) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().slice(0, 10);
    };
    const endOfMonth = () => {
      const dt = new Date();
      dt.setMonth(dt.getMonth() + 1, 0);
      return dt.toISOString().slice(0, 10);
    };

    return [
      { id: "3d", label: "In 3 days", value: addDays(3) },
      { id: "7d", label: "1 week", value: addDays(7) },
      { id: "14d", label: "2 weeks", value: addDays(14) },
      { id: "end_of_month", label: "End of month", value: endOfMonth() },
      { id: "custom", label: "Custom Date", value: "custom" },
    ];
  }, []);

  const [isCustomDueDate, setIsCustomDueDate] = useState(() =>
    Boolean(dueDate && !dueDatePresets.some((p) => p.value !== "custom" && p.value === dueDate))
  );

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      {/* ── Screen Header (Static, outside KeyboardAvoidingView) ──────────────── */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-bolt-border bg-bolt-card">
        <View className="flex-row items-center flex-1">
          <BackButton
            onPress={handleBackToCatalog}
            accessibilityLabel="Back to catalog"
          />
          <View>
            <Text className="font-poppins-bold text-lg text-bolt-graphite leading-tight">
              Checkout
            </Text>
            <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
              {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""} selected
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleTriggerClearCart}
          className="px-2.5 py-1.5 rounded-lg bg-bolt-surface border border-bolt-border active:bg-bolt-divider"
          accessibilityRole="button"
          accessibilityLabel="Clear cart"
        >
          <Text className="font-inter-medium text-xs text-bolt-danger-text">
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Main Body ─────────────────────────────────────────────── */}
      <View className="flex-1 bg-bolt-surface">
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          className="flex-1"
          enableOnAndroid={true}
          extraScrollHeight={84}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
            {/* ── SECTION 1: Payment Method (The #1 Checkout Decision) ──────── */}
            <View className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5">
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider">
                  Select Payment Method
                </Text>
                <Text className="font-inter text-2xs text-bolt-slate">
                  Transfer selected by default
                </Text>
              </View>

              <View className="flex-row gap-2">
                {(["Transfer", "Cash", "Card", "Credit"] as const).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      onPress={() => handleSelectPaymentMethod(method)}
                      className={`flex-1 py-3 rounded-xl border items-center justify-center ${isSelected
                        ? "bg-bolt-light border-2 border-bolt-blue"
                        : "bg-bolt-surface border border-bolt-border active:bg-bolt-divider"
                        }`}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${method} payment`}
                    >
                      <Text
                        className={`text-xs ${isSelected
                          ? "font-poppins-bold text-bolt-blue"
                          : "font-inter-semibold text-bolt-graphite"
                          }`}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── SECTION 2: Order Items & Pricing Breakdown ─────────────────── */}
            <View className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5">
              <View className="flex-row justify-between items-center pb-2.5 border-b border-bolt-divider">
                <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider">
                  Order Items ({totalItemsCount})
                </Text>
                <Text className="font-inter text-3xs text-bolt-slate">
                  Tap qty to edit
                </Text>
              </View>

              {/* Items List */}
              {cart.map((item, index) => (
                <View
                  key={item.productId}
                  className={`flex-row items-center py-3 ${index < cart.length - 1 ? "border-b border-bolt-divider" : ""
                    }`}
                >
                  <View className="flex-1 pr-2">
                    <Text
                      className="font-inter-medium text-sm text-bolt-graphite leading-snug"
                      numberOfLines={1}
                    >
                      {item.productName}
                    </Text>
                    <Text className="font-inter text-xs text-bolt-slate mt-0.5">
                      {formatCurrency(item.unitPrice)} each
                    </Text>
                  </View>

                  {/* Tappable Qty Badge */}
                  <TouchableOpacity
                    onPress={() =>
                      setQuantityPickerTarget({
                        productId: item.productId,
                        productName: item.productName,
                        currentQty: item.qty,
                        maxStock: item.maxStock,
                        unitPrice: item.unitPrice,
                      })
                    }
                    className="mr-3 bg-bolt-light border border-bolt-blue/20 px-2.5 py-1 rounded-lg active:bg-bolt-divider"
                    accessibilityRole="button"
                    accessibilityLabel={`Quantity ${item.qty}. Tap to edit.`}
                  >
                    <Text className="font-inter-bold text-xs text-bolt-blue">
                      ×{item.qty}
                    </Text>
                  </TouchableOpacity>

                  <Text className="font-poppins-semibold text-sm text-bolt-graphite min-w-[64px] text-right">
                    {formatCurrency(item.unitPrice * item.qty)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => removeFromCart(item.productId)}
                    className="p-1 ml-2.5 rounded-lg active:bg-bolt-divider"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.productName} from sale`}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={15} color={Colors.danger.text} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Subtotal Row */}
              <View className="pt-3 pb-2.5 border-t border-bolt-divider flex-row justify-between items-center">
                <Text className="font-inter text-xs text-bolt-slate">Subtotal</Text>
                <Text className="font-inter-semibold text-xs text-bolt-graphite">
                  {formatCurrency(cartSubtotal)}
                </Text>
              </View>

              {/* ── PROMINENT, OBVIOUS DISCOUNT ROW ─────────────────────────── */}
              <View className="py-3 border-t border-bolt-divider">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-lg bg-bolt-light items-center justify-center">
                      <HugeiconsIcon icon={Tag01Icon} size={14} color={Colors.primary} />
                    </View>
                    <View>
                      <Text className="font-inter-semibold text-xs text-bolt-graphite">
                        Discount
                      </Text>
                      {discountAmount > 0 ? (
                        <Text className="font-inter text-2xs text-bolt-success-text">
                          {discountType === "percent" ? `${discountValue}% off` : "Fixed discount"}
                        </Text>
                      ) : (
                        <Text className="font-inter text-2xs text-bolt-slate">
                          Optional price reduction
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Clear Action: Obvious Add Button OR Edit Pill */}
                  {discountAmount > 0 ? (
                    <View className="flex-row items-center gap-2">
                      <Text className="font-poppins-bold text-sm text-bolt-success-text">
                        - {formatCurrency(discountAmount)}
                      </Text>
                      <TouchableOpacity
                        onPress={handleToggleDiscount}
                        className="bg-bolt-surface border border-bolt-border px-2.5 py-1 rounded-lg active:bg-bolt-divider"
                        accessibilityRole="button"
                        accessibilityLabel="Edit discount"
                      >
                        <Text className="font-inter-semibold text-2xs text-bolt-graphite">
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleToggleDiscount}
                      className="bg-bolt-light border border-bolt-blue/30 px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:bg-bolt-divider"
                      accessibilityRole="button"
                      accessibilityLabel="Add discount"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={13} color={Colors.primary} />
                      <Text className="font-inter-bold text-xs text-bolt-blue">
                        Add Discount
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Expanded Discount Editor */}
                {isDiscountOpen && (
                  <View className="mt-3 pt-3 border-t border-bolt-divider gap-2.5 bg-bolt-surface p-3 rounded-xl border">
                    {/* Fixed / Percent Tabs */}
                    <View className="flex-row gap-2">
                      {(["fixed", "percent"] as const).map((type) => {
                        const isSelected = discountType === type;
                        return (
                          <TouchableOpacity
                            key={type}
                            onPress={() => handleSelectDiscountType(type)}
                            className={`flex-1 py-2 rounded-lg border items-center justify-center ${isSelected
                              ? "bg-bolt-light border-bolt-blue"
                              : "bg-bolt-card border-bolt-border active:bg-bolt-divider"
                              }`}
                          >
                            <Text
                              className={`font-inter-semibold text-xs ${isSelected ? "text-bolt-blue font-inter-bold" : "text-bolt-slate"
                                }`}
                            >
                              {type === "fixed" ? `Fixed Amount (${currency})` : "Percentage (%)"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Numeric Input */}
                    <View className="flex-row items-center bg-bolt-card border border-bolt-border rounded-xl px-3 h-11">
                      <Text className="font-inter-bold text-sm text-bolt-slate mr-1.5">
                        {discountType === "fixed" ? currency : "%"}
                      </Text>
                      <TextInput
                        value={discountValue}
                        onChangeText={setDiscountValue}
                        placeholder={discountType === "fixed" ? "e.g. 500" : "e.g. 10"}
                        placeholderTextColor={Colors.slate}
                        keyboardType="numeric"
                        className="flex-1 font-inter text-sm text-bolt-graphite py-0"
                      />
                      {discountValue ? (
                        <TouchableOpacity
                          onPress={() => setDiscountValue("")}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={15} color={Colors.slate} />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* Presets */}
                    <View className="flex-row gap-1.5">
                      {(discountType === "fixed"
                        ? ["200", "500", "1000", "2000"]
                        : ["5", "10", "15", "20"]
                      ).map((preset) => {
                        const isSelected = discountValue === preset;
                        return (
                          <TouchableOpacity
                            key={preset}
                            onPress={() => handleSelectDiscountPreset(preset)}
                            className={`flex-1 py-1.5 rounded-lg border items-center justify-center ${isSelected
                              ? "bg-bolt-light border-bolt-blue"
                              : "bg-bolt-card border-bolt-border"
                              }`}
                          >
                            <Text
                              className={`font-inter-medium text-xs ${isSelected
                                ? "text-bolt-blue font-inter-bold"
                                : "text-bolt-slate"
                                }`}
                            >
                              {discountType === "fixed"
                                ? `${currency}${Number(preset).toLocaleString()}`
                                : `${preset}%`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* Total Due Row */}
              <View className="pt-3 border-t border-bolt-divider flex-row justify-between items-center">
                <Text className="font-poppins-bold text-base text-bolt-graphite">
                  Total Due
                </Text>
                <Text className="font-poppins-bold text-2xl text-bolt-blue">
                  {formatCurrency(cartTotal)}
                </Text>
              </View>
            </View>

            {/* ── SECTION 3: Sale Date (Easy to View & Change) ───────────────── */}
            <View className="bg-bolt-card rounded-2xl border border-bolt-border p-3.5 mb-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-8 h-8 rounded-full bg-bolt-surface items-center justify-center">
                    <HugeiconsIcon icon={Calendar03Icon} size={16} color={Colors.primary} />
                  </View>
                  <View>
                    <Text className="font-poppins-semibold text-xs text-bolt-graphite">
                      Sale Date
                    </Text>
                    <Text className="font-inter text-2xs text-bolt-slate">
                      {formattedDate} {datePreset === "today" ? "(Today)" : "(Backdated)"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleToggleHistorical}
                  className="bg-bolt-surface border border-bolt-border px-3 py-1.5 rounded-xl active:bg-bolt-divider"
                  accessibilityRole="button"
                  accessibilityLabel="Change sale date"
                >
                  <Text className="font-inter-semibold text-xs text-bolt-blue">
                    {isHistoricalOpen ? "Done" : "Change"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* When Expanded */}
              {isHistoricalOpen && (
                <View className="mt-3 pt-3 border-t border-bolt-divider gap-2.5">
                  <Text className="font-inter-medium text-xs text-bolt-slate">
                    Select date for this sale:
                  </Text>
                  <View className="flex-row gap-2">
                    {(["today", "yesterday", "custom"] as const).map((preset) => {
                      const isSelected = datePreset === preset;
                      const label =
                        preset === "today"
                          ? "Today"
                          : preset === "yesterday"
                            ? "Yesterday"
                            : "Custom Date";
                      return (
                        <TouchableOpacity
                          key={preset}
                          onPress={() => handleSelectDatePreset(preset)}
                          className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${isSelected
                            ? "bg-bolt-light border-2 border-bolt-blue"
                            : "bg-bolt-surface border border-bolt-border"
                            }`}
                        >
                          <Text
                            className={`font-inter-semibold text-xs ${isSelected
                              ? "text-bolt-blue font-inter-bold"
                              : "text-bolt-graphite"
                              }`}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {datePreset === "custom" && (
                    <View className="mt-1">
                      <Text className="font-inter text-2xs text-bolt-slate mb-1">
                        Enter date (YYYY-MM-DD):
                      </Text>
                      <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11 justify-center">
                        <TextInput
                          value={customDateInput}
                          onChangeText={setCustomDateInput}
                          placeholder="e.g. 2026-09-02"
                          placeholderTextColor={Colors.slate}
                          className="font-inter text-sm text-bolt-graphite py-0"
                          keyboardType="numbers-and-punctuation"
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* ── SECTION 4: Customer Details (Optional & Cleanly Expandable) ─ */}
            <View className="bg-bolt-card rounded-2xl border border-bolt-border p-3.5 mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-8 h-8 rounded-full bg-bolt-surface items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} size={16} color={Colors.slate} />
                  </View>
                  <View>
                    <Text className="font-poppins-semibold text-xs text-bolt-graphite">
                      Customer Info
                    </Text>
                    <Text className="font-inter text-2xs text-bolt-slate">
                      {customerName || customerPhone
                        ? customerName || customerPhone
                        : isCredit
                        ? "Required for credit sale"
                        : "Optional · Walk-in customer"}
                    </Text>
                  </View>
                </View>

                {!isCredit && (
                  <TouchableOpacity
                    onPress={() => setIsCustomerOpen(!isCustomerOpen)}
                    className="bg-bolt-surface border border-bolt-border px-3 py-1.5 rounded-xl active:bg-bolt-divider"
                    accessibilityRole="button"
                    accessibilityLabel="Toggle customer details"
                  >
                    <Text className="font-inter-semibold text-xs text-bolt-blue">
                      {isCustomerOpen
                        ? "Done"
                        : customerName || customerPhone
                          ? "Edit"
                          : "+ Add"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Full-width inputs when opened or when Credit is selected */}
              {(isCustomerOpen || isCredit) && (
                <View className="mt-3 pt-3 border-t border-bolt-divider gap-3">
                  {isCredit && (
                    <View className="bg-bolt-warning-bg border border-bolt-warning-border rounded-xl p-2.5">
                      <Text className="font-inter-medium text-xs text-bolt-warning-text leading-snug">
                        Customer details are required to record and track debts accurately.
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text className="font-inter-medium text-xs text-bolt-slate mb-1">
                      Customer Name {isCredit && <Text className="text-bolt-danger-text">*</Text>}
                    </Text>
                    <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11 justify-center">
                      <TextInput
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="e.g. Alhaji Musa / Mama Ngozi"
                        placeholderTextColor={Colors.slate}
                        className="font-inter text-sm text-bolt-graphite py-0"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="font-inter-medium text-xs text-bolt-slate mb-1">
                      Phone Number {isCredit && <Text className="text-bolt-slate text-2xs">(for WhatsApp reminder)</Text>}
                    </Text>
                    <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11 justify-center">
                      <TextInput
                        value={customerPhone}
                        onChangeText={setCustomerPhone}
                        placeholder="e.g. 08012345678"
                        placeholderTextColor={Colors.slate}
                        keyboardType="phone-pad"
                        className="font-inter text-sm text-bolt-graphite py-0"
                      />
                    </View>
                  </View>

                  {/* ── Credit Terms: Deposit & Promised Due Date ── */}
                  {isCredit && (
                    <View className="mt-1 pt-3 border-t border-bolt-divider gap-3">
                      <View>
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="font-inter-medium text-xs text-bolt-slate">
                            Amount Paid Now (Deposit)
                          </Text>
                          <Text className="font-inter text-2xs text-bolt-slate">
                            Optional · Defaults to ₦0
                          </Text>
                        </View>
                        <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11 justify-center">
                          <TextInput
                            value={depositAmount}
                            onChangeText={setDepositAmount}
                            placeholder="0"
                            placeholderTextColor={Colors.slate}
                            keyboardType="numeric"
                            className="font-inter text-sm text-bolt-graphite py-0"
                          />
                        </View>
                      </View>

                      {/* Promised Payment Date */}
                      <View>
                        <View className="flex-row items-center justify-between mb-1.5">
                          <Text className="font-inter-medium text-xs text-bolt-slate">
                            Promised Pay Date (Optional)
                          </Text>
                          {dueDate ? (
                            <TouchableOpacity
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setDueDate("");
                                setIsCustomDueDate(false);
                              }}
                            >
                              <Text className="font-inter text-2xs text-bolt-red">Clear</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                          {dueDatePresets.map((preset) => {
                            const isCustom = preset.id === "custom";
                            const isSelected = isCustom
                              ? isCustomDueDate
                              : !isCustomDueDate && dueDate === preset.value;

                            const label =
                              isCustom && isCustomDueDate && dueDate
                                ? `Custom: ${dueDate}`
                                : preset.label;

                            return (
                              <TouchableOpacity
                                key={preset.id}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  if (isCustom) {
                                    if (isCustomDueDate) {
                                      setIsCustomDueDate(false);
                                      setDueDate("");
                                    } else {
                                      setIsCustomDueDate(true);
                                    }
                                  } else {
                                    setIsCustomDueDate(false);
                                    setDueDate(isSelected ? "" : preset.value);
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border ${
                                  isSelected
                                    ? "bg-bolt-light border-bolt-blue"
                                    : "bg-bolt-surface border-bolt-border active:bg-bolt-divider"
                                }`}
                              >
                                <Text
                                  className={`text-xs ${
                                    isSelected
                                      ? "font-inter-semibold text-bolt-blue"
                                      : "font-inter text-bolt-graphite"
                                  }`}
                                >
                                  {label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Custom Due Date Input */}
                        {isCustomDueDate && (
                          <View className="mt-2">
                            <Text className="font-inter text-2xs text-bolt-slate mb-1">
                              Enter due date (YYYY-MM-DD):
                            </Text>
                            <View className="flex-row items-center bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11">
                              <TextInput
                                value={dueDate}
                                onChangeText={setDueDate}
                                placeholder="e.g. 2026-10-25"
                                placeholderTextColor={Colors.slate}
                                className="flex-1 font-inter text-sm text-bolt-graphite py-0"
                                keyboardType="numbers-and-punctuation"
                                autoFocus
                              />
                              {dueDate ? (
                                <TouchableOpacity
                                  onPress={() => setDueDate("")}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <HugeiconsIcon icon={Cancel01Icon} size={15} color={Colors.slate} />
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Dynamic Debt Calculation Breakdown */}
                      <View className="bg-bolt-surface rounded-xl border border-bolt-border p-3 gap-1.5">
                        <View className="flex-row justify-between">
                          <Text className="font-inter text-xs text-bolt-slate">Total Bill:</Text>
                          <Text className="font-inter-semibold text-xs text-bolt-graphite">
                            {formatCurrency(cartTotal)}
                          </Text>
                        </View>
                        {parsedDeposit > 0 && (
                          <View className="flex-row justify-between">
                            <Text className="font-inter text-xs text-bolt-success-text">Deposit Paid Now:</Text>
                            <Text className="font-inter-semibold text-xs text-bolt-success-text">
                              - {formatCurrency(parsedDeposit)}
                            </Text>
                          </View>
                        )}
                        <View className="flex-row justify-between pt-1 border-t border-bolt-divider">
                          <Text className="font-inter-bold text-xs text-bolt-danger-text">Remaining Debt Owed:</Text>
                          <Text className="font-poppins-bold text-sm text-bolt-danger-text">
                            {formatCurrency(balanceOwed)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>

          {/* ── Sticky Bottom Checkout Bar ──────────────────────────────────── */}
          <View
            className="px-5 pt-3.5 bg-bolt-card border-t border-bolt-divider shadow-lg flex-row items-center justify-between gap-3"
            style={[Shadows.header, { paddingBottom: Math.max(insets.bottom, 14) }]}
          >
            <View className="flex-1 min-w-0 pr-2">
              <Text numberOfLines={1} className="font-inter-medium text-xs text-bolt-slate">
                {isCredit ? "Balance Owed" : "Total Due"}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className={`font-poppins-bold text-2xl ${isCredit ? "text-bolt-danger-text" : "text-bolt-graphite"}`}
              >
                {formatCurrency(isCredit ? balanceOwed : cartTotal)}
              </Text>
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              onPress={handleConfirmSale}
              disabled={isSubmitting || cart.length === 0}
              className={`px-5 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-sm shrink-0 ${cart.length > 0 && !isSubmitting
                ? isCredit ? "bg-bolt-blue active:bg-bolt-primary-dark" : "bg-bolt-blue active:bg-bolt-primary-dark"
                : "bg-bolt-disabled"
                }`}
              accessibilityRole="button"
              accessibilityLabel={`Confirm and record sale for ${formatCurrency(cartTotal)}`}
            >
              <HugeiconsIcon icon={FlashIcon} size={18} color={Colors.card} />
              <Text
                numberOfLines={1}
                className="font-poppins-semibold text-bolt-card text-sm"
              >
                {isSubmitting
                  ? "Recording..."
                  : isCredit
                    ? `Record Credit Sale • ${formatCurrency(cartTotal)}`
                    : `Confirm • ${formatCurrency(cartTotal)}`}
              </Text>
            </TouchableOpacity>
          </View>

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        visible={isClearCartDialogOpen}
        title="Clear All Items?"
        message="Are you sure you want to remove all products from this sale?"
        confirmText="Clear All"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmClearCart}
        onCancel={() => setIsClearCartDialogOpen(false)}
      />

      {/* Direct Numeric Quantity Picker Modal */}
      <QuantityPickerModal
        visible={!!quantityPickerTarget}
        productName={quantityPickerTarget?.productName || ""}
        currentQty={quantityPickerTarget?.currentQty || 1}
        maxStock={quantityPickerTarget?.maxStock || 9999}
        unitPrice={quantityPickerTarget?.unitPrice || 0}
        onClose={() => setQuantityPickerTarget(null)}
        onConfirm={(newQty) => {
          if (quantityPickerTarget) {
            setDirectQty(quantityPickerTarget.productId, newQty);
          }
        }}
      />

      {/* Screen-locking loader during transaction commit */}
      <LoadingOverlay
        visible={isSubmitting}
        message="Recording Sale..."
        submessage="Generating receipt and updating stock"
      />
      </View>
    </SafeAreaView >
  );
}
