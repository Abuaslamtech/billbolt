import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import Alert02Icon from "@hugeicons/core-free-icons/Alert02Icon";
import CancelCircleIcon from "@hugeicons/core-free-icons/CancelCircleIcon";
import { Colors } from "@/lib/colors";
import MetricCardShell from "@/components/MetricCardShell";

export type InventoryStatusFilter = "ALL" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockOverviewCardProps {
  totalProductsCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  statusFilter: InventoryStatusFilter;
  onStatusFilterChange: (filter: InventoryStatusFilter) => void;
}

/**
 * StockOverviewCard — Dedicated inventory health & triage header card.
 * Composes MetricCardShell for unified design system tokens.
 * Features:
 * - Product count and overall catalog health badge
 * - 3 interactive quick-filter buttons (All, Low Stock, Out of Stock)
 */
export default function StockOverviewCard({
  totalProductsCount,
  outOfStockCount,
  lowStockCount,
  statusFilter,
  onStatusFilterChange,
}: StockOverviewCardProps) {
  const isOutOfStock = outOfStockCount > 0;
  const isLowStock = lowStockCount > 0;

  return (
    <MetricCardShell contentClassName="p-4">
      {/* Header Row: Title & Overall Health Badge */}
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="font-poppins-bold text-base text-bolt-graphite">
            Stock Overview
          </Text>
          <Text className="font-inter text-xs text-bolt-slate">
            {totalProductsCount === 1
              ? "1 product tracked"
              : `${totalProductsCount} products tracked`}
          </Text>
        </View>

        <View
          className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            isOutOfStock
              ? "bg-bolt-danger-bg border-bolt-danger-border"
              : isLowStock
              ? "bg-bolt-warning-bg border-bolt-warning-border"
              : "bg-bolt-success-bg border-bolt-success-border"
          }`}
        >
          <HugeiconsIcon
            icon={
              isOutOfStock
                ? CancelCircleIcon
                : isLowStock
                ? Alert02Icon
                : CheckmarkCircle02Icon
            }
            size={12}
            color={
              isOutOfStock
                ? Colors.danger.text
                : isLowStock
                ? Colors.warning.text
                : Colors.success.text
            }
          />
          <Text
            className={`font-inter-semibold text-2xs ${
              isOutOfStock
                ? "text-bolt-danger-text"
                : isLowStock
                ? "text-bolt-warning-text"
                : "text-bolt-success-text"
            }`}
          >
            {isOutOfStock
              ? `${outOfStockCount} Out of Stock`
              : isLowStock
              ? `${lowStockCount} Low on Stock`
              : "All Stock Healthy"}
          </Text>
        </View>
      </View>

      {/* 3 Interactive Quick-Filter Segments */}
      <View className="flex-row items-center pt-2.5 border-t border-bolt-divider">
        {/* Total Products */}
        <TouchableOpacity
          onPress={() => onStatusFilterChange("ALL")}
          accessibilityRole="button"
          accessibilityLabel="Filter all products"
          activeOpacity={0.7}
          className={`flex-1 items-center py-1.5 rounded-xl ${
            statusFilter === "ALL" ? "bg-bolt-light" : ""
          }`}
        >
          <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Total</Text>
          <Text
            className={`font-poppins-bold text-base ${
              statusFilter === "ALL" ? "text-bolt-blue" : "text-bolt-graphite"
            }`}
          >
            {totalProductsCount}
          </Text>
        </TouchableOpacity>

        <View className="w-[1px] h-7 bg-bolt-divider" />

        {/* Low Stock */}
        <TouchableOpacity
          onPress={() => onStatusFilterChange("LOW_STOCK")}
          accessibilityRole="button"
          accessibilityLabel="Filter low stock products"
          activeOpacity={0.7}
          className={`flex-1 items-center py-1.5 rounded-xl ${
            statusFilter === "LOW_STOCK" ? "bg-bolt-warning-bg" : ""
          }`}
        >
          <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Low Stock</Text>
          <Text
            className={`font-poppins-bold text-base ${
              lowStockCount > 0 ? "text-bolt-warning-text" : "text-bolt-slate"
            }`}
          >
            {lowStockCount}
          </Text>
        </TouchableOpacity>

        <View className="w-[1px] h-7 bg-bolt-divider" />

        {/* Out of Stock */}
        <TouchableOpacity
          onPress={() => onStatusFilterChange("OUT_OF_STOCK")}
          accessibilityRole="button"
          accessibilityLabel="Filter out of stock products"
          activeOpacity={0.7}
          className={`flex-1 items-center py-1.5 rounded-xl ${
            statusFilter === "OUT_OF_STOCK" ? "bg-bolt-danger-bg" : ""
          }`}
        >
          <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Out of Stock</Text>
          <Text
            className={`font-poppins-bold text-base ${
              outOfStockCount > 0 ? "text-bolt-danger-text" : "text-bolt-slate"
            }`}
          >
            {outOfStockCount}
          </Text>
        </TouchableOpacity>
      </View>
    </MetricCardShell>
  );
}
