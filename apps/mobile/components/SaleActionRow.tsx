import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashIcon, QrCode01Icon } from "@hugeicons/core-free-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

export interface SaleActionRowProps {
  onRecordSale: () => void;
  onScanBarcode?: () => void;
}

/**
 * Reusable Primary Action Row for Selling.
 * Enforces unified visual geometry, icons, tactile feedback, and accessibility
 * across the Home Dashboard and the Sales tab.
 */
export default function SaleActionRow({
  onRecordSale,
  onScanBarcode,
}: SaleActionRowProps) {
  return (
    <View className="flex-row items-center gap-2">
      {/* Primary Hero: Record a Sale Button */}
      <TouchableOpacity
        className="flex-1 bg-bolt-blue rounded-2xl h-14 flex-row items-center justify-center gap-2"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onRecordSale();
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Record a new sale"
        style={Shadows.primaryButton}
      >
        <HugeiconsIcon icon={FlashIcon} size={18} color="#FFFFFF" />
        <Text className="text-white text-base font-inter-bold tracking-wide">
          Record a Sale
        </Text>
      </TouchableOpacity>

      {/* Companion: Scan Barcode Button with Clear Label */}
      <TouchableOpacity
        className="h-14 bg-bolt-surface border border-bolt-border rounded-2xl px-4 flex-row items-center justify-center gap-2 active:bg-bolt-divider"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (onScanBarcode) {
            onScanBarcode();
          } else {
            onRecordSale();
          }
        }}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Scan product barcode"
        style={Shadows.card}
      >
        <HugeiconsIcon icon={QrCode01Icon} size={20} color={Colors.primary} />
        <Text className="text-bolt-blue text-xs font-inter-semibold">
          Scan
        </Text>
      </TouchableOpacity>
    </View>
  );
}
