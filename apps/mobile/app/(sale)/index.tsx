import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import MinusSignIcon from '@hugeicons/core-free-icons/MinusSignIcon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import ShoppingCart01Icon from '@hugeicons/core-free-icons/ShoppingCart01Icon';
import ArrowRight02Icon from '@hugeicons/core-free-icons/ArrowRight02Icon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import QrCode01Icon from '@hugeicons/core-free-icons/QrCode01Icon';
import Edit02Icon from '@hugeicons/core-free-icons/Edit02Icon';
import * as Haptics from "expo-haptics";
import BackButton from "@/components/Elements/BackButton";
import ConfirmDialog from "@/components/Elements/ConfirmDialog";
import QuantityPickerModal from "@/components/Elements/QuantityPickerModal";
import BarcodeScannerModal from "@/components/Scanner/BarcodeScannerModal";
import { SaleProductRow } from "@/components/SaleProductRow";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { useSaleCatalog } from "@/hooks/useSaleCatalog";
import { ProductWithStock } from "@/types/models";
import { Shadows } from "@/lib/styles";



export default function SaleCatalogScreen() {
  const {
    cart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredProducts,
    totalItemsCount,
    cartSubtotal,
    isScannerOpen,
    setIsScannerOpen,
    isDiscardDialogOpen,
    setIsDiscardDialogOpen,
    quantityPickerTarget,
    setQuantityPickerTarget,
    addToCart,
    updateQty,
    setDirectQty,
    handleExitToDashboard,
    handleConfirmDiscard,
    handleReviewSale,
    handleProductScanned,
    cartQtyMap,
    handleAddToCart,
    handleMinusQty,
    handleOpenPicker,
  } = useSaleCatalog();

  const renderProductItem = React.useCallback(
    ({ item: product, index }: { item: ProductWithStock; index: number }) => {
      const qty = cartQtyMap.get(product.id) || 0;
      return (
        <SaleProductRow
          product={product}
          cartQty={qty}
          isLast={index === filteredProducts.length - 1}
          onAdd={handleAddToCart}
          onMinus={handleMinusQty}
          onOpenPicker={handleOpenPicker}
        />
      );
    },
    [cartQtyMap, filteredProducts.length, handleAddToCart, handleMinusQty, handleOpenPicker]
  );

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      <View className="flex-1 flex-col justify-between">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-bolt-border bg-bolt-card">
          <View className="flex-row items-center flex-1">
            <BackButton onPress={handleExitToDashboard} accessibilityLabel="Back to dashboard" />
            <View>
              <Text className="font-poppins-bold text-lg text-bolt-graphite leading-tight">
                Record a Sale
              </Text>
              <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
                {totalItemsCount > 0 ? `${totalItemsCount} item(s) selected` : "Select products"}
              </Text>
            </View>
          </View>

          {/* Barcode Scanner Button with Text */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsScannerOpen(true);
            }}
            className="bg-bolt-surface border border-bolt-border rounded-xl h-9 px-3 flex-row items-center justify-center gap-1.5 active:bg-bolt-divider"
            accessibilityRole="button"
            accessibilityLabel="Scan barcode"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <HugeiconsIcon icon={QrCode01Icon} size={15} color={Colors.primary} />
            <Text className="text-bolt-blue text-xs font-inter-semibold">Scan</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar & Category Filter Chips ──────────────────────────── */}
        <View className="px-4 pt-3 pb-2">
          {/* 48px Search Bar */}
          <View className="flex-row items-center bg-bolt-card border border-bolt-border rounded-2xl px-3.5 h-12">
            <HugeiconsIcon icon={Search01Icon} size={18} color={Colors.slate} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products or category..."
              placeholderTextColor={Colors.slate}
              className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite py-0"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Category Filter Chips */}
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
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCategory(cat);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter category ${cat}`}
                      className={`px-3.5 py-1.5 rounded-full border ${
                        isSelected
                          ? "bg-bolt-blue border-bolt-blue"
                          : "bg-bolt-card border-bolt-border"
                      }`}
                    >
                      <Text
                        className={`font-inter-medium text-xs ${
                          isSelected ? "text-white font-inter-semibold" : "text-bolt-slate"
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

        {/* ── Product Catalog List: Single Unified Grouped Card ───────────── */}
        <View className="flex-1 px-4 pt-1">
          {filteredProducts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <View className="w-12 h-12 rounded-2xl bg-bolt-light items-center justify-center mb-3">
                <HugeiconsIcon icon={Package01Icon} size={22} color={Colors.primary} />
              </View>
              <Text className="font-poppins-semibold text-sm text-bolt-graphite mb-1">
                No products found
              </Text>
              <Text className="font-inter text-xs text-bolt-slate text-center px-6">
                {searchQuery
                  ? `No items match "${searchQuery}" in ${selectedCategory}`
                  : "Add products in the Inventory tab to start selling."}
              </Text>
            </View>
          ) : (
            <View
              className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden flex-1 mb-2"
              style={Shadows.card}
            >
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                extraData={cart}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === "android"}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: cart.length > 0 ? 100 : 24,
                }}
                renderItem={renderProductItem}
              />
            </View>
          )}
        </View>

        {/* ── Sticky Bottom Cart Bar ───────────────────────────────────────── */}
        {cart.length > 0 && (
          <View
            className="px-5 py-3.5 bg-bolt-card border-t border-bolt-divider shadow-lg flex-row justify-between items-center"
            style={Shadows.header}
          >
            <View>
              <View className="flex-row items-center gap-1.5">
                <HugeiconsIcon icon={ShoppingCart01Icon} size={14} color={Colors.primary} />
                <Text className="font-inter-medium text-xs text-bolt-slate">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in cart
                </Text>
              </View>
              <Text className="font-poppins-bold text-xl text-bolt-graphite">
                {formatCurrency(cartSubtotal)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleReviewSale}
              className="bg-bolt-blue px-5 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-sm active:bg-bolt-primary-dark"
              accessibilityRole="button"
              accessibilityLabel="Review sale and proceed to checkout"
            >
              <Text className="font-poppins-semibold text-bolt-card text-xs">
                Review Sale
              </Text>
              <HugeiconsIcon icon={ArrowRight02Icon} size={15} color={Colors.card} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Discard Sale Confirmation Dialog */}
      <ConfirmDialog
        visible={isDiscardDialogOpen}
        title="Discard Active Sale?"
        message="You have items in your cart. Leaving now will discard this sale."
        confirmText="Discard & Exit"
        cancelText="Keep Editing"
        confirmVariant="danger"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setIsDiscardDialogOpen(false)}
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

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductScanned={handleProductScanned}
      />
    </SafeAreaView>
  );
}
