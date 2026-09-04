import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  TradeUpIcon,
  Package01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useAppDataStore } from "@/store/AppDataStore";
import { router } from "expo-router";
import { Colors } from "@/lib/colors";
import { formatCurrency as fmt } from "@/lib/formatters";
import { Shadows } from "@/lib/styles";

export default function TopSellingProducts() {
  const { topProducts } = useAppDataStore();

  const handleViewAll = () => {
    router.push("/(main)/InventoryScreen");
  };

  const displayList = topProducts.slice(0, 3);

  if (displayList.length === 0) {
    return null;
  }

  return (
    <View className="mt-4 mb-2">
      {/* Header with action */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <HugeiconsIcon icon={TradeUpIcon} color={Colors.success.text} size={16} />
            <Text className="font-poppins-bold text-bolt-graphite text-base">
              Top Performers
            </Text>
          </View>
          <Text className="font-inter text-bolt-slate text-xs">
            Your best sellers by sales and units
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleViewAll}
          className="flex-row items-center gap-0.5 bg-bolt-light px-2.5 py-1 rounded-full"
          accessibilityRole="button"
          accessibilityLabel="View all products in inventory"
        >
          <Text className="text-bolt-blue font-inter-semibold text-xs">View All</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} color={Colors.primary} size={12} />
        </TouchableOpacity>
      </View>

      {/* Products horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-3"
      >
        {displayList.map((product, index) => {
          const isLow = product.status === "Low Stock";
          const isOut = product.status === "Out of Stock";

          return (
            <TouchableOpacity
              key={product.productId}
              onPress={handleViewAll}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${product.productName}`}
              className="w-40 rounded-2xl p-3.5 bg-bolt-card border border-bolt-border mr-3 justify-between"
              style={Shadows.card}
            >
              {/* Top Row: Rank & Status */}
              <View className="flex-row justify-between items-center mb-2.5">
                <View className="bg-bolt-light border border-bolt-blue/20 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-bolt-blue font-inter-bold text-2xs">{index + 1}</Text>
                </View>

                <View
                  className={`px-2 py-0.5 rounded-full ${
                    isOut
                      ? "bg-bolt-danger-bg border border-bolt-danger-border"
                      : isLow
                      ? "bg-bolt-warning-bg border border-bolt-warning-border"
                      : "bg-bolt-success-bg border border-bolt-success-border"
                  }`}
                >
                  <Text
                    className={`text-2xs font-inter-semibold ${
                      isOut
                        ? "text-bolt-danger-text"
                        : isLow
                        ? "text-bolt-warning-text"
                        : "text-bolt-success-text"
                    }`}
                  >
                    {product.status}
                  </Text>
                </View>
              </View>

              {/* Product Info */}
              <Text
                className="font-poppins-semibold text-xs text-bolt-graphite mb-2.5"
                numberOfLines={2}
              >
                {product.productName}
              </Text>

              {/* Sales metrics — clean single row */}
              <View className="pt-2 border-t border-bolt-divider flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <HugeiconsIcon icon={Package01Icon} size={12} color={Colors.slate} />
                  <Text className="font-inter text-2xs text-bolt-slate">
                    {product.totalUnitsSold} sold
                  </Text>
                </View>
                <Text className="font-poppins-bold text-bolt-blue text-xs">
                  {fmt(product.totalRevenue)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}