import React, { useEffect } from "react";
import { View, ViewProps, StyleProp, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

// ── Base Skeleton Block ───────────────────────────────────────────────────────

export interface SkeletonProps extends ViewProps {
  className?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Base animated skeleton element.
 * Pulses gently on the UI thread using Reanimated (GPU opacity only).
 * Screen reader friendly: hidden from accessibility tree to prevent auditory clutter.
 */
export function Skeleton({
  className = "",
  width,
  height,
  borderRadius,
  style,
  ...props
}: SkeletonProps) {
  const opacity = useSharedValue(0.38);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const customStyle: ViewStyle = {};
  if (width !== undefined) customStyle.width = width;
  if (height !== undefined) customStyle.height = height;
  if (borderRadius !== undefined) customStyle.borderRadius = borderRadius;

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-busy
      style={[animatedStyle, customStyle, style]}
      className={`bg-bolt-border rounded-md ${className}`}
      {...props}
    />
  );
}

// ── Micro Primitives ──────────────────────────────────────────────────────────

export function SkeletonCircle({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      className={`rounded-full shrink-0 ${className}`}
    />
  );
}

export function SkeletonText({
  lines = 1,
  lineHeight = 14,
  className = "",
  gap = 8,
}: {
  lines?: number;
  lineHeight?: number;
  className?: string;
  gap?: number;
}) {
  if (lines === 1) {
    return <Skeleton height={lineHeight} className={`w-full rounded ${className}`} />;
  }

  return (
    <View style={{ gap }} className="w-full">
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        return (
          <Skeleton
            key={index}
            height={lineHeight}
            className={`rounded ${isLast ? "w-3/5" : "w-full"} ${className}`}
          />
        );
      })}
    </View>
  );
}

// ── Domain-Specific Composite Skeletons ───────────────────────────────────────

/**
 * Exact visual placeholder matching TodayRevenueCard geometry.
 * Preserves the 4px top brand accent, layout rhythm, and pill metrics.
 */
export function TodayRevenueCardSkeleton() {
  return (
    <View
      className="bg-bolt-card rounded-2xl mb-3 border border-bolt-border overflow-hidden"
      style={Shadows.cardElevated}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 4, width: "100%" }}
      />
      <View className="p-4">
        {/* Label & Growth pill */}
        <View className="flex-row items-center justify-between mb-2">
          <Skeleton width={110} height={14} className="rounded" />
          <Skeleton width={64} height={20} className="rounded-full" />
        </View>

        {/* Hero Revenue Number */}
        <View className="my-2">
          <Skeleton width={180} height={32} className="rounded-lg" />
        </View>

        {/* Subtitle count */}
        <Skeleton width={120} height={12} className="rounded mb-4" />

        {/* Bottom Comparative Pills (2-column ledger) */}
        <View className="flex-row gap-2 pt-3 border-t border-bolt-divider">
          <View className="flex-1 bg-bolt-surface p-2.5 rounded-xl border border-bolt-border/60 gap-1.5">
            <Skeleton width={80} height={11} className="rounded" />
            <Skeleton width={90} height={16} className="rounded" />
          </View>
          <View className="flex-1 bg-bolt-surface p-2.5 rounded-xl border border-bolt-border/60 gap-1.5">
            <Skeleton width={80} height={11} className="rounded" />
            <Skeleton width={90} height={16} className="rounded" />
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Exact visual placeholder for ReceiptRow (sales ledger item).
 */
export function ReceiptRowSkeleton({ isLast = false }: { isLast?: boolean }) {
  return (
    <View
      className={`flex-row items-center px-4 py-3.5 gap-3 ${
        !isLast ? "border-b border-bolt-divider" : ""
      }`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Avatar Circle */}
      <Skeleton width={40} height={40} borderRadius={20} className="rounded-full shrink-0" />

      {/* Center meta lines */}
      <View className="flex-1 gap-2">
        <Skeleton width="65%" height={14} className="rounded" />
        <Skeleton width="45%" height={11} className="rounded" />
      </View>

      {/* Right Price & Arrow */}
      <View className="items-end gap-1.5">
        <Skeleton width={60} height={15} className="rounded" />
        <Skeleton width={14} height={14} className="rounded" />
      </View>
    </View>
  );
}

/**
 * Exact visual placeholder for Product row in InventoryScreen.
 */
export function ProductRowSkeleton({ isLast = false }: { isLast?: boolean }) {
  return (
    <View
      className={`flex-row items-center px-4 py-3.5 gap-3 ${
        !isLast ? "border-b border-bolt-divider" : ""
      }`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Category Icon */}
      <Skeleton width={40} height={40} borderRadius={12} className="rounded-xl shrink-0" />

      {/* Middle: Title & Stock */}
      <View className="flex-1 gap-2">
        <Skeleton width="70%" height={15} className="rounded" />
        <View className="flex-row items-center gap-2">
          <Skeleton width={45} height={11} className="rounded" />
          <Skeleton width={65} height={11} className="rounded" />
        </View>
      </View>

      {/* Right Price & Chevron */}
      <View className="items-end gap-1.5">
        <Skeleton width={60} height={15} className="rounded" />
        <Skeleton width={40} height={11} className="rounded" />
      </View>
    </View>
  );
}

/**
 * Full page skeleton for ReportScreen.
 * Eliminates layout jumping and replaces jarring loading spinners with structured previews.
 */
export function ReportScreenSkeleton() {
  return (
    <View className="gap-3.5" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* Profit Card Skeleton */}
      <View
        className="bg-bolt-card rounded-2xl mb-1 border border-bolt-border overflow-hidden"
        style={Shadows.card}
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4, width: "100%" }}
        />
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Skeleton width={140} height={13} className="rounded" />
            <Skeleton width={70} height={18} className="rounded-full" />
          </View>

          <Skeleton width={200} height={34} className="rounded-lg my-2" />
          <Skeleton width={150} height={12} className="rounded mb-4" />

          {/* Revenue vs Cost Cards */}
          <View className="flex-row gap-2 pt-3 border-t border-bolt-divider">
            <View className="flex-1 bg-bolt-surface p-3 rounded-xl border border-bolt-border/60 gap-1.5">
              <Skeleton width={70} height={11} className="rounded" />
              <Skeleton width={90} height={16} className="rounded" />
            </View>
            <View className="flex-1 bg-bolt-surface p-3 rounded-xl border border-bolt-border/60 gap-1.5">
              <Skeleton width={70} height={11} className="rounded" />
              <Skeleton width={90} height={16} className="rounded" />
            </View>
          </View>
        </View>
      </View>

      {/* Efficiency Breakdown Card Skeleton */}
      <View className="bg-bolt-card rounded-2xl p-4 border border-bolt-border gap-3" style={Shadows.card}>
        <Skeleton width={150} height={16} className="rounded" />
        <Skeleton width={220} height={12} className="rounded" />
        <View className="flex-row gap-2 pt-2">
          <View className="flex-1 bg-bolt-surface p-3 rounded-xl border border-bolt-border/60 gap-2">
            <Skeleton width={80} height={12} className="rounded" />
            <Skeleton width={50} height={20} className="rounded" />
          </View>
          <View className="flex-1 bg-bolt-surface p-3 rounded-xl border border-bolt-border/60 gap-2">
            <Skeleton width={80} height={12} className="rounded" />
            <Skeleton width={50} height={20} className="rounded" />
          </View>
        </View>
      </View>

      {/* Breakdown Rows Skeleton */}
      <View className="bg-bolt-card rounded-2xl p-4 border border-bolt-border gap-3.5" style={Shadows.card}>
        <Skeleton width={130} height={16} className="rounded" />
        <Skeleton width="100%" height={12} className="rounded" />
        <Skeleton width="100%" height={12} className="rounded" />
        <Skeleton width="80%" height={12} className="rounded" />
      </View>
    </View>
  );
}
