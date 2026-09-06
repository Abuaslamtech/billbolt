import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import PackageReceiveIcon from '@hugeicons/core-free-icons/PackageReceiveIcon';
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import CancelCircleIcon from '@hugeicons/core-free-icons/CancelCircleIcon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import QrCode01Icon from '@hugeicons/core-free-icons/QrCode01Icon';

import Header from "@/components/Header";
import ProductQrLabelModal from "@/components/QR/ProductQrLabelModal";
import { ProductWithStock } from "@/types/models";
import { Colors } from "@/lib/colors";
import { useInventoryScreen } from "@/hooks/useInventoryScreen";
import { Shadows } from "@/lib/styles";

export default function InventoryScreen() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    handleSelectCategory,
    statusFilter,
    setStatusFilter,
    handleStatusFilterChange,
    loadMore,
    hasMore,
    categories,
    filteredProducts,
    displayedProducts,
    totalProductsCount,
    lowStockCount,
    outOfStockCount,
    refreshing,
    handleRefresh,
    fmt,
    isAddModalVisible,
    setIsAddModalVisible,
    openAddModal,
    openRestockModal,
    handleRestockProduct,
  } = useInventoryScreen();

  const [selectedQrProduct, setSelectedQrProduct] = useState<ProductWithStock | null>(null);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  const isHealthy = lowStockCount === 0 && outOfStockCount === 0;

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }}
      >
        {/* ── 1. Context First: Signature Stock Overview Card ─────────── */}
        <View
          className="bg-bolt-card rounded-2xl mb-3.5 border border-bolt-border overflow-hidden"
          style={Shadows.card}
        >
          {/* Top Brand Gradient Accent Band (4px) */}
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 4, width: "100%" }}
          />

          <View className="p-4">
            {/* Header Row: Title & Overall Health Badge */}
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="font-poppins-bold text-base text-bolt-graphite">
                  Stock Overview
                </Text>
                <Text className="font-inter text-xs text-bolt-slate">
                  {totalProductsCount === 1 ? "1 product tracked" : `${totalProductsCount} products tracked`}
                </Text>
              </View>

              <View
                className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${outOfStockCount > 0
                    ? "bg-bolt-danger-bg border-bolt-danger-border"
                    : lowStockCount > 0
                      ? "bg-bolt-warning-bg border-bolt-warning-border"
                      : "bg-bolt-success-bg border-bolt-success-border"
                  }`}
              >
                <HugeiconsIcon
                  icon={
                    outOfStockCount > 0
                      ? CancelCircleIcon
                      : lowStockCount > 0
                        ? Alert02Icon
                        : CheckmarkCircle02Icon
                  }
                  size={12}
                  color={
                    outOfStockCount > 0
                      ? Colors.danger.text
                      : lowStockCount > 0
                        ? Colors.warning.text
                        : Colors.success.text
                  }
                />
                <Text
                  className={`font-inter-semibold text-2xs ${outOfStockCount > 0
                      ? "text-bolt-danger-text"
                      : lowStockCount > 0
                        ? "text-bolt-warning-text"
                        : "text-bolt-success-text"
                    }`}
                >
                  {outOfStockCount > 0
                    ? `${outOfStockCount} Out of Stock`
                    : lowStockCount > 0
                      ? `${lowStockCount} Low on Stock`
                      : "All Stock Healthy"}
                </Text>
              </View>
            </View>

            {/* 3 Interactive Quick-Filter Segments */}
            <View className="flex-row items-center pt-2.5 border-t border-bolt-divider">
              {/* Total Products */}
              <TouchableOpacity
                onPress={() => handleStatusFilterChange("ALL")}
                accessibilityRole="button"
                accessibilityLabel="Filter all products"
                activeOpacity={0.7}
                className={`flex-1 items-center py-1.5 rounded-xl ${statusFilter === "ALL" ? "bg-bolt-light" : ""
                  }`}
              >
                <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Total</Text>
                <Text
                  className={`font-poppins-bold text-base ${statusFilter === "ALL" ? "text-bolt-blue" : "text-bolt-graphite"
                    }`}
                >
                  {totalProductsCount}
                </Text>
              </TouchableOpacity>

              <View className="w-[1px] h-7 bg-bolt-divider" />

              {/* Low Stock */}
              <TouchableOpacity
                onPress={() => handleStatusFilterChange("LOW_STOCK")}
                accessibilityRole="button"
                accessibilityLabel="Filter low stock products"
                activeOpacity={0.7}
                className={`flex-1 items-center py-1.5 rounded-xl ${statusFilter === "LOW_STOCK" ? "bg-bolt-warning-bg" : ""
                  }`}
              >
                <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Low Stock</Text>
                <Text
                  className={`font-poppins-bold text-base ${lowStockCount > 0 ? "text-bolt-warning-text" : "text-bolt-slate"
                    }`}
                >
                  {lowStockCount}
                </Text>
              </TouchableOpacity>

              <View className="w-[1px] h-7 bg-bolt-divider" />

              {/* Out of Stock */}
              <TouchableOpacity
                onPress={() => handleStatusFilterChange("OUT_OF_STOCK")}
                accessibilityRole="button"
                accessibilityLabel="Filter out of stock products"
                activeOpacity={0.7}
                className={`flex-1 items-center py-1.5 rounded-xl ${statusFilter === "OUT_OF_STOCK" ? "bg-bolt-danger-bg" : ""
                  }`}
              >
                <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Out of Stock</Text>
                <Text
                  className={`font-poppins-bold text-base ${outOfStockCount > 0 ? "text-bolt-danger-text" : "text-bolt-slate"
                    }`}
                >
                  {outOfStockCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── 2. Action Second: Primary Operations ─────────────────────── */}
        <View className="flex-row gap-2.5 mb-3.5">
          <TouchableOpacity
            onPress={openAddModal}
            accessibilityRole="button"
            accessibilityLabel="Add New Product"
            className="flex-1 bg-bolt-blue rounded-2xl h-14 flex-row items-center justify-center px-3 gap-1.5"
            activeOpacity={0.85}
            style={Shadows.primaryButton}
          >
            <HugeiconsIcon icon={Add01Icon} size={18} color={Colors.card} />
            <Text
              className="font-inter-semibold text-white text-xs text-center"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Add New Product
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openRestockModal}
            accessibilityRole="button"
            accessibilityLabel="Log Restock"
            className="flex-1 bg-bolt-card border border-bolt-border rounded-2xl h-14 flex-row items-center justify-center px-3 gap-1.5 active:bg-bolt-divider"
            activeOpacity={0.85}
            style={Shadows.card}
          >
            <HugeiconsIcon icon={PackageReceiveIcon} size={18} color={Colors.primary} />
            <Text
              className="font-inter-semibold text-bolt-graphite text-xs text-center"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Log Restock
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 3. Ledger Third: Search Bar & Filters ───────────────────── */}
        <View
          className="flex-row items-center bg-bolt-card border border-bolt-border rounded-2xl px-3.5 h-12 mb-2.5"
          style={Shadows.card}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} color={Colors.slate} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products or category..."
            placeholderTextColor={Colors.slate}
            className="flex-1 ml-2.5 font-inter-medium text-bolt-graphite text-sm py-0 h-full"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              className="w-8 h-8 items-center justify-center -mr-1"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => handleSelectCategory(cat)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${cat} category`}
                className={`px-3.5 py-1.5 rounded-full border mr-2 ${isSelected ? "bg-bolt-blue border-bolt-blue" : "bg-bolt-card border-bolt-border"
                  }`}
              >
                <Text
                  className={`font-inter-medium text-xs ${isSelected ? "text-white" : "text-bolt-slate"
                    }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Filter Indicator */}
        {statusFilter !== "ALL" && (
          <View className="flex-row justify-between items-center px-1 mb-2.5">
            <Text className="font-inter-medium text-xs text-bolt-slate">
              Filtered by:{" "}
              <Text className="font-inter-bold text-bolt-blue">
                {statusFilter === "LOW_STOCK" ? "Low Stock" : "Out of Stock"}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => setStatusFilter("ALL")}
              accessibilityRole="button"
              accessibilityLabel="Clear stock filter"
            >
              <Text className="font-inter-semibold text-xs text-bolt-blue">Clear filter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 4. Unified Grouped Product Catalog List ─────────────────── */}
        <View className="pb-8">
          {filteredProducts.length === 0 ? (
            <View
              className="bg-bolt-card rounded-2xl p-8 items-center justify-center border border-bolt-border mt-1"
              style={Shadows.card}
            >
              <View className="w-14 h-14 rounded-2xl bg-bolt-light items-center justify-center mb-2">
                <HugeiconsIcon icon={Package01Icon} size={26} color={Colors.primary} />
              </View>
              <Text className="font-poppins-semibold text-bolt-graphite text-base mt-1">
                No products found
              </Text>
              <Text className="font-inter text-xs text-bolt-slate text-center mt-1">
                {searchQuery || statusFilter !== "ALL" || selectedCategory !== "All"
                  ? "Try clearing your search or filters."
                  : 'Tap "Add New Product" above to add your first product.'}
              </Text>
            </View>
          ) : (
            <View
              className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden"
              style={Shadows.card}
            >
              {displayedProducts.map((product, index) => {
                const isLow = product.status === "Low Stock";
                const isOut = product.status === "Out of Stock";

                return (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => handleRestockProduct(product.id)}
                    activeOpacity={0.65}
                    accessibilityRole="button"
                    accessibilityLabel={`${product.name}, ${fmt(product.sellingPrice)}, ${product.currentStock} in stock`}
                    className={`flex-row items-center px-4 py-3.5 gap-3 ${index < displayedProducts.length - 1 ? "border-b border-bolt-divider" : ""
                      }`}
                  >
                    {/* Left: Category / Status Avatar */}
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center shrink-0 ${isOut
                          ? "bg-bolt-danger-bg"
                          : isLow
                            ? "bg-bolt-warning-bg"
                            : "bg-bolt-light"
                        }`}
                    >
                      <HugeiconsIcon
                        icon={
                          isOut
                            ? CancelCircleIcon
                            : isLow
                              ? Alert02Icon
                              : Package01Icon
                        }
                        size={18}
                        color={
                          isOut
                            ? Colors.danger.text
                            : isLow
                              ? Colors.warning.text
                              : Colors.primary
                        }
                      />
                    </View>

                    {/* Middle: Product Name & Category + Stock Level */}
                    <View className="flex-1 justify-center pr-1">
                      <Text
                        className="font-poppins-semibold text-sm text-bolt-graphite"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>

                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="font-inter text-xs text-bolt-slate" numberOfLines={1}>
                          {product.category || "General"}
                        </Text>
                        <Text className="text-bolt-disabled text-xs">•</Text>
                        <Text
                          className={`font-inter-medium text-xs ${isOut
                              ? "text-bolt-danger-text font-inter-semibold"
                              : isLow
                                ? "text-bolt-warning-text font-inter-semibold"
                                : "text-bolt-slate"
                            }`}
                        >
                          {isOut
                            ? "Out of stock"
                            : isLow
                              ? `${product.currentStock} left (Low)`
                              : `${product.currentStock} in stock`}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Price & QR Button */}
                    <View className="items-end justify-center shrink-0 pl-2">
                      <Text className="font-poppins-bold text-sm text-bolt-graphite mb-1.5">
                        {fmt(product.sellingPrice)}
                      </Text>

                      <View className="flex-row items-center gap-1.5">
                        {/* 1. View / Print QR Code Button */}
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedQrProduct(product);
                            setIsQrModalVisible(true);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`View QR sticker for ${product.name}`}
                          className="h-7 px-3 rounded-lg bg-bolt-light border border-bolt-light flex-row items-center justify-center gap-1.5 active:opacity-75"
                        >
                          <HugeiconsIcon icon={QrCode01Icon} size={14} color={Colors.primary} />
                          <Text className="font-inter-semibold text-xs text-bolt-blue">View QR</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Progressive Load More */}
          {hasMore && (
            <TouchableOpacity
              onPress={loadMore}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Show more items"
              className="mt-3 bg-bolt-card border border-bolt-border rounded-2xl py-3.5 flex-row items-center justify-center gap-1.5 shadow-sm"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} color={Colors.primary} />
              <Text className="font-inter-semibold text-xs text-bolt-blue">
                Show more items
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <ProductQrLabelModal
        visible={isQrModalVisible}
        product={selectedQrProduct}
        onClose={() => {
          setIsQrModalVisible(false);
          setSelectedQrProduct(null);
        }}
      />
    </SafeAreaView>
  );
}