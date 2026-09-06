import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import FlashIcon from '@hugeicons/core-free-icons/FlashIcon';
import Invoice02Icon from '@hugeicons/core-free-icons/Invoice02Icon';
import { router } from "expo-router";
import { Colors } from "@/lib/colors";
import { formatCurrency, formatTime, formatPaymentMethod } from "@/lib/formatters";

import Header from "@/components/Header";
import TodayRevenueCard from "@/components/TodayRevenueCard";
import ActionButtons from "@/components/ActionButtons";
import ReceiptRow from "@/components/ReceiptRow";
import TopSellingProducts from "@/components/TopSellingProducts";
import ReceiptDetailModal from "@/components/Receipts/ReceiptDetailModal";
import BarcodeScannerModal from "@/components/Scanner/BarcodeScannerModal";
import BusinessHealthCard from "@/components/Dashboard/BusinessHealthCard";
import AppLockPrimerModal from "@/components/Elements/AppLockPrimerModal";
import { useDashboardScreen } from "@/hooks/useDashboardScreen";
import { Shadows } from "@/lib/styles";

export default function DashboardScreen() {
  const {
    isOnline,
    pendingCount,
    isScannerOpen,
    setIsScannerOpen,
    selectedReceipt,
    setSelectedReceipt,
    refreshing,
    handleRefresh,
    metrics,
    todaySales,
    yesterdaySales,
    receiptsToday,
    growth,
    needReorder,
    recentReceipts,
    showPrimerModal,
    handleEnableAppLock,
    handleDismissPrimer,
  } = useDashboardScreen();

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="px-4 pt-4">

          {/* ── Today's Summary Card (Reused Component) ─────────────────── */}
          <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
            <TodayRevenueCard
              todaySales={todaySales}
              receiptsToday={receiptsToday}
              yesterdaySales={yesterdaySales}
              growth={growth}
            />
          </Animated.View>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
          <ActionButtons
            onRecordSale={() => router.push("/(sale)")}
            onScanBarcode={() => setIsScannerOpen(true)}
            onAddProduct={() => router.push("/add-product")}
            onRestock={() => router.push("/restock")}
          />
          </Animated.View>

          {/* ── Reorder Warning Banner ───────────────────────────────────── */}
          {needReorder > 0 && (
            <Animated.View entering={FadeInDown.delay(120).duration(400).springify()}>
            <TouchableOpacity
              className="mt-3.5 mb-3 bg-bolt-warning-bg border border-bolt-warning-border rounded-2xl p-4 flex-row items-center justify-between"
              onPress={() => router.push("/(main)/InventoryScreen")}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${needReorder} items need attention. Tap to view inventory.`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-bolt-yellow/30 items-center justify-center">
                  <HugeiconsIcon icon={Alert02Icon} size={18} color={Colors.warning.text} />
                </View>
                <View>
                  <Text className="text-bolt-graphite text-xs font-inter-semibold">
                    {needReorder} {needReorder === 1 ? "item needs" : "items need"} attention
                  </Text>
                  <Text className="text-bolt-slate text-2xs font-inter mt-0.5">
                    Low stock or out of stock — reorder soon
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-bolt-blue text-xs font-inter-semibold">Restock</Text>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── Business Health Card (Replaced AI Insights) ───────────────── */}
          <Animated.View entering={FadeInDown.delay(160).duration(400).springify()}>
          <BusinessHealthCard
            metrics={metrics}
            isOnline={isOnline}
            pendingSyncCount={pendingCount}
          />
          </Animated.View>

          {/* ── Recent Sales List ────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
          <View className="mt-4 flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-1.5 h-1.5 rounded-full bg-bolt-blue" />
              <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest">
                Recent Sales
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(main)/ReceiptScreen")}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View all sales receipts"
              className="flex-row items-center gap-1"
            >
              <Text className="text-bolt-blue text-xs font-inter-semibold">
                See all
              </Text>
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View
            className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden"
            style={Shadows.card}
          >
            {recentReceipts.length === 0 ? (
              <View className="p-8 items-center justify-center">
                <View className="w-12 h-12 rounded-2xl bg-bolt-light items-center justify-center mb-3">
                  <HugeiconsIcon icon={Invoice02Icon} size={22} color={Colors.primary} />
                </View>
                <Text className="text-bolt-graphite text-sm font-inter-semibold text-center">
                  No sales recorded today
                </Text>
                <Text className="text-bolt-slate text-xs font-inter text-center mt-1">
                  Tap "Record a Sale" above to log your first sale
                </Text>
              </View>
            ) : (
              recentReceipts.map((receipt, index) => {
                const itemCount = receipt.items?.length || 0;
                const isLast = index === recentReceipts.length - 1;

                return (
                  <ReceiptRow
                    key={receipt.id}
                    receipt={receipt}
                    isLast={isLast}
                    onPress={setSelectedReceipt}
                  />
                );
              })
            )}
          </View>
          </Animated.View>

          {/* ── Top Selling Products ────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
          <TopSellingProducts />
          </Animated.View>

        </View>
      </ScrollView>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        visible={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
      <BarcodeScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductScanned={(product) => {
          setIsScannerOpen(false);
          router.push({
            pathname: "/(sale)",
            params: { initialProductId: product.id },
          });
        }}
      />
      <AppLockPrimerModal
        visible={showPrimerModal}
        onEnable={handleEnableAppLock}
        onDismiss={handleDismissPrimer}
      />
    </SafeAreaView>
  );
}
