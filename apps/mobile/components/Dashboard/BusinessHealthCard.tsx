import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import HeartCheckIcon from '@hugeicons/core-free-icons/HeartCheckIcon';
import ShieldCheckIcon from '@hugeicons/core-free-icons/ShieldCheckIcon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import { router } from "expo-router";
import { Colors } from "@/lib/colors";
import { DashboardMetrics } from "@/types/models";
import { Shadows } from "@/lib/styles";

interface BusinessHealthCardProps {
  metrics: DashboardMetrics | null;
  isOnline: boolean;
  pendingSyncCount: number;
}

export default function BusinessHealthCard({
  metrics,
  isOnline,
  pendingSyncCount,
}: BusinessHealthCardProps) {
  // Calculate dynamic health score
  let score = 85;
  const outOfStock = metrics?.outOfStockCount || 0;
  const needReorder = metrics?.needReorderCount || 0;
  const growth = metrics?.todaySalesGrowth || 0;

  if (outOfStock > 0) score -= Math.min(outOfStock * 10, 25);
  if (needReorder > 0) score -= Math.min(needReorder * 5, 15);
  if (growth > 0) score += 10;
  if (!isOnline && pendingSyncCount > 0) score -= 5;
  score = Math.max(50, Math.min(100, score));

  const getStatus = () => {
    if (score >= 90) return { label: "Great Shape", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" };
    if (score >= 75) return { label: "Looking Good", color: Colors.primary, bg: Colors.primaryLight, border: "#BFDBFE" };
    return { label: "Needs Attention", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  };

  const status = getStatus();

  return (
    <View
      className="bg-bolt-card rounded-2xl p-4 mb-3 border border-bolt-border"
      style={Shadows.card}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-bolt-light items-center justify-center">
            <HugeiconsIcon icon={HeartCheckIcon} size={18} color={Colors.primary} />
          </View>
          <View>
            <Text className="text-xs font-inter-semibold text-bolt-graphite">
              Daily Business Health
            </Text>
            <Text className="text-2xs font-inter text-bolt-slate">
              Overview of your stock & backup
            </Text>
          </View>
        </View>

        <View
          className="px-2.5 py-1 rounded-full border flex-row items-center gap-1"
          style={{ backgroundColor: status.bg, borderColor: status.border }}
        >
          <Text className="text-2xs font-inter-bold" style={{ color: status.color }}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2 bg-bolt-divider rounded-full overflow-hidden mb-3">
        <View
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: status.color,
          }}
        />
      </View>

      {/* 3 Quick Diagnostics */}
      <View className="flex-row items-center justify-between pt-1 border-t border-bolt-divider">
        <View className="flex-1">
          <Text className="text-2xs font-inter text-bolt-slate">Stock Status</Text>
          <Text
            className={`text-xs font-inter-semibold mt-0.5 ${
              outOfStock === 0 ? "text-bolt-graphite" : "text-bolt-warning-text"
            }`}
          >
            {outOfStock === 0 ? "All in stock" : `${outOfStock} out of stock`}
          </Text>
        </View>

        <View className="w-px h-6 bg-bolt-divider mx-2" />

        <View className="flex-1">
          <Text className="text-2xs font-inter text-bolt-slate">Cloud Backup</Text>
          <Text
            className={`text-xs font-inter-semibold mt-0.5 ${
              pendingSyncCount === 0 ? "text-bolt-graphite" : "text-bolt-warning-text"
            }`}
          >
            {pendingSyncCount === 0 ? "All saved" : `${pendingSyncCount} unsaved`}
          </Text>
        </View>

        <View className="w-px h-6 bg-bolt-divider mx-2" />

        <TouchableOpacity
          onPress={() => router.push("/(main)/ReportScreen")}
          className="flex-row items-center gap-1 self-center py-1"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View full business reports"
        >
          <Text className="text-xs font-inter-semibold text-bolt-blue">View Report</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
