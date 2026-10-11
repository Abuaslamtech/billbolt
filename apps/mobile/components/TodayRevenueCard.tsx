import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import TradeUpIcon from "@hugeicons/core-free-icons/TradeUpIcon";
import TradeDownIcon from "@hugeicons/core-free-icons/TradeDownIcon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import { Colors } from "@/lib/colors";
import { formatCurrency as fmt } from "@/lib/formatters";
import { Shadows } from "@/lib/styles";
import MetricCardShell from "@/components/MetricCardShell";
import { TodayRevenueCardSkeleton } from "@/components/Elements/Skeleton";

export interface TodayRevenueCardProps {
  todaySales: number;
  receiptsToday: number;
  yesterdaySales?: number;
  monthRevenue?: number;
  growth?: number;
  loading?: boolean;
  todayCash?: number;
  todayTransfer?: number;
  todayCard?: number;
}

/**
 * TodayRevenueCard — Compact store pulse hero card for Dashboard (Home).
 * Employs MetricCardShell for unified design system tokens.
 * Features:
 * - Top row: Title + Delta badge vs yesterday + Tactile "Report >" navigation
 * - Middle row: High-contrast 30px revenue headline (scaled safely)
 * - Bottom row: Clean single-line reconciliation (Receipt count + Cash/Transfer split)
 * Reduces vertical footprint from ~230pt to ~130pt (saves ~100pt above the fold).
 */
export default function TodayRevenueCard({
  todaySales,
  receiptsToday,
  yesterdaySales,
  monthRevenue,
  loading = false,
  todayCash = 0,
  todayTransfer = 0,
  todayCard = 0,
}: TodayRevenueCardProps) {
  if (loading) {
    return <TodayRevenueCardSkeleton />;
  }

  const yesterdayAmount = yesterdaySales ?? monthRevenue ?? 0;
  const delta = todaySales - yesterdayAmount;
  const isAhead = delta >= 0;
  const formattedDelta = delta >= 0 ? `+${fmt(delta)}` : `-${fmt(Math.abs(delta))}`;

  return (
    <MetricCardShell shadowStyle={Shadows.cardElevated} contentClassName="p-3.5">
      {/* ── 1. Header Row: Title, Delta Badge & Report Link ── */}
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-bolt-slate text-xs font-inter-semibold">
            Today&apos;s Revenue
          </Text>

          <View
            className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
              isAhead ? "bg-bolt-success-bg" : "bg-bolt-danger-bg"
            }`}
          >
            <HugeiconsIcon
              icon={isAhead ? TradeUpIcon : TradeDownIcon}
              size={10}
              color={isAhead ? Colors.success.text : Colors.danger.text}
            />
            <Text
              className={`text-2xs font-inter-semibold ${
                isAhead ? "text-bolt-success-text" : "text-bolt-danger-text"
              }`}
            >
              {formattedDelta} vs yesterday
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.navigate("/ReportScreen")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View full business reports and analytics"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center gap-0.5 px-1.5 py-0.5 rounded-md"
        >
          <Text className="text-xs font-inter-semibold text-bolt-blue">Report</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} size={11} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Hero Revenue Headline ── */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        className="text-bolt-graphite font-poppins-bold text-3xl mb-2"
      >
        {fmt(todaySales)}
      </Text>

      {/* ── 3. Single-line Reconciliation Baseline ── */}
      <View className="border-t border-bolt-divider pt-2.5 flex-row items-center justify-between">
        {/* Left: Receipts Today */}
        <View className="flex-row items-center gap-1.5">
          <Text className="text-bolt-slate font-inter text-xs">Receipts:</Text>
          <Text className="text-bolt-graphite font-inter-semibold text-xs">
            {receiptsToday}
          </Text>
        </View>

        {/* Right: Payment Method Breakdown Chips or Yesterday Baseline */}
        {todaySales > 0 ? (
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <View className="bg-bolt-surface px-2 py-0.5 rounded-md border border-bolt-border">
              <Text className="font-inter-medium text-2xs text-bolt-slate">
                Cash: <Text className="font-inter-semibold text-bolt-graphite">{fmt(todayCash)}</Text>
              </Text>
            </View>
            <View className="bg-bolt-surface px-2 py-0.5 rounded-md border border-bolt-border">
              <Text className="font-inter-medium text-2xs text-bolt-slate">
                Transfer: <Text className="font-inter-semibold text-bolt-graphite">{fmt(todayTransfer)}</Text>
              </Text>
            </View>
            {todayCard > 0 && (
              <View className="bg-bolt-surface px-2 py-0.5 rounded-md border border-bolt-border">
                <Text className="font-inter-medium text-2xs text-bolt-slate">
                  Card: <Text className="font-inter-semibold text-bolt-graphite">{fmt(todayCard)}</Text>
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-bolt-slate font-inter text-2xs">
            Yesterday: {fmt(yesterdayAmount)}
          </Text>
        )}
      </View>
    </MetricCardShell>
  );
}
