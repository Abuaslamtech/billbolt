import React, { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import MinusSignIcon from '@hugeicons/core-free-icons/MinusSignIcon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import PackageReceiveIcon from '@hugeicons/core-free-icons/PackageReceiveIcon';
import QrCode01Icon from '@hugeicons/core-free-icons/QrCode01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import CheckmarkBadge01Icon from '@hugeicons/core-free-icons/CheckmarkBadge01Icon';
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

import BackButton from "@/components/Elements/BackButton";
import BarcodeScannerModal from "@/components/Scanner/BarcodeScannerModal";
import { QuantityPickerModal } from "@/components/Elements/QuantityPickerModal";
import { Colors } from "@/lib/colors";
import { formatCurrency, getCurrencySymbol } from "@/lib/formatters";
import { useRestockScreen, RestockItem } from "@/hooks/useRestockScreen";
import { ProductWithStock } from "@/types/models";
import { useAppDataStore } from "@/store/AppDataStore";
import { Shadows } from "@/lib/styles";

// ── Step 1 Row Component (Select/Deselect) ────────────────────────────────────
interface ProductSelectRowProps {
  product: ProductWithStock;
  isSelected: boolean;
  isLast: boolean;
  onToggle: (product: ProductWithStock, isSelected: boolean) => void;
}

const ProductSelectRow = React.memo(
  function ProductSelectRow({ product, isSelected, isLast, onToggle }: ProductSelectRowProps) {
    const isOutOfStock = product.currentStock <= 0;
    const isLowStock =
      product.currentStock > 0 && product.currentStock <= (product.reorderLevel || 5);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(product, isSelected)}
        className={`px-4 py-3.5 flex-row items-center justify-between ${!isLast ? "border-b border-bolt-divider" : ""
          } ${isSelected ? "bg-blue-50/40" : ""}`}
      >
        <View className="flex-1 pr-3">
          <Text numberOfLines={1} className="font-poppins-semibold text-sm text-bolt-graphite leading-snug">
            {product.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="font-inter text-xs text-bolt-slate">
              Cost: {formatCurrency(product.costPrice)}
            </Text>
            <Text className="text-bolt-slate text-2xs">•</Text>
            <View
              className={`px-2 py-0.5 rounded-full ${isOutOfStock ? "bg-bolt-danger-bg" : isLowStock ? "bg-bolt-warning-bg" : "bg-bolt-surface"
                }`}
            >
              <Text
                className={`font-inter-semibold text-2xs ${isOutOfStock ? "text-bolt-danger-text" : isLowStock ? "text-bolt-warning-text" : "text-bolt-slate"
                  }`}
              >
                {isOutOfStock ? "Out of Stock" : `${product.currentStock} in stock`}
              </Text>
            </View>
          </View>
        </View>

        <View
          className={`w-6 h-6 rounded-full border items-center justify-center ${isSelected ? "bg-bolt-blue border-bolt-blue" : "bg-bolt-surface border-bolt-border"
            }`}
        >
          {isSelected && <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} color={Colors.surface} />}
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isLast === next.isLast &&
    prev.product.id === next.product.id &&
    prev.product.currentStock === next.product.currentStock
);

// ── Step 2 Row Component (Adjust Quantity & Cost) ───────────────────────────
interface ProductAdjustRowProps {
  product: ProductWithStock;
  batchItem: RestockItem;
  isLast: boolean;
  onUpdateQty: (productId: string, delta: number) => void;
  onOpenPicker: (product: ProductWithStock, currentQty: number, cost: number) => void;
  onUpdateCost: (productId: string, cost: string) => void;
  onRemove: (productId: string) => void;
}

const ProductAdjustRow = React.memo(
  function ProductAdjustRow({
    product,
    batchItem,
    isLast,
    onUpdateQty,
    onOpenPicker,
    onUpdateCost,
    onRemove,
  }: ProductAdjustRowProps) {
    return (
      <View className={`px-4 py-3.5 bg-blue-50/20 ${!isLast ? "border-b border-bolt-divider" : ""}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text numberOfLines={1} className="font-poppins-semibold text-sm text-bolt-graphite leading-snug">
              {product.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Text className="font-inter text-xs text-bolt-slate">
                Current: {product.currentStock}
              </Text>
              <Text className="text-bolt-slate text-2xs">•</Text>
              <Text className="font-inter-medium text-xs text-bolt-blue">
                New: {product.currentStock + batchItem.qty}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-bolt-surface border border-bolt-blue/30 rounded-2xl p-1">
            <TouchableOpacity
              onPress={() => (batchItem.qty <= 1 ? onRemove(product.id) : onUpdateQty(product.id, -1))}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-8 h-8 rounded-xl bg-bolt-card items-center justify-center active:bg-bolt-divider"
            >
              <HugeiconsIcon
                icon={batchItem.qty <= 1 ? Delete02Icon : MinusSignIcon}
                size={14}
                color={batchItem.qty <= 1 ? Colors.danger.text : Colors.graphite}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onOpenPicker(product, batchItem.qty, batchItem.costPerUnit)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              className="px-2.5 items-center justify-center min-w-[36px] h-8 rounded-lg active:bg-bolt-divider"
            >
              <Text className="font-poppins-bold text-sm text-bolt-blue text-center">
                +{batchItem.qty}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onUpdateQty(product.id, 1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-8 h-8 rounded-xl bg-bolt-card items-center justify-center active:bg-bolt-divider"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} color={Colors.graphite} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-bolt-divider/60">
          <TouchableOpacity onPress={() => onRemove(product.id)} className="flex-row items-center gap-1 py-1">
            <HugeiconsIcon icon={Delete02Icon} size={14} color={Colors.danger.text} />
            <Text className="font-inter-medium text-2xs text-bolt-danger-text">Remove</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5">
            <Text className="font-inter text-2xs text-bolt-slate">Unit Cost:</Text>
            <View className="flex-row items-center bg-bolt-card border border-bolt-border rounded-lg px-2 h-7">
              <Text className="font-inter text-2xs text-bolt-slate mr-0.5">
                {getCurrencySymbol(useAppDataStore.getState().businessInfo?.currency)}
              </Text>
              <TextInput
                value={batchItem.costPerUnit.toString()}
                onChangeText={(txt) => onUpdateCost(product.id, txt)}
                keyboardType="decimal-pad"
                className="font-inter-semibold text-xs text-bolt-graphite min-w-[50px] py-0"
              />
            </View>
          </View>
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.batchItem.qty === next.batchItem.qty &&
    prev.batchItem.costPerUnit === next.batchItem.costPerUnit &&
    prev.isLast === next.isLast &&
    prev.product.id === next.product.id
);

type RestockStep = "SELECT_PRODUCTS" | "ADJUST_QUANTITIES" | "SUCCESS";

export default function RestockScreen() {
  const { products } = useAppDataStore();
  const {
    step,
    setStep,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isScannerOpen,
    setIsScannerOpen,
    isSubmitting,
    batch,
    batchMap,
    lastRestockedSummary,
    quantityPickerTarget,
    setQuantityPickerTarget,
    categories,
    filteredProducts,
    totalUnits,
    totalSpend,
    handleToggleSelect,
    handleUpdateQty,
    handleSetDirectQty,
    handleUpdateCost,
    handleRemove,
    handleOpenPicker,
    handleProductScanned,
    handleSubmitRestock,
    router,
  } = useRestockScreen();

  const renderSelectRow = useCallback(
    ({ item: product, index }: { item: ProductWithStock; index: number }) => {
      return (
        <ProductSelectRow
          product={product}
          isSelected={batchMap.has(product.id)}
          isLast={index === filteredProducts.length - 1}
          onToggle={handleToggleSelect}
        />
      );
    },
    [batchMap, filteredProducts.length, handleToggleSelect]
  );

  const renderAdjustRow = useCallback(
    ({ item: batchItem, index }: { item: RestockItem; index: number }) => {
      const product = products.find((p) => p.id === batchItem.productId);
      if (!product) return null;
      return (
        <ProductAdjustRow
          product={product}
          batchItem={batchItem}
          isLast={index === batch.length - 1}
          onUpdateQty={handleUpdateQty}
          onOpenPicker={handleOpenPicker}
          onUpdateCost={handleUpdateCost}
          onRemove={handleRemove}
        />
      );
    },
    [products, batch.length, handleUpdateQty, handleOpenPicker, handleUpdateCost, handleRemove]
  );

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      {step === "SUCCESS" && lastRestockedSummary ? (
        <View className="flex-1 px-4 py-8 items-center justify-between">
          <View className="items-center w-full mt-8">
            <View className="w-16 h-16 rounded-full bg-bolt-success-bg border border-bolt-success-border items-center justify-center mb-4">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} color={Colors.success.text} />
            </View>
            <Text className="font-poppins-bold text-xl text-bolt-graphite text-center mb-1">
              Restock Logged Successfully
            </Text>
            <Text className="font-inter text-sm text-bolt-slate text-center mb-6">
              Inventory and accounting records have been updated.
            </Text>
            <View className="w-full bg-bolt-card border border-bolt-border rounded-3xl p-5 gap-3">
              <View className="flex-row justify-between py-1 border-b border-bolt-divider">
                <Text className="font-inter text-xs text-bolt-slate">Products Restocked</Text>
                <Text className="font-poppins-bold text-sm text-bolt-graphite">
                  {lastRestockedSummary.itemsCount} {lastRestockedSummary.itemsCount === 1 ? "item" : "items"}
                </Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-bolt-divider">
                <Text className="font-inter text-xs text-bolt-slate">Total Units Added</Text>
                <Text className="font-poppins-bold text-sm text-bolt-blue">
                  +{lastRestockedSummary.unitsCount} units
                </Text>
              </View>
              <View className="flex-row justify-between pt-1">
                <Text className="font-inter-semibold text-xs text-bolt-graphite">Total Restock Spend</Text>
                <Text className="font-poppins-bold text-base text-bolt-graphite">
                  {formatCurrency(lastRestockedSummary.totalSpend)}
                </Text>
              </View>
            </View>
          </View>
          <SafeAreaView edges={["bottom"]} className="w-full">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-full bg-bolt-blue h-14 rounded-2xl items-center justify-center active:bg-bolt-primary-dark"
              style={Shadows.primaryButton}
            >
              <Text className="font-poppins-semibold text-white text-base">Back to Inventory</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      ) : step === "SELECT_PRODUCTS" ? (
        <View className="flex-1 flex-col justify-between">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-bolt-border bg-bolt-card">
            <View className="flex-row items-center flex-1">
              <BackButton onPress={() => router.back()} accessibilityLabel="Back to inventory" />
              <View>
                <Text className="font-poppins-bold text-lg text-bolt-graphite leading-tight">
                  Restock Items
                </Text>
                <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
                  Select products for shipment
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsScannerOpen(true);
              }}
              className="bg-bolt-surface border border-bolt-border rounded-xl h-9 px-3 flex-row items-center justify-center gap-1.5 active:bg-bolt-divider"
            >
              <HugeiconsIcon icon={QrCode01Icon} size={15} color={Colors.primary} />
              <Text className="text-bolt-blue text-xs font-inter-semibold">Scan</Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 pt-3 pb-2">
            <View className="flex-row items-center bg-bolt-card border border-bolt-border rounded-2xl px-3.5 h-12">
              <HugeiconsIcon icon={Search01Icon} size={18} color={Colors.slate} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products..."
                placeholderTextColor={Colors.slate}
                className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite py-0"
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {categories.length > 1 && (
            <View className="pl-4 pb-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-1.5 pr-4">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedCategory(cat);
                        }}
                        className={`px-3.5 py-1.5 rounded-full border ${isSelected ? "bg-bolt-blue border-bolt-blue" : "bg-bolt-card border-bolt-border"
                          }`}
                      >
                        <Text
                          className={`font-inter-medium text-xs ${isSelected ? "text-white font-inter-semibold" : "text-bolt-slate"
                            }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <View className="flex-1 px-4 pt-1">
            {filteredProducts.length === 0 ? (
              <View className="flex-1 items-center justify-center py-16">
                <View className="w-12 h-12 rounded-2xl bg-bolt-light items-center justify-center mb-3">
                  <HugeiconsIcon icon={Package01Icon} size={22} color={Colors.primary} />
                </View>
                <Text className="font-poppins-semibold text-sm text-bolt-graphite mb-1">
                  No products found
                </Text>
              </View>
            ) : (
              <View className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden flex-1 mb-2">
                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item.id}
                  extraData={batch}
                  initialNumToRender={15}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  removeClippedSubviews={Platform.OS === "android"}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderSelectRow}
                  contentContainerStyle={{ paddingBottom: batch.length > 0 ? 90 : 24 }}
                />
              </View>
            )}
          </View>

          {batch.length > 0 && (
            <SafeAreaView edges={["bottom"]} className="bg-bolt-card border-t border-bolt-border px-4 pt-3 pb-3 absolute bottom-0 w-full shadow-sm">
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStep("ADJUST_QUANTITIES");
                }}
                className="w-full bg-bolt-blue h-14 rounded-2xl items-center justify-center flex-row gap-2 active:bg-bolt-primary-dark"
              >
                <Text className="font-poppins-semibold text-white text-base">
                  Continue to Details ({batch.length} {batch.length === 1 ? "item" : "items"})
                </Text>
              </TouchableOpacity>
            </SafeAreaView>
          )}
        </View>
      ) : (
        // ADJUST_QUANTITIES step
        <View className="flex-1 flex-col justify-between">
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-bolt-border bg-bolt-card">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStep("SELECT_PRODUCTS");
                }}
                className="w-10 h-10 rounded-full items-center justify-center -ml-2 mr-2 active:bg-bolt-surface"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={Colors.graphite} />
              </TouchableOpacity>
              <View>
                <Text className="font-poppins-bold text-lg text-bolt-graphite leading-tight">
                  Review Restock
                </Text>
                <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
                  Adjust quantities and cost
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-1 px-4 pt-4">
            {batch.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="font-inter text-sm text-bolt-slate">No items selected.</Text>
                <TouchableOpacity
                  onPress={() => setStep("SELECT_PRODUCTS")}
                  className="mt-4 px-4 py-2 bg-bolt-surface border border-bolt-border rounded-xl"
                >
                  <Text className="font-inter-semibold text-bolt-blue">Go Back to Select</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden flex-1 mb-2">
                <FlatList
                  data={batch}
                  keyExtractor={(item) => item.productId}
                  showsVerticalScrollIndicator={false}
                  renderItem={renderAdjustRow}
                  contentContainerStyle={{ paddingBottom: 110 }}
                />
              </View>
            )}
          </View>

          {batch.length > 0 && (
            <SafeAreaView edges={["bottom"]} className="bg-bolt-card border-t border-bolt-border px-4 pt-3 pb-3 absolute bottom-0 w-full shadow-sm">
              <View className="flex-row items-center justify-between mb-2.5">
                <View>
                  <Text className="font-inter text-2xs text-bolt-slate uppercase tracking-wider">
                    Total Spend
                  </Text>
                  <Text className="font-poppins-bold text-lg text-bolt-graphite">
                    {formatCurrency(totalSpend)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-inter text-2xs text-bolt-slate">Total Units</Text>
                  <Text className="font-poppins-semibold text-sm text-bolt-blue">
                    +{totalUnits}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmitRestock}
                disabled={isSubmitting}
                className="w-full bg-bolt-blue h-14 rounded-2xl items-center justify-center flex-row gap-2 active:bg-bolt-primary-dark"
                style={Shadows.primaryButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.card} />
                ) : (
                  <>
                    <HugeiconsIcon icon={PackageReceiveIcon} size={20} color={Colors.card} />
                    <Text className="font-poppins-semibold text-white text-base">
                      Confirm Restock
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </SafeAreaView>
          )}
        </View>
      )}

      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductScanned={(prod) => {
          handleProductScanned(prod);
          setIsScannerOpen(false);
        }}
      />

      {quantityPickerTarget && (
        <QuantityPickerModal
          visible={!!quantityPickerTarget}
          productName={quantityPickerTarget.productName}
          currentQty={quantityPickerTarget.currentQty}
          maxStock={99999}
          unitPrice={quantityPickerTarget.cost}
          mode="restock"
          onClose={() => setQuantityPickerTarget(null)}
          onConfirm={(newQty) => {
            handleSetDirectQty(quantityPickerTarget.productId, newQty);
          }}
        />
      )}
    </SafeAreaView>
  );
}
