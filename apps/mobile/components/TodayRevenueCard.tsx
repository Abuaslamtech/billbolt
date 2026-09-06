import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HugeiconsIcon } from "@hugeicons/react-native";
import TradeUpIcon from '@hugeicons/core-free-icons/TradeUpIcon';
import TradeDownIcon from '@hugeicons/core-free-icons/TradeDownIcon';
import { Colors } from "@/lib/colors";
import { formatCurrency as fmt } from "@/lib/formatters";
import { Shadows } from "@/lib/styles";

export interface TodayRevenueCardProps {
  todaySales: number;
  receiptsToday: number;
  yesterdaySales?: number;
  monthRevenue?: number;
  growth?: number;
}

/**
 * Shared signature revenue card for Dashboard and Sales tab.
 * Enforces unified visual DNA (brand gradient band, typography tokens, growth badge, and sub-stats).
 */
export default function TodayRevenueCard({
  todaySales,
  receiptsToday,
  yesterdaySales,
  monthRevenue,
  growth = 0,
}: TodayRevenueCardProps) {
  const growthUp = growth >= 0;
  const yesterdayAmount = yesterdaySales ?? monthRevenue ?? 0;

  return (
    <View
      className="bg-bolt-card rounded-2xl mb-3 border border-bolt-border overflow-hidden"
      style={Shadows.cardElevated}
    >
      {/* Top brand accent band */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4, width: "100%" }}
      />

      <View className="p-4">
        {/* Label row + growth badge */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-bolt-slate text-xs font-inter-semibold">
            Today's Revenue
          </Text>

          <View
            className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full ${growthUp ? "bg-bolt-success-bg" : "bg-bolt-danger-bg"
              }`}
          >
            {growthUp ? (
              <HugeiconsIcon icon={TradeUpIcon} size={11} color={Colors.success.text} />
            ) : (
              <HugeiconsIcon icon={TradeDownIcon} size={11} color={Colors.danger.text} />
            )}
            <Text
              className={`text-2xs font-inter-semibold ${growthUp ? "text-bolt-success-text" : "text-bolt-danger-text"
                }`}
            >
              {growthUp ? "+" : ""}
              {growth}% vs yesterday
            </Text>
          </View>
        </View>

        {/* Hero amount */}
        <Text className="text-bolt-graphite font-poppins-bold text-hero mb-3">
          {fmt(todaySales)}
        </Text>

        {/* Sub-stats row — clean 2-metric layout */}
        <View className="border-t border-bolt-divider pt-3 flex-row items-center gap-4">
          <View className="flex-1">
            <Text className="text-bolt-slate text-xs font-inter mb-0.5">
              Receipts Today
            </Text>
            <Text className="text-bolt-graphite text-base font-poppins-semibold">
              {receiptsToday}
            </Text>
          </View>

          <View className="w-px h-8 bg-bolt-divider" />

          <View className="flex-1">
            <Text className="text-bolt-slate text-xs font-inter mb-0.5">
              Yesterday's Revenue
            </Text>
            <Text className="text-bolt-graphite text-base font-poppins-semibold">
              {fmt(yesterdayAmount)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
