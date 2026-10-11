import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Coins01Icon from "@hugeicons/core-free-icons/Coins01Icon";
import AlertCircleIcon from "@hugeicons/core-free-icons/AlertCircleIcon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import MetricCardShell from "@/components/MetricCardShell";

export type DebtorTabKey = "all" | "overdue" | "cleared";

export interface DebtSummaryCardProps {
  totalOutstanding: number;
  totalDebtors: number;
  overdueCount: number;
  clearedCount?: number;
  activeTab?: DebtorTabKey;
  onTabChange?: (tab: DebtorTabKey) => void;
}

/**
 * DebtSummaryCard — Interactive customer debt summary card.
 * Follows the exact unified architectural blueprint as Inventory's StockOverviewCard:
 * - Header row: "Total Money Owed" + live health badge
 * - Core metric: High-contrast outstanding debt total
 * - Integrated 3 interactive filter segments: [Owing | Overdue | Settled]
 * Eliminates redundant filter pill rows and saves ~45pt of vertical viewport space.
 */
export default function DebtSummaryCard({
  totalOutstanding,
  totalDebtors,
  overdueCount,
  clearedCount = 0,
  activeTab = "all",
  onTabChange,
}: DebtSummaryCardProps) {
  const handleTabPress = (tab: DebtorTabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange?.(tab);
  };

  return (
    <MetricCardShell contentClassName="p-3.5">
      {/* ── 1. Header Row: Title & Overall Status Badge ── */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-1.5">
          <HugeiconsIcon icon={Coins01Icon} size={14} color={Colors.primary} />
          <Text className="font-inter-semibold text-xs text-bolt-slate uppercase tracking-wider">
            Total Money Owed
          </Text>
        </View>

        {overdueCount > 0 ? (
          <View className="bg-bolt-danger-bg border border-bolt-danger-border px-2 py-0.5 rounded-full flex-row items-center gap-1">
            <HugeiconsIcon icon={AlertCircleIcon} size={10} color={Colors.danger.text} />
            <Text className="font-inter-semibold text-2xs text-bolt-danger-text">
              {overdueCount} Overdue
            </Text>
          </View>
        ) : (
          <View className="bg-bolt-success-bg border border-bolt-success-border px-2 py-0.5 rounded-full flex-row items-center gap-1">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={10} color={Colors.success.text} />
            <Text className="font-inter-semibold text-2xs text-bolt-success-text">
              All Current
            </Text>
          </View>
        )}
      </View>

      {/* ── 2. Big Outstanding Debt Amount ── */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        className="font-poppins-bold text-3xl text-bolt-graphite mb-2.5"
      >
        {formatCurrency(totalOutstanding)}
      </Text>

      {/* ── 3. Integrated 3 Quick-Filter Segments (Uniform with Inventory) ── */}
      <View className="flex-row items-center pt-2 border-t border-bolt-divider">
        {/* Active Debtors (Owing) */}
        <TouchableOpacity
          onPress={() => handleTabPress("all")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "all" }}
          accessibilityLabel={`Filter active debtors, ${totalDebtors} customers owing`}
          activeOpacity={0.7}
          className={`flex-1 items-center py-1.5 rounded-xl ${
            activeTab === "all" ? "bg-bolt-light" : ""
          }`}
        >
          <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Owing</Text>
          <Text
            className={`font-poppins-bold text-base ${
              activeTab === "all" ? "text-bolt-blue" : "text-bolt-graphite"
            }`}
          >
            {totalDebtors}
          </Text>
        </TouchableOpacity>

        <View className="w-[1px] h-7 bg-bolt-divider" />

        {/* Overdue Debtors */}
        <TouchableOpacity
          onPress={() => handleTabPress("overdue")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "overdue" }}
          accessibilityLabel={`Filter overdue debtors, ${overdueCount} accounts past due`}
          activeOpacity={0.7}
          className={`flex-1 items-center py-1.5 rounded-xl ${
            activeTab === "overdue" ? "bg-bolt-danger-bg" : ""
          }`}
        >
          <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Overdue</Text>
          <Text
            className={`font-poppins-bold text-base ${
              overdueCount > 0 ? "text-bolt-danger-text" : "text-bolt-slate"
            }`}
          >
            {overdueCount}
          </Text>
        </TouchableOpacity>

        <View className="w-[1px] h-7 bg-bolt-divider" />

        {/* Settled Debtors */}
        <TouchableOpacity
          onPress={() => handleTabPress("cleared")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "cleared" }}
          accessibilityLabel={`Filter settled accounts, ${clearedCount} accounts cleared`}
          activeOpacity={0.7}
          className={`flex-1 items-center py-1.5 rounded-xl ${
            activeTab === "cleared" ? "bg-bolt-success-bg" : ""
          }`}
        >
          <Text className="font-inter text-2xs text-bolt-slate mb-0.5">Settled</Text>
          <Text
            className={`font-poppins-bold text-base ${
              activeTab === "cleared" ? "text-bolt-success-text" : "text-bolt-slate"
            }`}
          >
            {clearedCount}
          </Text>
        </TouchableOpacity>
      </View>
    </MetricCardShell>
  );
}
