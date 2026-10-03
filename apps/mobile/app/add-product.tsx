import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import Tick01Icon from "@hugeicons/core-free-icons/Tick01Icon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import Share01Icon from "@hugeicons/core-free-icons/Share01Icon";
import Tag01Icon from "@hugeicons/core-free-icons/Tag01Icon";
import Grid02Icon from "@hugeicons/core-free-icons/Grid02Icon";
import TradeUpIcon from "@hugeicons/core-free-icons/TradeUpIcon";
import Alert02Icon from "@hugeicons/core-free-icons/Alert02Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Package01Icon from "@hugeicons/core-free-icons/Package01Icon";
import PrinterIcon from "@hugeicons/core-free-icons/PrinterIcon";

import ScreenHeader from "@/components/Elements/ScreenHeader";
import LoadingOverlay from "@/components/Elements/LoadingOverlay";
import StatusPill from "@/components/Elements/StatusPill";
import { Colors } from "@/lib/colors";
import { formatCurrency, getCurrencySymbol, parseNumberInput } from "@/lib/formatters";
import { useAppDataStore } from "@/store/AppDataStore";
import ProductQrLabel from "@/components/QR/ProductQrLabel";
import { useAddProductScreen } from "@/hooks/useAddProductScreen";
import { Shadows } from "@/lib/styles";

type FocusedField = "name" | "category" | "cost" | "sell" | "stock" | null;

export default function AddProductScreen() {
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  const {
    name,
    setName,
    category,
    costPrice,
    setCostPrice,
    sellingPrice,
    setSellingPrice,
    openingStock,
    setOpeningStock,
    isSubmitting,
    isExporting,
    isPrinting,
    createdProduct,
    categoryList,
    isAddingCategory,
    newCategoryInput,
    setNewCategoryInput,
    marginPreview,
    isValid,
    resetForm,
    handleBack,
    handleSubmit,
    handlePrintPdf,
    handleExportPdf,
    handleSelectCategory,
    handleStartAddCategory,
    handleCancelAddCategory,
    handleConfirmAddCategory,
  } = useAddProductScreen();

  const stockUnits = parseNumberInput(openingStock);
  const hasStock = stockUnits > 0;

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right", "bottom"]}>
      {/* ── Header (Static, outside KeyboardAvoidingView) ──────────────────── */}
      <ScreenHeader
        title={createdProduct ? "QR Code Label" : "Add New Product"}
        subtitle={
          createdProduct
            ? "QR sticker is ready for shelf or container labeling"
            : "Add items to your catalog and generate stickers"
        }
        onBack={handleBack}
      />

      {/* ── Screen Body ─────────────────────────────────────────────────── */}
      {createdProduct ? (
        /* ── STATE B: Success QR Sticker View ── */
        <View className="flex-1 justify-between">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingVertical: 20, paddingHorizontal: 16 }}
            className="flex-1"
          >
            {/* Celebratory Success Indicator (Aligned with SaleSuccess standard) */}
            <View className="items-center mb-5 mt-2">
              <View className="w-20 h-20 rounded-full bg-bolt-success-bg border-4 border-bolt-success-border items-center justify-center mb-3">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={44} color={Colors.mint} />
              </View>
              <Text className="font-poppins-bold text-2xl text-bolt-graphite text-center mb-1">
                Product Created!
              </Text>
              <Text className="font-inter text-xs text-bolt-slate text-center">
                QR sticker is ready for printing and container labeling
              </Text>
            </View>

            {/* Sticker Label Component */}
            <View className="items-center w-full max-w-sm mb-4">
              <ProductQrLabel product={createdProduct} size="standard" />
            </View>

            {/* Sticker Action Buttons: Print Sticker & Share PDF */}
            <View className="flex-row items-center gap-3 w-full max-w-sm mb-4">
              {/* Print Sticker */}
              <TouchableOpacity
                onPress={handlePrintPdf}
                disabled={isPrinting || isExporting}
                accessibilityRole="button"
                accessibilityLabel="Print QR sticker"
                className="flex-1 h-12 bg-bolt-surface border border-bolt-border rounded-xl flex-row items-center justify-center gap-2 active:bg-bolt-divider active:scale-[0.98]"
              >
                {isPrinting ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <HugeiconsIcon icon={PrinterIcon} size={16} color={Colors.graphite} />
                    <Text className="font-inter-semibold text-bolt-graphite text-xs">
                      Print Sticker
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Share PDF */}
              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={isPrinting || isExporting}
                accessibilityRole="button"
                accessibilityLabel="Share QR sticker PDF"
                className="flex-1 h-12 bg-bolt-surface border border-bolt-border rounded-xl flex-row items-center justify-center gap-2 active:bg-bolt-divider active:scale-[0.98]"
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <HugeiconsIcon icon={Share01Icon} size={16} color={Colors.graphite} />
                    <Text className="font-inter-semibold text-bolt-graphite text-xs">
                      Share PDF
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Fixed Navigation Dock */}
          <View className="px-4 pb-6 pt-3 border-t border-bolt-divider bg-bolt-card w-full">
            <View className="flex-row items-center gap-3">
              {/* Add Another */}
              <TouchableOpacity
                onPress={resetForm}
                accessibilityRole="button"
                accessibilityLabel="Add another product"
                className="flex-1 h-14 bg-bolt-surface border border-bolt-border rounded-2xl flex-row items-center justify-center gap-2 active:bg-bolt-divider active:scale-[0.98]"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} color={Colors.graphite} />
                <Text className="font-inter-semibold text-bolt-graphite text-sm">
                  Add Another
                </Text>
              </TouchableOpacity>

              {/* Done / Return to Inventory */}
              <TouchableOpacity
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Finish and go to inventory"
                className="flex-1 bg-bolt-blue h-14 rounded-2xl flex-row items-center justify-center gap-2 active:bg-bolt-primary-dark active:scale-[0.98] shadow-sm"
                style={Shadows.primaryButton}
              >
                <HugeiconsIcon icon={Tick01Icon} size={18} color="#FFFFFF" />
                <Text className="font-poppins-semibold text-white text-sm">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* ── STATE A: Creation Form ── */
        <View className="flex-1">
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
              paddingBottom: 24,
            }}
          >
            {/* Card 1: Product Details */}
            <View
              className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5"
              style={Shadows.card}
            >
              <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider mb-3">
                Product Details
              </Text>

              {/* Product Name */}
              <View className="mb-3.5">
                <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                  Product Name *
                </Text>
                <View
                  className={`h-12 flex-row items-center bg-bolt-surface border ${
                    focusedField === "name" ? "border-2 border-bolt-blue" : "border-bolt-border"
                  } rounded-xl px-3.5`}
                >
                  <HugeiconsIcon
                    icon={Tag01Icon}
                    size={18}
                    color={focusedField === "name" ? Colors.primary : Colors.slate}
                  />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Milo Refill 500g"
                    placeholderTextColor={Colors.slate}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite py-0"
                  />
                </View>
              </View>

              {/* Category */}
              <View>
                <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                  Category
                </Text>

                {isAddingCategory ? (
                  /* Inline Add Category Row */
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`flex-1 h-11 flex-row items-center bg-bolt-surface border ${
                        focusedField === "category" ? "border-2 border-bolt-blue" : "border-bolt-border"
                      } rounded-xl px-3`}
                    >
                      <HugeiconsIcon icon={Grid02Icon} size={16} color={Colors.primary} />
                      <TextInput
                        value={newCategoryInput}
                        onChangeText={setNewCategoryInput}
                        placeholder="New category name..."
                        placeholderTextColor={Colors.slate}
                        autoCapitalize="words"
                        autoFocus={true}
                        returnKeyType="done"
                        onSubmitEditing={handleConfirmAddCategory}
                        onFocus={() => setFocusedField("category")}
                        onBlur={() => setFocusedField(null)}
                        className="flex-1 ml-2 font-inter text-sm text-bolt-graphite py-0"
                      />
                      {newCategoryInput.trim().length > 0 && (
                        <TouchableOpacity
                          onPress={() => setNewCategoryInput("")}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={15} color={Colors.slate} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Confirm Button */}
                    <TouchableOpacity
                      onPress={handleConfirmAddCategory}
                      disabled={!newCategoryInput.trim()}
                      accessibilityRole="button"
                      accessibilityLabel="Add category"
                      className={`h-11 px-3.5 rounded-xl flex-row items-center justify-center gap-1 active:scale-[0.98] ${
                        newCategoryInput.trim() ? "bg-bolt-blue" : "bg-bolt-disabled opacity-60"
                      }`}
                    >
                      <HugeiconsIcon icon={Tick01Icon} size={14} color="#FFFFFF" />
                      <Text className="font-inter-semibold text-xs text-white">Add</Text>
                    </TouchableOpacity>

                    {/* Cancel Button */}
                    <TouchableOpacity
                      onPress={handleCancelAddCategory}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel adding category"
                      className="h-11 w-11 rounded-xl bg-bolt-surface border border-bolt-border items-center justify-center active:bg-bolt-divider"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Horizontal Category Chips + '+ New' Action */
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 6, paddingRight: 4 }}
                  >
                    {categoryList.map((cat) => {
                      const isSelected = category.toLowerCase().trim() === cat.toLowerCase().trim();
                      return (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => handleSelectCategory(cat)}
                          className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border active:scale-[0.98] ${
                            isSelected
                              ? "bg-bolt-blue border-bolt-blue"
                              : "bg-bolt-surface border-bolt-border active:bg-bolt-divider"
                          }`}
                          accessibilityRole="button"
                          accessibilityLabel={`Select category ${cat}`}
                        >
                          {isSelected && (
                            <HugeiconsIcon icon={Tick01Icon} size={12} color="#FFFFFF" />
                          )}
                          <Text
                            className={`font-inter-medium text-xs ${
                              isSelected ? "text-white font-inter-semibold" : "text-bolt-graphite"
                            }`}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Add New Category Pill Button */}
                    <TouchableOpacity
                      onPress={handleStartAddCategory}
                      className="flex-row items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-bolt-blue/60 bg-bolt-light active:bg-bolt-blue/20 active:scale-[0.98]"
                      accessibilityRole="button"
                      accessibilityLabel="Create a new category"
                    >
                      <HugeiconsIcon icon={Add01Icon} size={13} color={Colors.primary} />
                      <Text className="font-inter-semibold text-xs text-bolt-blue">
                        New Category
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Card 2: Pricing & Profit */}
            <View
              className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5"
              style={Shadows.card}
            >
              <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider mb-3">
                Pricing & Profit
              </Text>

              <View className="flex-row gap-3 mb-3">
                {/* Cost Price */}
                <View className="flex-1">
                  <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                    Cost Price *
                  </Text>
                  <View
                    className={`h-12 flex-row items-center bg-bolt-surface border ${
                      focusedField === "cost" ? "border-2 border-bolt-blue" : "border-bolt-border"
                    } rounded-xl px-3.5`}
                  >
                    <Text className="font-inter-bold text-sm text-bolt-slate mr-1.5">
                      {currency}
                    </Text>
                    <TextInput
                      value={costPrice}
                      onChangeText={setCostPrice}
                      placeholder="0"
                      placeholderTextColor={Colors.slate}
                      keyboardType="numeric"
                      returnKeyType="next"
                      onFocus={() => setFocusedField("cost")}
                      onBlur={() => setFocusedField(null)}
                      className="flex-1 font-inter-semibold text-bolt-graphite text-base py-0"
                    />
                  </View>
                </View>

                {/* Selling Price */}
                <View className="flex-1">
                  <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                    Selling Price *
                  </Text>
                  <View
                    className={`h-12 flex-row items-center bg-bolt-surface border ${
                      focusedField === "sell" ? "border-2 border-bolt-blue" : "border-bolt-border"
                    } rounded-xl px-3.5`}
                  >
                    <Text className="font-inter-bold text-sm text-bolt-blue mr-1.5">
                      {currency}
                    </Text>
                    <TextInput
                      value={sellingPrice}
                      onChangeText={setSellingPrice}
                      placeholder="0"
                      placeholderTextColor={Colors.slate}
                      keyboardType="numeric"
                      returnKeyType="next"
                      onFocus={() => setFocusedField("sell")}
                      onBlur={() => setFocusedField(null)}
                      className="flex-1 font-inter-semibold text-bolt-blue text-base py-0"
                    />
                  </View>
                </View>
              </View>

              {/* State-Aware Profit Reality Check */}
              {marginPreview && (
                <StatusPill
                  variant={
                    marginPreview.status === "profit"
                      ? "success"
                      : marginPreview.status === "loss"
                      ? "danger"
                      : "neutral"
                  }
                  icon={
                    marginPreview.status === "profit"
                      ? TradeUpIcon
                      : marginPreview.status === "loss"
                      ? Alert02Icon
                      : undefined
                  }
                  label={
                    marginPreview.status === "profit"
                      ? "Profit per item:"
                      : marginPreview.status === "loss"
                      ? "Selling below cost:"
                      : "Break-even:"
                  }
                  value={
                    marginPreview.status === "profit"
                      ? `+${formatCurrency(marginPreview.profit)} (${marginPreview.pct}%)`
                      : marginPreview.status === "loss"
                      ? `-${formatCurrency(Math.abs(marginPreview.profit))} loss / item`
                      : `${formatCurrency(0)} profit (Selling at cost)`
                  }
                />
              )}
            </View>

            {/* Card 3: Stock Setup */}
            <View
              className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-2"
              style={Shadows.card}
            >
              <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider mb-3">
                Inventory
              </Text>

              <View>
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="font-inter-medium text-bolt-graphite text-xs">
                    Starting Stock
                  </Text>
                  <Text className="font-inter text-xs text-bolt-slate">
                    (Optional)
                  </Text>
                </View>
                <View
                  className={`h-12 flex-row items-center bg-bolt-surface border ${
                    focusedField === "stock" ? "border-2 border-bolt-blue" : "border-bolt-border"
                  } rounded-xl px-3.5`}
                >
                  <TextInput
                    value={openingStock}
                    onChangeText={setOpeningStock}
                    placeholder="0"
                    placeholderTextColor={Colors.slate}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onFocus={() => setFocusedField("stock")}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 font-inter-semibold text-bolt-graphite text-base py-0"
                  />
                  <Text className="font-inter text-xs text-bolt-slate ml-2">units</Text>
                </View>

                {/* Real-time Inventory Status Pill */}
                <StatusPill
                  variant={hasStock ? "success" : "neutral"}
                  icon={hasStock ? Tick01Icon : Package01Icon}
                  label="Stock Status:"
                  value={
                    hasStock
                      ? `${stockUnits.toLocaleString()} ${stockUnits === 1 ? "unit" : "units"} in stock`
                      : "Out of Stock (Catalog only)"
                  }
                  className="mt-3"
                />
              </View>
            </View>
          </KeyboardAwareScrollView>

          {/* Sticky Bottom Action Dock */}
          <View className="px-4 pt-3 pb-6 bg-bolt-card border-t border-bolt-divider">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !isValid}
              accessibilityRole="button"
              accessibilityLabel="Save product and generate label"
              className={`rounded-2xl h-14 flex-row items-center justify-center gap-2 active:scale-[0.98] ${
                !isValid || isSubmitting
                  ? "bg-bolt-disabled opacity-60"
                  : "bg-bolt-blue active:bg-bolt-primary-dark shadow-sm"
              }`}
              style={isValid && !isSubmitting ? Shadows.primaryButton : undefined}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <HugeiconsIcon icon={Add01Icon} size={18} color="#FFFFFF" />
                  <Text className="font-poppins-semibold text-white text-base">
                    Save Product
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Screen-locking loader during product creation */}
      <LoadingOverlay
        visible={isSubmitting}
        message="Saving Product..."
        submessage="Creating catalog entry & QR code"
      />
    </SafeAreaView>
  );
}
