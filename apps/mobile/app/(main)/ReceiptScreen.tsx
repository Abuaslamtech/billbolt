import React from "react";
import {
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import TodayRevenueCard from "@/components/TodayRevenueCard";
import SaleActionRow from "@/components/SaleActionRow";
import ReceiptHistory from "@/components/ReceiptHistory";
import BarcodeScannerModal from "@/components/Scanner/BarcodeScannerModal";
import { Colors } from "@/lib/colors";
import { useReceiptScreen } from "@/hooks/useReceiptScreen";

export default function ReceiptScreen() {
  const {
    refreshing,
    handleRefresh,
    todaySales,
    yesterdaySales,
    todayReceiptsCount,
    monthRevenue,
    growth,
    openRecordSaleScreen,
    isScannerOpen,
    openScanner,
    closeScanner,
    handleProductScanned,
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
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }}
      >
        <View className="gap-3.5">
          {/* ── Today's Revenue Card (Context First — Identical DNA) ── */}
          <TodayRevenueCard
            todaySales={todaySales}
            receiptsToday={todayReceiptsCount}
            yesterdaySales={yesterdaySales}
            growth={growth}
          />

          {/* ── Record Sale & Scan CTA (Action Second) ────────────────── */}
          <SaleActionRow
            onRecordSale={openRecordSaleScreen}
            onScanBarcode={openScanner}
          />

          {/* ── Sales History (Search, Filter, Receipt Records) ────────── */}
          <ReceiptHistory />
        </View>
      </ScrollView>

      {/* Standalone Barcode Scanner */}
      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={closeScanner}
        onProductScanned={handleProductScanned}
      />
    </SafeAreaView>
  );
}
