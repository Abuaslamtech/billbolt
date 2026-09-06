import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import { Colors } from "@/lib/colors";

type SettingRowProps = {
  icon: any;
  label: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
};

export default function SettingRow({
  icon: Icon,
  label,
  description,
  onPress,
  right,
  destructive = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 border-b border-bolt-border last:border-0 active:bg-bolt-divider"
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: destructive ? Colors.danger.bg : Colors.primaryLight }}
      >
        <HugeiconsIcon
          icon={Icon}
          size={18}
          color={destructive ? Colors.danger.text : Colors.primary}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-inter-medium ${
            destructive ? "text-bolt-red" : "text-bolt-graphite"
          }`}
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs font-inter text-bolt-slate mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {right !== undefined ? (
        right
      ) : onPress ? (
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );
}
