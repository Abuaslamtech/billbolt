import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";

export type DebtorTabKey = "all" | "overdue" | "cleared";

interface DebtorFilterTabsProps {
  activeTab: DebtorTabKey;
  onTabChange: (tab: DebtorTabKey) => void;
  allCount: number;
  overdueCount: number;
  clearedCount: number;
}

export default function DebtorFilterTabs({
  activeTab,
  onTabChange,
  allCount,
  overdueCount,
  clearedCount,
}: DebtorFilterTabsProps) {
  const tabs: { key: DebtorTabKey; label: string; count: number }[] = [
    { key: "all", label: "Owing", count: allCount },
    { key: "overdue", label: "Overdue", count: overdueCount },
    { key: "cleared", label: "Settled", count: clearedCount },
  ];

  return (
    <View className="flex-row gap-2 mb-3">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(tab.key);
            }}
            activeOpacity={0.75}
            className={`flex-row items-center px-3.5 py-2.5 rounded-xl border ${
              isSelected
                ? "bg-bolt-blue border-bolt-blue"
                : "bg-bolt-card border-bolt-border active:bg-bolt-divider"
            }`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${tab.label} filter tab, ${tab.count} items`}
          >
            <Text
              className={`text-xs font-inter-semibold mr-1.5 ${
                isSelected ? "text-bolt-card font-poppins-semibold" : "text-bolt-graphite"
              }`}
            >
              {tab.label}
            </Text>
            <View
              className={`px-1.5 py-0.2 rounded-full ${
                isSelected ? "bg-white/20" : "bg-bolt-divider"
              }`}
            >
              <Text
                className={`text-2xs font-inter-bold ${
                  isSelected ? "text-bolt-card" : "text-bolt-slate"
                }`}
              >
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
