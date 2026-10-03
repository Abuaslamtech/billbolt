import React from "react";
import { View, Text } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Coins01Icon from "@hugeicons/core-free-icons/Coins01Icon";
import AlertCircleIcon from "@hugeicons/core-free-icons/AlertCircleIcon";
import User02Icon from "@hugeicons/core-free-icons/User02Icon";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";
import { formatCurrency } from "@/store/saleStore";

interface DebtSummaryCardProps {
  totalOutstanding: number;
  totalDebtors: number;
  overdueCount: number;
}

export default function DebtSummaryCard({
  totalOutstanding,
  totalDebtors,
  overdueCount,
}: DebtSummaryCardProps) {
  return (
    <View
      style={Shadows.card}
      className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden mb-4"
    >
      {/* Signature 4px Brand Accent Band */}
      <View className="h-1 bg-bolt-blue w-full" />

      <View className="p-4">
        {/* Header row */}
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center gap-1.5">
            <HugeiconsIcon icon={Coins01Icon} size={15} color={Colors.primary} />
            <Text className="font-poppins-semibold text-xs text-bolt-slate uppercase tracking-wider">
              Total Money Owed
            </Text>
          </View>
          {overdueCount > 0 && (
            <View className="bg-bolt-danger-bg border border-bolt-danger-border px-2 py-0.5 rounded-full flex-row items-center gap-1">
              <HugeiconsIcon icon={AlertCircleIcon} size={11} color={Colors.danger.text} />
              <Text className="font-inter-semibold text-2xs text-bolt-danger-text">
                {overdueCount} {overdueCount === 1 ? "Overdue" : "Overdue"}
              </Text>
            </View>
          )}
        </View>

        {/* Big Owed Amount */}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          className="font-poppins-bold text-3xl text-bolt-graphite mb-3"
        >
          {formatCurrency(totalOutstanding)}
        </Text>

        {/* 2-Metric Sub Strip (Never more than 3-4 metrics per North Star) */}
        <View className="flex-row items-center pt-3 border-t border-bolt-divider gap-4">
          <View className="flex-1 flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-bolt-light items-center justify-center">
              <HugeiconsIcon icon={User02Icon} size={15} color={Colors.primary} />
            </View>
            <View>
              <Text className="font-poppins-bold text-sm text-bolt-graphite">
                {totalDebtors}
              </Text>
              <Text className="font-inter text-2xs text-bolt-slate">
                {totalDebtors === 1 ? "Customer owing" : "Customers owing"}
              </Text>
            </View>
          </View>

          <View className="h-6 w-px bg-bolt-border" />

          <View className="flex-1 flex-row items-center gap-2">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                overdueCount > 0 ? "bg-bolt-danger-bg" : "bg-bolt-surface"
              }`}
            >
              <HugeiconsIcon
                icon={AlertCircleIcon}
                size={15}
                color={overdueCount > 0 ? Colors.danger.text : Colors.slate}
              />
            </View>
            <View>
              <Text
                className={`font-poppins-bold text-sm ${
                  overdueCount > 0 ? "text-bolt-danger-text" : "text-bolt-graphite"
                }`}
              >
                {overdueCount}
              </Text>
              <Text className="font-inter text-2xs text-bolt-slate">
                {overdueCount === 1 ? "Past due date" : "Past due dates"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
