import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Receipt } from "@/types/models";
import { formatCurrency } from "@/lib/formatters";
import { formatReceiptNo } from "@/services/storage/cycleUtils";
import { Colors } from "@/lib/colors";

interface ReceiptRowProps {
  receipt: Receipt;
  isLast?: boolean;
  onPress: (receipt: Receipt) => void;
}

/**
 * Reusable row component for displaying a summary of a sale (receipt).
 * Provides a unified, high-density design across the Dashboard and Sales History.
 */
export default function ReceiptRow({ receipt, isLast = false, onPress }: ReceiptRowProps) {
  const itemCount = receipt.items?.length || 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(receipt)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`View sale for ${receipt.customerName || "Walk-in Customer"}`}
      className={`flex-row items-center px-4 py-3.5 gap-3 ${
        !isLast ? "border-b border-bolt-divider" : ""
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-bolt-light items-center justify-center shrink-0">
        <Text className="text-bolt-blue text-sm font-inter-bold">
          {(receipt.customerName || "W").charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1 min-w-0">
        <Text
          className="font-inter-semibold text-sm text-bolt-graphite"
          numberOfLines={1}
        >
          {receipt.customerName || "Walk-in Customer"}
        </Text>

        <View className="flex-row items-center gap-2 mt-0.5">
          <Text className="font-inter-semibold text-xs text-bolt-blue">
            {formatReceiptNo(receipt)}
          </Text>
          <Text className="text-bolt-slate text-xs">·</Text>
          <Text className="font-inter text-xs text-bolt-slate">
            {receipt.date}
          </Text>
          {receipt.paymentMethod && (
            <View className="bg-bolt-light rounded px-1.5 py-0.5">
              <Text className="text-bolt-blue text-2xs font-inter-semibold">
                {receipt.paymentMethod}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="items-end shrink-0">
        <Text className="font-poppins-bold text-bolt-graphite text-sm">
          {formatCurrency(receipt.total)}
        </Text>
        <View className="flex-row items-center gap-0.5 mt-0.5">
          <Text className="font-inter text-2xs text-bolt-blue">View</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
