import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  TradeUpIcon,
  PieChartIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";

import Header from "@/components/Header";
import { useAppDataStore } from "@/store/AppDataStore";
import { getCurrencySymbol } from "@/lib/formatters";
import { Colors } from "@/lib/colors";
import { useReportScreen } from "@/hooks/useReportScreen";
import { Shadows } from "@/lib/styles";

export default function ReportScreen() {
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const {
    timeframe,
    handleTimeframeChange,
    loading,
    refreshing,
    handleRefresh,
    selectedStats,
    profitPct,
    costPct,
    profitPerThousand,
    netCashFlow,
    topMoneyMakers,
    fmt,
    fmtFull,
  } = useReportScreen();

  const hasSales = selectedStats.revenue > 0;
  const isHealthyMargin = selectedStats.margin >= 15;
  const timeframeLabel =
    timeframe === "this_month"
      ? "This Month"
      : timeframe === "last_month"
        ? "Last Month"
        : "This Week";

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
        {/* ── Screen Title ─────────────────────────────────────────────── */}
        <View className="mb-3.5">
          <Text className="font-poppins-bold text-lg text-bolt-graphite">
            Reports
          </Text>
          <Text className="font-inter text-xs text-bolt-slate mt-0.5">
            Your earnings, spending, and best-selling products
          </Text>
        </View>

        {/* ── 1. Time Picker (Merchant Rhythm) ─────────────────────────── */}
        <View className="flex-row bg-bolt-card p-1 rounded-2xl border border-bolt-border mb-3.5">
          <TouchableOpacity
            onPress={() => handleTimeframeChange("this_month")}
            accessibilityRole="button"
            accessibilityLabel="View This Month's Reports"
            activeOpacity={0.7}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${timeframe === "this_month" ? "bg-bolt-blue" : ""
              }`}
          >
            <Text
              className={`text-xs font-inter-semibold ${timeframe === "this_month" ? "text-white" : "text-bolt-slate"
                }`}
            >
              This Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTimeframeChange("last_month")}
            accessibilityRole="button"
            accessibilityLabel="View Last Month's Reports"
            activeOpacity={0.7}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${timeframe === "last_month" ? "bg-bolt-blue" : ""
              }`}
          >
            <Text
              className={`text-xs font-inter-semibold ${timeframe === "last_month" ? "text-white" : "text-bolt-slate"
                }`}
            >
              Last Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTimeframeChange("this_week")}
            accessibilityRole="button"
            accessibilityLabel="View This Week's Reports"
            activeOpacity={0.7}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${timeframe === "this_week" ? "bg-bolt-blue" : ""
              }`}
          >
            <Text
              className={`text-xs font-inter-semibold ${timeframe === "this_week" ? "text-white" : "text-bolt-slate"
                }`}
            >
              This Week
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color={Colors.primary} />
            <Text className="font-inter text-xs text-bolt-slate mt-2">
              Loading reports...
            </Text>
          </View>
        ) : (
          <>
            {/* ── 2. The Profit Card (The Bottom Line) ─────────────────── */}
            <View
              className="bg-bolt-card rounded-2xl mb-3.5 border border-bolt-border overflow-hidden"
              style={Shadows.card}
            >
              {/* Top Brand Gradient Accent Band (4px) */}
              <LinearGradient
                colors={[Colors.primaryDark, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 4, width: "100%" }}
              />

              <View className="p-4">
                {/* Header Row: Label + Status Badge */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-bolt-slate text-xs font-inter-semibold">
                    Your Take-Home Profit ({timeframeLabel})
                  </Text>

                  {hasSales ? (
                    <View
                      className={`px-2.5 py-0.5 rounded-full border flex-row items-center gap-1 ${isHealthyMargin
                          ? "bg-bolt-success-bg border-bolt-success-border"
                          : "bg-bolt-danger-bg border-bolt-danger-border"
                        }`}
                    >
                      <HugeiconsIcon
                        icon={isHealthyMargin ? CheckmarkCircle02Icon : Alert02Icon}
                        size={11}
                        color={isHealthyMargin ? Colors.success.text : Colors.danger.text}
                      />
                      <Text
                        className={`font-inter-semibold text-2xs ${isHealthyMargin ? "text-bolt-success-text" : "text-bolt-danger-text"
                          }`}
                      >
                        {isHealthyMargin ? "Profitable" : "Low Margin"} ({selectedStats.margin}%)
                      </Text>
                    </View>
                  ) : (
                    <View className="px-2.5 py-0.5 rounded-full border border-bolt-border bg-bolt-surface flex-row items-center gap-1">
                      <HugeiconsIcon icon={HelpCircleIcon} size={11} color={Colors.slate} />
                      <Text className="font-inter-medium text-2xs text-bolt-slate">
                        No Sales
                      </Text>
                    </View>
                  )}
                </View>

                {/* Hero Profit Number */}
                <Text
                  className={`font-poppins-bold text-3xl mb-1 ${hasSales ? "text-bolt-success-text" : "text-bolt-slate"
                    }`}
                >
                  {hasSales ? `+${fmtFull(selectedStats.profit)}` : `${currency}0`}
                </Text>

                <Text className="font-inter text-2xs text-bolt-slate mb-3">
                  {selectedStats.label}
                </Text>

                {/* Plain English Translation of Margin */}
                <View className="bg-bolt-surface p-2.5 rounded-xl mb-3.5 border border-bolt-divider flex-row items-center gap-2">
                  <View className="w-6 h-6 rounded-full bg-bolt-light items-center justify-center shrink-0">
                    <HugeiconsIcon
                      icon={hasSales ? TradeUpIcon : HelpCircleIcon}
                      size={13}
                      color={hasSales ? Colors.primary : Colors.slate}
                    />
                  </View>
                  {hasSales ? (
                    <Text className="font-inter text-xs text-bolt-graphite flex-1 leading-4">
                      For every <Text className="font-inter-bold">{currency}1,000</Text> sold, you pocketed{" "}
                      <Text className="font-poppins-semibold text-bolt-success-text">
                        {currency}{profitPerThousand.toLocaleString("en-NG")}
                      </Text>{" "}
                      as pure profit.
                    </Text>
                  ) : (
                    <Text className="font-inter text-xs text-bolt-slate flex-1 leading-4">
                      No sales recorded for {timeframeLabel.toLowerCase()} yet.
                    </Text>
                  )}
                </View>

                {/* Sub-Stats Row with Hairline Dividers */}
                <View className="border-t border-bolt-divider pt-3 flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-bolt-slate text-2xs font-inter mb-0.5">Total Sales</Text>
                    <Text className="text-bolt-graphite text-sm font-poppins-semibold">
                      {fmt(selectedStats.revenue)}
                    </Text>
                  </View>

                  <View className="w-px h-7 bg-bolt-divider" />

                  <View className="flex-1 items-center">
                    <Text className="text-bolt-slate text-2xs font-inter mb-0.5">Cost of Goods</Text>
                    <Text className="text-bolt-slate text-sm font-poppins-semibold">
                      {fmt(selectedStats.cost)}
                    </Text>
                  </View>

                  <View className="w-px h-7 bg-bolt-divider" />

                  <View className="flex-1 items-end">
                    <Text className="text-bolt-slate text-2xs font-inter mb-0.5">Units Sold</Text>
                    <Text className="font-poppins-semibold text-sm text-bolt-graphite">
                      {selectedStats.units}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── 3. Cash Flow Reality Check ("Where Did My Money Go?") ────── */}
            <View
              className="bg-bolt-card rounded-2xl p-4 mb-3.5 border border-bolt-border"
              style={Shadows.card}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <HugeiconsIcon icon={PieChartIcon} size={16} color={Colors.primary} />
                  <Text className="font-poppins-semibold text-sm text-bolt-graphite">
                    Cash Flow Reality Check
                  </Text>
                </View>
                <Text className="font-inter text-2xs text-bolt-slate">
                  Money In vs Reinvested
                </Text>
              </View>

              {/* 3 Cash Flow Tiles */}
              <View className="flex-row gap-2.5 mb-3">
                <View className="flex-1 bg-bolt-surface p-2.5 rounded-xl border border-bolt-divider">
                  <Text className="font-inter text-2xs text-bolt-slate mb-1">Money In</Text>
                  <Text className="font-poppins-bold text-xs text-bolt-graphite">
                    {fmt(selectedStats.revenue)}
                  </Text>
                </View>

                <View className="flex-1 bg-bolt-surface p-2.5 rounded-xl border border-bolt-divider">
                  <Text className="font-inter text-2xs text-bolt-slate mb-1">Restock Spent</Text>
                  <Text className="font-poppins-bold text-xs text-bolt-slate">
                    {fmt(selectedStats.restockSpend)}
                  </Text>
                </View>

                <View className="flex-1 bg-bolt-surface p-2.5 rounded-xl border border-bolt-divider">
                  <Text className="font-inter text-2xs text-bolt-slate mb-1">Cash Left Over</Text>
                  <Text
                    className={`font-poppins-bold text-xs ${netCashFlow > 0 ? "text-bolt-success-text" : "text-bolt-slate"
                      }`}
                  >
                    {fmt(Math.max(0, netCashFlow))}
                  </Text>
                </View>
              </View>

              {/* Visual Proportion Bar */}
              <View className="h-2.5 bg-bolt-divider rounded-full flex-row overflow-hidden">
                <View
                  style={{
                    width: `${hasSales ? costPct : 0}%`,
                    backgroundColor: Colors.disabled,
                  }}
                />
                <View
                  style={{
                    width: `${hasSales ? profitPct : 0}%`,
                    backgroundColor: Colors.mint,
                  }}
                />
              </View>
              <View className="flex-row justify-between items-center mt-1.5 px-0.5">
                <Text className="font-inter text-2xs text-bolt-slate">
                  Cost of Goods: {hasSales ? `${costPct}%` : "—"}
                </Text>
                <Text className="font-inter text-2xs text-bolt-success-text">
                  Clean Profit: {hasSales ? `${profitPct}%` : "—"}
                </Text>
              </View>
            </View>

            {/* ── 4. Top Money Makers (Your Best Items) ─────────────────── */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-1.5">
                  <HugeiconsIcon icon={TradeUpIcon} size={15} color={Colors.primary} />
                  <Text className="font-poppins-semibold text-sm text-bolt-graphite">
                    Top Money Makers
                  </Text>
                </View>
                <Text className="font-inter text-2xs text-bolt-slate">
                  Ranked by Real Profit
                </Text>
              </View>

              {topMoneyMakers.length === 0 ? (
                <View className="bg-bolt-card rounded-2xl p-6 items-center border border-bolt-border">
                  <Text className="font-inter text-xs text-bolt-slate">
                    No sales recorded yet for {timeframeLabel.toLowerCase()}.
                  </Text>
                </View>
              ) : (
                <View
                  className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden"
                  style={Shadows.card}
                >
                  {topMoneyMakers.map((p, idx) => (
                    <View
                      key={p.productId}
                      className={`flex-row items-center px-4 py-3 gap-3 ${idx < topMoneyMakers.length - 1 ? "border-b border-bolt-divider" : ""
                        }`}
                    >
                      {/* Rank Badge */}
                      <View
                        className={`w-7 h-7 rounded-full items-center justify-center shrink-0 ${idx === 0
                            ? "bg-amber-100 border border-amber-300"
                            : idx === 1
                              ? "bg-slate-100 border border-slate-300"
                              : idx === 2
                                ? "bg-amber-50 border border-amber-200"
                                : "bg-bolt-light"
                          }`}
                      >
                        <Text
                          className={`font-inter-bold text-xs ${idx === 0
                              ? "text-amber-700"
                              : idx === 1
                                ? "text-slate-700"
                                : idx === 2
                                  ? "text-amber-800"
                                  : "text-bolt-blue"
                            }`}
                        >
                          {idx + 1}
                        </Text>
                      </View>

                      {/* Product Name & Category */}
                      <View className="flex-1 justify-center pr-2">
                        <Text
                          className="font-poppins-semibold text-sm text-bolt-graphite leading-snug"
                          numberOfLines={1}
                        >
                          {p.productName}
                        </Text>
                        <Text className="font-inter text-xs text-bolt-slate mt-0.5">
                          {p.totalUnitsSold} units sold • {p.category || "General"}
                        </Text>
                      </View>

                      {/* Profit Brought In */}
                      <View className="items-end justify-center">
                        <Text className="font-poppins-bold text-sm text-bolt-success-text">
                          +{fmt(p.totalProfit)}
                        </Text>
                        <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
                          Sales: {fmt(p.totalRevenue)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}