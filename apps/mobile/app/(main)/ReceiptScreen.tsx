import React from "react";
import {
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import ReceiptsSummaryCard from "@/components/Receipts/ReceiptsSummaryCard";
import ReceiptHistory from "@/components/ReceiptHistory";
import { Colors } from "@/lib/colors";
import { useReceiptScreen } from "@/hooks/useReceiptScreen";

export default function ReceiptScreen() {
  const {
    refreshing,
    handleRefresh,
    todaySales,
    todayReceiptsCount,
    todayCash,
    todayTransfer,
    todayCard,
    isInitialLoading,
  } = useReceiptScreen();

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 96, paddingTop: 16 }}
      >
        <View className="gap-5">
          {/* ── Signature Receipts Summary Card ── */}
          <ReceiptsSummaryCard
            todaySales={todaySales}
            receiptsCount={todayReceiptsCount}
            todayCash={todayCash}
            todayTransfer={todayTransfer}
            todayCard={todayCard}
            loading={isInitialLoading}
          />

          {/* ── Sales History (Search, Filter, Receipt Records) ────────── */}
          <ReceiptHistory />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

