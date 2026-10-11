import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import PackageReceiveIcon from '@hugeicons/core-free-icons/PackageReceiveIcon';
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import CancelCircleIcon from '@hugeicons/core-free-icons/CancelCircleIcon';
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import QrCode01Icon from '@hugeicons/core-free-icons/QrCode01Icon';

import Header from "@/components/Header";
import StockOverviewCard from "@/components/Inventory/StockOverviewCard";
import ProductQrLabelModal from "@/components/QR/ProductQrLabelModal";
import { ProductRowSkeleton } from "@/components/Elements/Skeleton";
import { Button } from "@/components/Elements/Button";
import SearchBar from "@/components/Elements/SearchBar";
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
    isInitialLoading,
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
        contentContainerStyle={{ paddingBottom: 96, paddingTop: 16 }}
      >
        {/* ── 1. Context First: Signature Stock Overview Card ─────────── */}
        <StockOverviewCard
          totalProductsCount={totalProductsCount}
          outOfStockCount={outOfStockCount}
          lowStockCount={lowStockCount}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {/* ── 2. Action Second: Primary Operations ─────────────────────── */}
        <View className="flex-row gap-2.5 mb-3.5">
          <View className="flex-1">
            <Button
              label="Add New Product"
              icon={Add01Icon}
              variant="primary"
              size="lg"
              fullWidth
              onPress={openAddModal}
              accessibilityLabel="Add New Product"
            />
          </View>

          <View className="flex-1">
            <Button
              label="Log Restock"
              icon={PackageReceiveIcon}
              variant="secondary"
              size="lg"
              fullWidth
              onPress={openRestockModal}
              accessibilityLabel="Log Restock"
            />
          </View>
        </View>

        {/* ── 3. Ledger Third: Search Bar & Filters ───────────────────── */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products or category..."
          containerClassName="mb-2.5"
        />

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
          {isInitialLoading ? (
            <View
              className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden"
              style={Shadows.card}
            >
              <ProductRowSkeleton />
              <ProductRowSkeleton />
              <ProductRowSkeleton />
              <ProductRowSkeleton isLast />
            </View>
          ) : filteredProducts.length === 0 ? (
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
                              ? `${product.currentStock} left (Reorder at ${product.reorderLevel || 5})`
                              : `${product.currentStock} in stock`}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Price & Actions */}
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
                          className="h-9 px-2.5 rounded-xl bg-bolt-light border border-bolt-light flex-row items-center justify-center gap-1 active:opacity-75"
                        >
                          <HugeiconsIcon icon={QrCode01Icon} size={13} color={Colors.primary} />
                          <Text className="font-inter-semibold text-2xs text-bolt-blue">QR</Text>
                        </TouchableOpacity>

                        {/* 2. Explicit Restock Button */}
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            handleRestockProduct(product.id);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Restock ${product.name}`}
                          className="h-9 px-2.5 rounded-xl bg-bolt-blue flex-row items-center justify-center gap-1 active:opacity-85"
                        >
                          <HugeiconsIcon icon={PackageReceiveIcon} size={13} color="#FFFFFF" />
                          <Text className="font-inter-semibold text-2xs text-white">Restock</Text>
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