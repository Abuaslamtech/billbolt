import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import PackageAdd01Icon from '@hugeicons/core-free-icons/PackageAdd01Icon';
import PackageReceiveIcon from '@hugeicons/core-free-icons/PackageReceiveIcon';
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";

import SaleActionRow from "@/components/SaleActionRow";
import { Shadows } from "@/lib/styles";

interface Props {
  onRecordSale: () => void;
  onScanBarcode?: () => void;
  onRestock: () => void;
  onAddProduct: () => void;
}

export default function ActionButtons({
  onRecordSale,
  onScanBarcode,
  onRestock,
  onAddProduct,
}: Props) {
  return (
    <View className="mb-3">
      {/* Primary CTA Row — Selling (Reused SaleActionRow Component) */}
      <View className="mb-2.5">
        <SaleActionRow onRecordSale={onRecordSale} onScanBarcode={onScanBarcode} />
      </View>

      {/* Secondary Row — Inventory Operations (Add New Item + Restock Items) */}
      <View className="flex-row gap-2.5">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 bg-bolt-card border border-bolt-border rounded-xl h-14"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddProduct();
          }}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Add new product to inventory"
          style={Shadows.card}
        >
          <HugeiconsIcon icon={PackageAdd01Icon} size={16} color={Colors.primary} />
          <Text className="text-bolt-graphite text-xs font-inter-semibold">
            Add New Product
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 bg-bolt-card border border-bolt-border rounded-xl h-14"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRestock();
          }}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Restock existing inventory items"
          style={Shadows.card}
        >
          <HugeiconsIcon icon={PackageReceiveIcon} size={16} color={Colors.primary} />
          <Text className="text-bolt-graphite text-xs font-inter-semibold">
            Restock Items
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
