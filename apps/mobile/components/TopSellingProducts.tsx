import React, { useCallback, useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import TradeUpIcon from '@hugeicons/core-free-icons/TradeUpIcon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { useAppDataStore } from "@/store/AppDataStore";
import { Colors } from "@/lib/colors";
import { formatCurrency as fmt } from "@/lib/formatters";
import { Shadows } from "@/lib/styles";
import { StockStatus } from "@/types/models";

const getOrdinalRank = (index: number) => {
  const ordinals = ["1st", "2nd", "3rd", "4th", "5th"];
  return ordinals[index] || `${index + 1}th`;
};

const getStatusBadge = (status: StockStatus, currentStock: number) => {
  if (status === "Out of Stock" || currentStock === 0) {
    return {
      badgeBg: "bg-bolt-danger-bg border border-bolt-danger-border",
      badgeText: "text-bolt-danger-text",
      label: "Out of stock",
    };
  }
  if (status === "Low Stock") {
    return {
      badgeBg: "bg-bolt-warning-bg border border-bolt-warning-border",
      badgeText: "text-bolt-warning-text",
      label: `${currentStock} left`,
    };
  }
  return {
    badgeBg: "bg-bolt-success-bg border border-bolt-success-border",
    badgeText: "text-bolt-success-text",
    label: `${currentStock} in stock`,
  };
};

const TopSellingProducts = () => {
  // Atomic selector prevents re-rendering on unrelated AppDataStore updates
  const topProducts = useAppDataStore((state) => state.topProducts);

  const displayList = useMemo(() => {
    return (topProducts || []).slice(0, 5);
  }, [topProducts]);

  const handleViewReport = useCallback(() => {
    Haptics.selectionAsync();
    router.push("/ReportScreen");
  }, []);

  const handleProductPress = useCallback((_productId: string) => {
    Haptics.selectionAsync();
    router.navigate("/(main)/InventoryScreen");
  }, []);

  if (!displayList || displayList.length === 0) {
    return null;
  }

  const count = displayList.length;

  return (
    <View className="mt-6 mb-2">
      {/* ── Section Header ── */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <HugeiconsIcon icon={TradeUpIcon} color={Colors.success.text} size={16} />
            <Text className="font-poppins-bold text-bolt-graphite text-base">
              Top Performers
            </Text>
          </View>
          <Text className="font-inter text-bolt-slate text-xs" numberOfLines={1}>
            Your best sellers by sales and units
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleViewReport}
          activeOpacity={0.7}
          className="flex-row items-center gap-1 bg-bolt-light px-3 py-1.5 rounded-full active:bg-bolt-divider"
          accessibilityRole="button"
          accessibilityLabel="View full product performance report"
        >
          <Text className="text-bolt-blue font-inter-semibold text-xs">View Report</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} color={Colors.primary} size={12} />
        </TouchableOpacity>
      </View>

      {/* ── Adaptive Content Rendering ── */}

      {/* Case 1: Exactly 1 Product — Compact Executive Banner Tile */}
      {count === 1 && (() => {
        const product = displayList[0];
        const { badgeBg, badgeText, label } = getStatusBadge(product.status, product.currentStock);

        return (
          <TouchableOpacity
            key={product.productId}
            onPress={() => handleProductPress(product.productId)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Top Seller: ${product.productName}, ${product.totalUnitsSold} sold, total revenue ${fmt(product.totalRevenue)}, ${label}`}
            className="w-full rounded-2xl p-3.5 bg-bolt-card border border-bolt-border"
            style={Shadows.card}
          >
            <View className="flex-row items-center justify-between">
              {/* Left: Growth Icon + Product Info */}
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/90 items-center justify-center mr-3 shrink-0">
                  <HugeiconsIcon icon={TradeUpIcon} size={20} color={Colors.warning.text} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5 mb-0.5">
                    <View className="bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                      <Text className="text-amber-800 font-inter-bold text-2xs uppercase tracking-wider">
                        Top Seller
                      </Text>
                    </View>
                    {product.category && (
                      <Text className="text-bolt-slate text-2xs font-inter" numberOfLines={1}>
                        • {product.category}
                      </Text>
                    )}
                  </View>
                  <Text
                    className="font-poppins-semibold text-sm text-bolt-graphite leading-snug"
                    numberOfLines={1}
                  >
                    {product.productName}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="font-inter-medium text-2xs text-bolt-slate">
                      {product.totalUnitsSold} sold
                    </Text>
                    <View className={`px-1.5 py-0.2 rounded-md ${badgeBg}`}>
                      <Text className={`text-2xs font-inter-semibold ${badgeText}`}>
                        {label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Right: Revenue & Profit Tag */}
              <View className="items-end shrink-0 pl-2.5 border-l border-bolt-divider">
                <Text className="font-poppins-bold text-bolt-blue text-sm">
                  {fmt(product.totalRevenue)}
                </Text>
                {product.totalProfit > 0 ? (
                  <View className="mt-1 bg-bolt-success-bg border border-bolt-success-border px-1.5 py-0.5 rounded">
                    <Text className="text-bolt-success-text text-2xs font-inter-bold">
                      +{fmt(product.totalProfit)} profit
                    </Text>
                  </View>
                ) : (
                  <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
                    Revenue
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })()}

      {/* Case 2: Exactly 2 Products — Balanced Dual Comparative Grid */}
      {count === 2 && (
        <View className="flex-row gap-3">
          {displayList.map((product, index) => {
            const isRankOne = index === 0;
            const isRankTwo = index === 1;
            const { badgeBg, badgeText, label } = getStatusBadge(product.status, product.currentStock);

            return (
              <TouchableOpacity
                key={product.productId}
                onPress={() => handleProductPress(product.productId)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${getOrdinalRank(index)} Best Seller: ${product.productName}, ${product.totalUnitsSold} sold, total revenue ${fmt(product.totalRevenue)}, ${label}`}
                className="flex-1 rounded-2xl p-3 bg-bolt-card border border-bolt-border justify-between"
                style={Shadows.card}
              >
                {/* Top Row: Rank & Stock Count Badge */}
                <View className="flex-row justify-between items-center mb-1.5">
                  <View
                    className={`px-2 py-0.5 rounded-full border ${
                      isRankOne
                        ? "bg-amber-100 border-amber-300"
                        : "bg-slate-100 border-slate-300"
                    }`}
                  >
                    <Text
                      className={`font-inter-bold text-2xs ${
                        isRankOne ? "text-amber-800" : "text-slate-700"
                      }`}
                    >
                      {getOrdinalRank(index)}
                    </Text>
                  </View>

                  <View className={`px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                    <Text
                      numberOfLines={1}
                      className={`text-2xs font-inter-semibold ${badgeText}`}
                    >
                      {label}
                    </Text>
                  </View>
                </View>

                {/* Product Title */}
                <Text
                  className="font-poppins-semibold text-xs text-bolt-graphite mb-2"
                  numberOfLines={2}
                >
                  {product.productName}
                </Text>

                {/* Bottom Metrics: Units, Profit & Revenue */}
                <View className="pt-2 border-t border-bolt-divider flex-row items-center justify-between gap-1">
                  <View className="flex-1 min-w-0">
                    <Text numberOfLines={1} className="font-inter-medium text-2xs text-bolt-slate">
                      {product.totalUnitsSold} sold
                    </Text>
                    {product.totalProfit > 0 && (
                      <Text numberOfLines={1} className="font-inter-bold text-2xs text-bolt-success-text">
                        +{fmt(product.totalProfit)}
                      </Text>
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    className="font-poppins-bold text-bolt-blue text-xs text-right"
                  >
                    {fmt(product.totalRevenue)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Case 3: 3+ Products — Edge-Bleeding Content-Rich Carousel */}
      {count >= 3 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {displayList.map((product, index) => {
            const isRankOne = index === 0;
            const isRankTwo = index === 1;
            const { badgeBg, badgeText, label } = getStatusBadge(product.status, product.currentStock);

            return (
              <TouchableOpacity
                key={product.productId}
                onPress={() => handleProductPress(product.productId)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${getOrdinalRank(index)} Best Seller: ${product.productName}, ${product.totalUnitsSold} sold, total revenue ${fmt(product.totalRevenue)}, ${label}`}
                className="w-44 rounded-2xl p-3 bg-bolt-card border border-bolt-border justify-between"
                style={Shadows.card}
              >
                {/* Top Row: Rank & Stock Count Badge */}
                <View className="flex-row justify-between items-center mb-1.5">
                  <View
                    className={`px-2 py-0.5 rounded-full border ${
                      isRankOne
                        ? "bg-amber-100 border-amber-300"
                        : isRankTwo
                        ? "bg-slate-100 border-slate-300"
                        : "bg-bolt-light border-bolt-blue/20"
                    }`}
                  >
                    <Text
                      className={`font-inter-bold text-2xs ${
                        isRankOne
                          ? "text-amber-800"
                          : isRankTwo
                          ? "text-slate-700"
                          : "text-bolt-blue"
                      }`}
                    >
                      {getOrdinalRank(index)}
                    </Text>
                  </View>

                  <View className={`px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                    <Text
                      numberOfLines={1}
                      className={`text-2xs font-inter-semibold ${badgeText}`}
                    >
                      {label}
                    </Text>
                  </View>
                </View>

                {/* Product Title */}
                <Text
                  className="font-poppins-semibold text-xs text-bolt-graphite mb-2"
                  numberOfLines={2}
                >
                  {product.productName}
                </Text>

                {/* Bottom Metrics: Units, Profit & Revenue */}
                <View className="pt-2 border-t border-bolt-divider flex-row items-center justify-between gap-1">
                  <View className="flex-1 min-w-0">
                    <Text numberOfLines={1} className="font-inter-medium text-2xs text-bolt-slate">
                      {product.totalUnitsSold} sold
                    </Text>
                    {product.totalProfit > 0 && (
                      <Text numberOfLines={1} className="font-inter-bold text-2xs text-bolt-success-text">
                        +{fmt(product.totalProfit)}
                      </Text>
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    className="font-poppins-bold text-bolt-blue text-xs text-right"
                  >
                    {fmt(product.totalRevenue)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default React.memo(TopSellingProducts);