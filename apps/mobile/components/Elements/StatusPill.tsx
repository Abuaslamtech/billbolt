import React from "react";
import { View, Text } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Colors } from "@/lib/colors";

export type StatusPillVariant = "success" | "danger" | "neutral";

export interface StatusPillProps {
  variant?: StatusPillVariant;
  icon?: any;
  label: string;
  value: string;
  className?: string;
}

export default function StatusPill({
  variant = "neutral",
  icon,
  label,
  value,
  className = "",
}: StatusPillProps) {
  const isSuccess = variant === "success";
  const isDanger = variant === "danger";

  const containerBg = isSuccess
    ? "bg-bolt-success-bg border-bolt-success-border"
    : isDanger
    ? "bg-bolt-danger-bg border-bolt-danger-border"
    : "bg-bolt-surface border-bolt-border";

  const valueColor = isSuccess
    ? "text-bolt-success-text"
    : isDanger
    ? "text-bolt-danger-text"
    : "text-bolt-slate";

  const iconColor = isSuccess
    ? Colors.mint
    : isDanger
    ? Colors.danger.text
    : Colors.slate;

  return (
    <View
      className={`border rounded-xl px-3.5 py-2.5 flex-row items-center justify-between ${containerBg} ${className}`}
    >
      <View className="flex-row items-center gap-1.5">
        {icon && <HugeiconsIcon icon={icon} size={15} color={iconColor} />}
        <Text className="font-inter-medium text-xs text-bolt-graphite">
          {label}
        </Text>
      </View>
      <Text className={`font-poppins-bold text-xs ${valueColor}`}>{value}</Text>
    </View>
  );
}
