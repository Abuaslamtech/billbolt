import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Add01Icon,
  Cancel01Icon,
  FlashIcon,
  Calendar03Icon,
  Tag01Icon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@hugeicons/core-free-icons";
import BackButton from "@/components/Elements/BackButton";
import ConfirmDialog from "@/components/Elements/ConfirmDialog";
import QuantityPickerModal from "@/components/Elements/QuantityPickerModal";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { useAppDataStore } from "@/store/AppDataStore";
import { getCurrencySymbol } from "@/lib/formatters";
import { useSaleCheckout } from "@/hooks/useSaleCheckout";
import { Shadows } from "@/lib/styles";

export default function SaleCheckoutScreen() {
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
  } = useSaleCheckout();

  // Customer info is optional and collapsed by default to avoid screen clutter
  const [isCustomerOpen, setIsCustomerOpen] = useState(
    Boolean(customerName || customerPhone)
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
          extraScrollHeight={20}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
            {/* ── SECTION 1: Payment Method (The #1 Checkout Decision) ──────── */}
            <View className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5">
              <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider mb-2.5">
                Select Payment Method
              </Text>

              <View className="flex-row gap-2">
                {(["Transfer", "Cash", "Card"] as const).map((method) => {
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
                        className={`text-sm ${isSelected
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
                  <View className="mt-3 pt-3 border-t border-bolt-divider gap-2.5 bg-bolt-surface p-3 rounded-xl border border-bolt-border">
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
                        : "Optional · Walk-in customer"}
                    </Text>
                  </View>
                </View>

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
              </View>

              {/* Full-width, comfortable inputs when opened */}
              {isCustomerOpen && (
                <View className="mt-3 pt-3 border-t border-bolt-divider gap-2.5">
                  <View>
                    <Text className="font-inter-medium text-xs text-bolt-slate mb-1">
                      Customer Name
                    </Text>
                    <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11 justify-center">
                      <TextInput
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="e.g. Amaka Okafor"
                        placeholderTextColor={Colors.slate}
                        className="font-inter text-sm text-bolt-graphite py-0"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="font-inter-medium text-xs text-bolt-slate mb-1">
                      Phone Number
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
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>

          {/* ── Sticky Bottom Checkout Bar ──────────────────────────────────── */}
          <View
            className="px-5 py-3.5 bg-bolt-card border-t border-bolt-divider shadow-lg flex-row items-center justify-between"
            style={Shadows.header}
          >
            <View>
              <Text className="font-inter-medium text-xs text-bolt-slate">
                Total Due
              </Text>
              <Text className="font-poppins-bold text-2xl text-bolt-graphite">
                {formatCurrency(cartTotal)}
              </Text>
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              onPress={handleConfirmSale}
              disabled={isSubmitting || cart.length === 0}
              className={`px-6 py-4 rounded-2xl flex-row items-center gap-2 shadow-sm ${cart.length > 0 && !isSubmitting
                ? "bg-bolt-blue active:bg-bolt-primary-dark"
                : "bg-bolt-disabled"
                }`}
              accessibilityRole="button"
              accessibilityLabel={`Confirm and record sale for ${formatCurrency(cartTotal)}`}
            >
              <HugeiconsIcon icon={FlashIcon} size={18} color={Colors.card} />
              <Text className="font-poppins-semibold text-bolt-card text-sm">
                {isSubmitting ? "Recording..." : "Confirm Sale"}
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
      </View>
    </SafeAreaView >
  );
}
