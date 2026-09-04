import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  FlashIcon,
  ArrowRight01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Colors } from "@/lib/colors";

interface Props {
  label?: string;
  primaryLabel?: string;
  primarySub?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export default function CallToAction({
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = "Record a Sale",
  primarySub = "Fast entry • Updates stock & revenue",
  label = "View Sales History",
}: Props) {
  return (
    <View className="mt-2">
      <TouchableOpacity
        className="bg-bolt-blue rounded-2xl p-4 shadow-sm active:opacity-95 mb-2.5"
        onPress={onPrimaryAction}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3.5">
            <View className="bg-white/20 rounded-full p-2.5">
              <HugeiconsIcon icon={FlashIcon} color="#FFFFFF" size={24} />
            </View>
            <View>
              <Text className="text-white font-poppins-bold text-lg leading-tight">
                {primaryLabel}
              </Text>
              <Text className="text-white/90 font-inter text-xs mt-0.5">
                {primarySub}
              </Text>
            </View>
          </View>
          <HugeiconsIcon icon={ArrowRight01Icon} color="white" size={22} />
        </View>
      </TouchableOpacity>

      {onSecondaryAction && (
        <TouchableOpacity
          className="bg-bolt-card border border-bolt-border rounded-xl py-3 px-4 active:bg-bolt-surface flex-row items-center justify-center gap-2"
          onPress={onSecondaryAction}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <HugeiconsIcon icon={Clock01Icon} color={Colors.primary} size={16} />
          <Text className="text-bolt-graphite font-inter-semibold text-xs">{label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
