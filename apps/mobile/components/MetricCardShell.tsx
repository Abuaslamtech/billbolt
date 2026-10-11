import React from "react";
import { View, StyleProp, ViewStyle, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

export interface MetricCardShellProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  shadowStyle?: StyleProp<ViewStyle>;
  accentColors?: readonly [string, string, ...string[]];
  accentHeight?: number;
  testID?: string;
}

/**
 * MetricCardShell — Canonical design system container for top overview cards.
 * Enforces unified visual DNA across Dashboard, Inventory, and Credit tabs:
 * - 4px Brand LinearGradient accent band
 * - Rounded-2xl borders & background tokens
 * - Standardized card elevation shadow
 * - Consistent vertical rhythm (mb-3.5)
 */
export default function MetricCardShell({
  children,
  className = "",
  contentClassName = "p-4",
  shadowStyle = Shadows.card,
  accentColors = [Colors.primaryDark, Colors.primary] as const,
  accentHeight = 4,
  testID,
  ...restProps
}: MetricCardShellProps) {
  return (
    <View
      testID={testID}
      style={shadowStyle}
      className={`bg-bolt-card rounded-2xl mb-3.5 border border-bolt-border overflow-hidden ${className}`.trim()}
      {...restProps}
    >
      {/* Signature Brand Accent Band */}
      <LinearGradient
        colors={accentColors as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: accentHeight, width: "100%" }}
      />

      <View className={contentClassName}>{children}</View>
    </View>
  );
}
