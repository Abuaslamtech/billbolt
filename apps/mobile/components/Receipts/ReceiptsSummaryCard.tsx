import React from "react";
import { View, Text } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Invoice02Icon from "@hugeicons/core-free-icons/Invoice02Icon";
import { Colors } from "@/lib/colors";
import { formatCurrency as fmt } from "@/lib/formatters";
import MetricCardShell from "@/components/MetricCardShell";
import { Skeleton } from "@/components/Elements/Skeleton";

export interface ReceiptsSummaryCardProps {
  todaySales: number;
  receiptsCount: number;
  todayCash: number;
  todayTransfer: number;
  todayCard?: number;
  loading?: boolean;
}

/**
 * ReceiptsSummaryCard — Canonical overview card for the Receipts ledger tab.
 * Composes MetricCardShell to maintain unified brand DNA (4px gradient band,
 * rounded-2xl corners, and consistent rhythm) while staying ultra-compact (~115pt).
 */
export default function ReceiptsSummaryCard({
  todaySales,
  receiptsCount,
  todayCash,
  todayTransfer,
  todayCard = 0,
  loading = false,
}: ReceiptsSummaryCardProps) {
  if (loading) {
    return (
      <MetricCardShell contentClassName="p-3.5">
        <View className="flex-row items-center justify-between mb-2">
          <Skeleton width={100} height={14} className="rounded" />
          <Skeleton width={70} height={18} className="rounded-full" />
        </View>
        <View className="my-1">
          <Skeleton width={140} height={26} className="rounded-md" />
        </View>
        <View className="pt-2.5 mt-2 border-t border-bolt-divider flex-row items-center justify-between">
          <Skeleton width={80} height={14} className="rounded" />
          <Skeleton width={120} height={14} className="rounded" />
        </View>
      </MetricCardShell>
    );
  }

  return (
    <MetricCardShell contentClassName="p-3.5">
      {/* ── 1. Header Row: Title & Today's Count Badge ── */}
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-1.5">
          <HugeiconsIcon icon={Invoice02Icon} size={14} color={Colors.primary} />
          <Text className="text-bolt-slate text-xs font-inter-semibold">
            Today&apos;s Sales
          </Text>
        </View>

        <View className="bg-bolt-light border border-bolt-blue/20 px-2 py-0.5 rounded-full">
          <Text className="text-bolt-blue text-2xs font-inter-semibold">
            {receiptsCount} {receiptsCount === 1 ? "Receipt" : "Receipts"}
          </Text>
        </View>
      </View>

      {/* ── 2. Today's Revenue Total ── */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        className="text-bolt-graphite font-poppins-bold text-2xl mb-2"
      >
        {fmt(todaySales)}
      </Text>

      {/* ── 3. Single-line Register Reconciliation Baseline ── */}
      <View className="border-t border-bolt-divider pt-2.5 flex-row items-center justify-between">
        {todaySales > 0 ? (
          <>
            <Text className="text-bolt-slate font-inter text-xs">
              Drawer Balance:
            </Text>
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
          </>
        ) : (
          <Text className="text-bolt-slate font-inter text-2xs">
            No transactions recorded yet today
          </Text>
        )}
      </View>
    </MetricCardShell>
  );
}
