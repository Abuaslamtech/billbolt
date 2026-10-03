import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Message01Icon from "@hugeicons/core-free-icons/Message01Icon";
import AlertCircleIcon from "@hugeicons/core-free-icons/AlertCircleIcon";
import Clock01Icon from "@hugeicons/core-free-icons/Clock01Icon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";
import { formatCurrency } from "@/store/saleStore";
import { DebtorCustomerSummary } from "@/types/models";

interface DebtorCardProps {
  debtor: DebtorCustomerSummary;
  onRecordPayment: (debtor: DebtorCustomerSummary) => void;
  onSendReminder: (debtor: DebtorCustomerSummary) => void;
}

export default function DebtorCard({
  debtor,
  onRecordPayment,
  onSendReminder,
}: DebtorCardProps) {
  const isSettled = debtor.remainingBalance <= 0;
  const isOverdue = debtor.isOverdue && !isSettled;

  // Generate 2 initials from customer name
  const initials = debtor.customerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "C";

  // Item summary from latest receipts
  const itemsSummary = debtor.receipts
    .flatMap((r) => r.items || [])
    .slice(0, 3)
    .map((item) => `${item.quantity || 1}x ${item.productName}`)
    .join(", ");

  const remainingItemCount = debtor.receipts
    .flatMap((r) => r.items || []).length - 3;

  return (
    <View
      style={Shadows.card}
      className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5"
    >
      {/* Top Header: Customer Info & Status Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
          {/* Avatar Initials */}
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isSettled ? "bg-bolt-success-bg" : isOverdue ? "bg-bolt-danger-bg" : "bg-bolt-light"
            }`}
          >
            <Text
              className={`font-poppins-bold text-sm ${
                isSettled ? "text-bolt-success-text" : isOverdue ? "text-bolt-danger-text" : "text-bolt-blue"
              }`}
            >
              {initials}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-poppins-bold text-base text-bolt-graphite leading-tight"
            >
              {debtor.customerName}
            </Text>
            <Text numberOfLines={1} className="font-inter text-xs text-bolt-slate mt-0.5">
              {debtor.customerPhone || "No phone number saved"}
            </Text>
          </View>
        </View>

        {/* Status Pill */}
        {isSettled ? (
          <View className="bg-bolt-success-bg border border-bolt-success-border px-2.5 py-1 rounded-full flex-row items-center gap-1">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color={Colors.success.text} />
            <Text className="font-inter-semibold text-2xs text-bolt-success-text">Settled</Text>
          </View>
        ) : isOverdue ? (
          <View className="bg-bolt-danger-bg border border-bolt-danger-border px-2.5 py-1 rounded-full flex-row items-center gap-1">
            <HugeiconsIcon icon={AlertCircleIcon} size={12} color={Colors.danger.text} />
            <Text className="font-inter-semibold text-2xs text-bolt-danger-text">Overdue</Text>
          </View>
        ) : debtor.earliestDueDate ? (
          <View className="bg-bolt-warning-bg border border-bolt-warning-border px-2.5 py-1 rounded-full flex-row items-center gap-1">
            <HugeiconsIcon icon={Clock01Icon} size={12} color={Colors.warning.text} />
            <Text className="font-inter-semibold text-2xs text-bolt-warning-text">Due Soon</Text>
          </View>
        ) : (
          <View className="bg-bolt-surface border border-bolt-border px-2.5 py-1 rounded-full">
            <Text className="font-inter-medium text-2xs text-bolt-slate">Owing</Text>
          </View>
        )}
      </View>

      {/* Financial Details Box */}
      <View className="bg-bolt-surface rounded-xl p-3 border border-bolt-divider mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter text-xs text-bolt-slate">Remaining Balance</Text>
          <Text
            className={`font-poppins-bold text-lg ${
              isSettled ? "text-bolt-success-text" : "text-bolt-danger-text"
            }`}
          >
            {formatCurrency(debtor.remainingBalance)}
          </Text>
        </View>

        {/* Due date notice if present */}
        {debtor.earliestDueDate && !isSettled && (
          <View className="flex-row items-center justify-between pt-2 mt-2 border-t border-bolt-divider">
            <Text className="font-inter text-2xs text-bolt-slate">Promised Payment Date</Text>
            <Text
              className={`font-inter-semibold text-2xs ${
                isOverdue ? "text-bolt-danger-text font-inter-bold" : "text-bolt-graphite"
              }`}
            >
              {debtor.earliestDueDate}
            </Text>
          </View>
        )}

        {/* Items description snippet */}
        {itemsSummary ? (
          <View className="pt-2 mt-2 border-t border-bolt-divider">
            <Text numberOfLines={1} className="font-inter text-2xs text-bolt-slate">
              Items: {itemsSummary}
              {remainingItemCount > 0 ? ` +${remainingItemCount} more` : ""}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action Row */}
      <View className="flex-row items-center gap-2">
        {/* Remind Button (Secondary, neutral surface with border) */}
        {!isSettled && debtor.customerPhone ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSendReminder(debtor);
            }}
            activeOpacity={0.75}
            className="flex-1 py-3 px-3 rounded-xl bg-bolt-card border border-bolt-border flex-row items-center justify-center gap-1.5 active:bg-bolt-divider"
            accessibilityRole="button"
            accessibilityLabel={`Send payment reminder to ${debtor.customerName}`}
          >
            <HugeiconsIcon icon={Message01Icon} size={16} color={Colors.primary} />
            <Text className="font-inter-semibold text-xs text-bolt-blue">Remind</Text>
          </TouchableOpacity>
        ) : null}

        {/* Record Payment Button (Primary solid CTA, or single button if no phone) */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRecordPayment(debtor);
          }}
          activeOpacity={0.75}
          className={`flex-1 py-3 px-3 rounded-xl flex-row items-center justify-center gap-1.5 ${
            isSettled
              ? "bg-bolt-surface border border-bolt-border"
              : "bg-bolt-blue active:bg-bolt-primary-dark"
          }`}
          accessibilityRole="button"
          accessibilityLabel={`Record payment for ${debtor.customerName}`}
        >
          <Text
            className={`text-xs ${
              isSettled
                ? "font-inter-semibold text-bolt-slate"
                : "font-poppins-semibold text-bolt-card"
            }`}
          >
            {isSettled ? "View History" : "Record Payment"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
