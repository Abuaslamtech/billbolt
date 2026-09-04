import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  CheckmarkCircle02Icon,
  Invoice02Icon,
  Add01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import ReceiptDetailModal from "@/components/Receipts/ReceiptDetailModal";
import ScreenHeader from "@/components/Elements/ScreenHeader";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { useSaleSuccess } from "@/hooks/useSaleSuccess";
import { router } from "expo-router";
import { Shadows } from "@/lib/styles";

export default function SaleSuccessScreen() {
  const {
    completedReceipt,
    totalUnits,
    formattedDateTime,
    showReceiptDetail,
    setShowReceiptDetail,
    handleRecordAnother,
    handleDone,
  } = useSaleSuccess();

  if (!completedReceipt) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right", "bottom"]}>
      <View className="flex-1 justify-between">
        {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
        <ScreenHeader
          title="Sale Complete"
          subtitle="Transaction finalized"
          showBack={true}
          onBack={() => router.push("/(sale)")}
          showHome={true}
          onHome={handleDone}
        />

        {/* ── Center Content: Hero Celebration & Transaction Card ─────────── */}
        <View className="flex-1 px-6 justify-center items-center">
          {/* Hero Checkmark */}
          <View className="w-20 h-20 rounded-full bg-bolt-success-bg border-4 border-bolt-success-border items-center justify-center mb-3">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={44} color={Colors.mint} />
          </View>

          {/* Formatted Total */}
          <Text className="font-poppins-bold text-3xl text-bolt-graphite mb-1">
            {formatCurrency(completedReceipt.total)}
          </Text>
          <Text className="font-inter-medium text-xs text-bolt-success-text mb-6">
            Sale recorded successfully!
          </Text>

          {/* Clean Transaction Card */}
          <View
            className="w-full bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-2"
            style={Shadows.card}
          >
            {/* Payment Method */}
            <View className="flex-row justify-between py-2.5 border-b border-bolt-divider">
              <Text className="font-inter text-xs text-bolt-slate">Payment Method</Text>
              <Text className="font-inter-semibold text-xs text-bolt-graphite">
                {completedReceipt.paymentMethod || "Cash"}
              </Text>
            </View>

            {/* Items Count */}
            <View className="flex-row justify-between py-2.5 border-b border-bolt-divider">
              <Text className="font-inter text-xs text-bolt-slate">Items Sold</Text>
              <Text className="font-inter-semibold text-xs text-bolt-graphite">
                {totalUnits} {totalUnits === 1 ? "item" : "items"} ({completedReceipt.items?.length || 0} {completedReceipt.items?.length === 1 ? "product" : "products"})
              </Text>
            </View>

            {/* Customer (Only shown if recorded) */}
            {completedReceipt.customerName ? (
              <View className="flex-row justify-between py-2.5 border-b border-bolt-divider">
                <Text className="font-inter text-xs text-bolt-slate">Customer</Text>
                <Text className="font-inter-semibold text-xs text-bolt-graphite">
                  {completedReceipt.customerName}
                </Text>
              </View>
            ) : null}

            {/* Date & Time */}
            <View className="flex-row justify-between py-2.5">
              <Text className="font-inter text-xs text-bolt-slate">Date & Time</Text>
              <Text className="font-inter-semibold text-xs text-bolt-graphite">
                {formattedDateTime}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Bottom Action Row: Single Horizontal Row with 2 Buttons ──────── */}
        <View className="px-6 pb-6 pt-2">
          <View className="flex-row gap-3">
            {/* Secondary Action: Start New Sale */}
            <TouchableOpacity
              onPress={handleRecordAnother}
              className="flex-1 py-4 rounded-2xl bg-bolt-card border border-bolt-border items-center justify-center flex-row gap-2 active:bg-bolt-divider"
              accessibilityRole="button"
              accessibilityLabel="Start a new sale"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} color={Colors.graphite} />
              <Text className="font-inter-semibold text-bolt-graphite text-sm">
                New Sale
              </Text>
            </TouchableOpacity>

            {/* Primary Hero CTA: View Receipt */}
            <TouchableOpacity
              onPress={() => setShowReceiptDetail(true)}
              className="flex-1 py-4 rounded-2xl bg-bolt-blue items-center justify-center flex-row gap-2 shadow-sm active:bg-bolt-primary-dark"
              accessibilityRole="button"
              accessibilityLabel="View full receipt details"
            >
              <HugeiconsIcon icon={Invoice02Icon} size={17} color={Colors.card} />
              <Text className="font-poppins-semibold text-bolt-card text-sm">
                View Receipt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Full Receipt Ticket Modal */}
      <ReceiptDetailModal
        receipt={completedReceipt}
        visible={showReceiptDetail}
        onClose={() => setShowReceiptDetail(false)}
      />
    </SafeAreaView>
  );
}
