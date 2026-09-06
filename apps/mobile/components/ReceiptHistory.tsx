import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Invoice02Icon from '@hugeicons/core-free-icons/Invoice02Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import * as Haptics from "expo-haptics";
import { useAppDataStore } from "@/store/AppDataStore";
import { Receipt } from "@/types/models";
import ReceiptDetailModal from "@/components/Receipts/ReceiptDetailModal";
import ReceiptRow from "@/components/ReceiptRow";
import { formatReceiptNo } from "@/services/storage/cycleUtils";
import { Colors } from "@/lib/colors";
import { formatCurrency as fmt } from "@/lib/formatters";
import { Shadows } from "@/lib/styles";

const PAGE_SIZE = 15;

export default function ReceiptHistory() {
  const { receipts, refresh } = useAppDataStore();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "Cash" | "Transfer" | "Card">("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Kick a refresh if this tab opens with no receipts in the store yet
  useEffect(() => {
    if (receipts.length === 0) {
      refresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & Search Logic
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (r.customerName && r.customerName.toLowerCase().includes(query)) ||
        (formatReceiptNo(r).toLowerCase().includes(query)) ||
        (r.date && r.date.includes(query));

      const matchesFilter =
        selectedFilter === "ALL" || r.paymentMethod === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [receipts, searchQuery, selectedFilter]);

  const displayedReceipts = useMemo(() => {
    return filteredReceipts.slice(0, visibleCount);
  }, [filteredReceipts, visibleCount]);

  const hasMore = visibleCount < filteredReceipts.length;

  const handleLoadMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleFilterChange = (filter: "ALL" | "Cash" | "Transfer" | "Card") => {
    Haptics.selectionAsync();
    setSelectedFilter(filter);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <View className="mt-4 mb-2">
      {/* ── Section Title & Filter Tabs ───────────────────────────── */}
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-2.5">
          <View>
            <Text className="font-poppins-bold text-base text-bolt-graphite">
              Sales History
            </Text>
            <Text className="font-inter text-xs text-bolt-slate">
              {receipts.length === 1 ? "1 sale recorded" : `${receipts.length} sales recorded`}
            </Text>
          </View>
        </View>

        {/* Search Bar — Comfortable 48px Touch Target */}
        <View
          className="flex-row items-center bg-bolt-card border border-bolt-border rounded-2xl px-3.5 h-12 mb-3"
          style={Shadows.card}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} color={Colors.slate} />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search by customer, receipt number or date..."
            placeholderTextColor={Colors.slate}
            className="flex-1 font-inter-medium text-sm text-bolt-graphite ml-2.5 py-0 h-full"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="w-8 h-8 items-center justify-center -mr-1"
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Filter Pills */}
        <View className="flex-row gap-2">
          {(["ALL", "Cash", "Transfer", "Card"] as const).map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => handleFilterChange(filter)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter === "ALL" ? "all sales" : filter}`}
                className={`px-3.5 py-1.5 rounded-full border ${
                  isActive
                    ? "bg-bolt-blue border-bolt-blue"
                    : "bg-bolt-card border-bolt-border"
                }`}
              >
                <Text
                  className={`font-inter-semibold text-xs ${
                    isActive ? "text-white" : "text-bolt-slate"
                  }`}
                >
                  {filter === "ALL" ? "All" : filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Receipts List ─────────────────────────────────────────── */}
      {receipts.length === 0 ? (
        <View
          className="bg-bolt-card rounded-2xl p-8 items-center justify-center border border-bolt-border"
          style={Shadows.card}
        >
          <View className="w-14 h-14 rounded-2xl bg-bolt-light items-center justify-center mb-2">
            <HugeiconsIcon icon={Invoice02Icon} size={26} color={Colors.primary} />
          </View>
          <Text className="font-poppins-semibold text-bolt-graphite text-base mt-1">
            No sales yet
          </Text>
          <Text className="font-inter text-xs text-bolt-slate text-center mt-1">
            Tap "Record a Sale" above to log your first sale.
          </Text>
        </View>
      ) : filteredReceipts.length === 0 ? (
        <View className="bg-bolt-card rounded-2xl p-6 items-center justify-center border border-bolt-border">
          <Text className="font-inter-medium text-xs text-bolt-slate text-center">
            No sales match "{searchQuery}"
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setSelectedFilter("ALL");
            }}
            className="mt-2"
          >
            <Text className="font-inter-semibold text-xs text-bolt-blue">
              Clear filters
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          className="bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden"
          style={Shadows.card}
        >
          {displayedReceipts.map((item, index) => (
            <ReceiptRow
              key={item.id}
              receipt={item}
              isLast={index === displayedReceipts.length - 1}
              onPress={setSelectedReceipt}
            />
          ))}
        </View>
      )}

      {/* ── Progressive "Load More" Button ────────────────────────────── */}
      {hasMore && (
        <TouchableOpacity
          onPress={handleLoadMore}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Show more sales"
          className="mt-3 bg-bolt-card border border-bolt-border rounded-xl py-3 flex-row items-center justify-center gap-1.5 shadow-sm"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={15} color={Colors.primary} />
          <Text className="font-inter-semibold text-xs text-bolt-blue">
            Show more sales
          </Text>
        </TouchableOpacity>
      )}

      {/* Detail Modal */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        visible={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />
    </View>
  );
}
