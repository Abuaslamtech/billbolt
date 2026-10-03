import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import Coins01Icon from "@hugeicons/core-free-icons/Coins01Icon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import * as Haptics from "expo-haptics";

import Header from "@/components/Header";
import DebtSummaryCard from "@/components/Credit/DebtSummaryCard";
import DebtorFilterTabs, { DebtorTabKey } from "@/components/Credit/DebtorFilterTabs";
import DebtorSearchBar from "@/components/Credit/DebtorSearchBar";
import DebtorCard from "@/components/Credit/DebtorCard";
import RecordPaymentModal from "@/components/Credit/RecordPaymentModal";
import SendReminderModal from "@/components/Credit/SendReminderModal";

import { Colors } from "@/lib/colors";
import { useAppDataStore } from "@/store/AppDataStore";
import { useSaleStore } from "@/store/saleStore";
import { DebtorCustomerSummary } from "@/types/models";

export default function CreditScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DebtorTabKey>("all");

  // Selected debtor for modals
  const [paymentDebtor, setPaymentDebtor] = useState<DebtorCustomerSummary | null>(null);
  const [reminderDebtor, setReminderDebtor] = useState<DebtorCustomerSummary | null>(null);

  const debtors = useAppDataStore((state) => state.debtors);
  const refresh = useAppDataStore((state) => state.refresh);
  const metrics = useAppDataStore((state) => state.metrics);
  const setPaymentMethod = useSaleStore((state) => state.setPaymentMethod);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleRecordCreditSale = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaymentMethod("Credit");
    router.push("/(sale)");
  }, [setPaymentMethod]);

  // Tab counts
  const allDebtors = useMemo(() => debtors.filter((d) => d.remainingBalance > 0), [debtors]);
  const overdueDebtors = useMemo(() => allDebtors.filter((d) => d.isOverdue), [allDebtors]);
  const clearedDebtors = useMemo(() => debtors.filter((d) => d.remainingBalance <= 0), [debtors]);

  // Filtered & Searched list
  const filteredDebtors = useMemo(() => {
    let list: DebtorCustomerSummary[] = [];
    if (activeTab === "all") list = allDebtors;
    else if (activeTab === "overdue") list = overdueDebtors;
    else if (activeTab === "cleared") list = clearedDebtors;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (d) =>
        d.customerName.toLowerCase().includes(q) ||
        (d.customerPhone && d.customerPhone.includes(q))
    );
  }, [activeTab, allDebtors, overdueDebtors, clearedDebtors, searchQuery]);

  const totalOutstanding = metrics?.totalOutstandingDebt ?? allDebtors.reduce((sum, d) => sum + d.remainingBalance, 0);
  const totalDebtorsCount = allDebtors.length;
  const overdueCount = overdueDebtors.length;

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
        {/* ── 1. Context First: High-Level Debt Summary Card ──────────────── */}
        <DebtSummaryCard
          totalOutstanding={totalOutstanding}
          totalDebtors={totalDebtorsCount}
          overdueCount={overdueCount}
        />

        {/* ── 2. Action Second: Primary Hero Action (The One-Hero Rule) ────── */}
        <TouchableOpacity
          onPress={handleRecordCreditSale}
          activeOpacity={0.75}
          className="bg-bolt-blue active:bg-bolt-primary-dark rounded-2xl py-3.5 px-4 flex-row items-center justify-center gap-2 mb-4"
          accessibilityRole="button"
          accessibilityLabel="Record a sale on credit"
        >
          <HugeiconsIcon icon={Add01Icon} size={18} color={Colors.card} />
          <Text className="font-poppins-semibold text-sm text-bolt-card">
            Record Sale on Credit
          </Text>
        </TouchableOpacity>

        {/* ── 3. Filters & Search Bar ─────────────────────────────────────── */}
        <DebtorSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search customer name or phone..."
        />

        <DebtorFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allCount={allDebtors.length}
          overdueCount={overdueDebtors.length}
          clearedCount={clearedDebtors.length}
        />

        {/* ── 4. Ledger Third: List of Debtor Cards ───────────────────────── */}
        {filteredDebtors.length > 0 ? (
          filteredDebtors.map((debtor) => (
            <DebtorCard
              key={debtor.customerPhone || debtor.customerName}
              debtor={debtor}
              onRecordPayment={(d) => setPaymentDebtor(d)}
              onSendReminder={(d) => setReminderDebtor(d)}
            />
          ))
        ) : (
          /* Empty State (Plain, friendly human merchant language) */
          <View className="bg-bolt-card rounded-2xl border border-bolt-border p-6 items-center justify-center my-4">
            <View className="w-12 h-12 rounded-full bg-bolt-light items-center justify-center mb-3">
              {searchQuery.trim() ? (
                <HugeiconsIcon icon={Coins01Icon} size={24} color={Colors.slate} />
              ) : activeTab === "cleared" ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color={Colors.success.text} />
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color={Colors.primary} />
              )}
            </View>

            <Text className="font-poppins-bold text-base text-bolt-graphite text-center mb-1">
              {searchQuery.trim()
                ? "No Customer Found"
                : activeTab === "overdue"
                ? "No Overdue Debts"
                : activeTab === "cleared"
                ? "No Settled Records Yet"
                : "No One is Owing You"}
            </Text>

            <Text className="font-inter text-xs text-bolt-slate text-center leading-relaxed max-w-[260px]">
              {searchQuery.trim()
                ? `No customer matches "${searchQuery}". Check the phone number or name.`
                : activeTab === "overdue"
                ? "All customers with debt are currently on track with their promised dates."
                : activeTab === "cleared"
                ? "When customers clear their debts, their settled receipts will appear here."
                : "Great news! All sales have been paid in full or no credit sales have been recorded yet."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Payment Settlement Modal ─────────────────────────────────────── */}
      <RecordPaymentModal
        visible={Boolean(paymentDebtor)}
        debtor={paymentDebtor}
        onClose={() => setPaymentDebtor(null)}
      />

      {/* ── Polite WhatsApp/SMS Reminder Modal ────────────────────────────── */}
      <SendReminderModal
        visible={Boolean(reminderDebtor)}
        debtor={reminderDebtor}
        onClose={() => setReminderDebtor(null)}
      />
    </SafeAreaView>
  );
}
