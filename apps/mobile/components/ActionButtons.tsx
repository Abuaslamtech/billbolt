import React from "react";
import { View } from "react-native";
import PackageAdd01Icon from "@hugeicons/core-free-icons/PackageAdd01Icon";
import PackageReceiveIcon from "@hugeicons/core-free-icons/PackageReceiveIcon";

import SaleActionRow from "@/components/SaleActionRow";
import { Button } from "@/components/Elements/Button";

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
      {/* Primary CTA Row — Selling */}
      <View className="mb-2.5">
        <SaleActionRow onRecordSale={onRecordSale} onScanBarcode={onScanBarcode} />
      </View>

      {/* Secondary Row — Inventory Operations */}
      <View className="flex-row gap-2.5">
        <View className="flex-1">
          <Button
            label="Add New Product"
            icon={PackageAdd01Icon}
            variant="secondary"
            size="lg"
            fullWidth
            onPress={onAddProduct}
            accessibilityLabel="Add new product to inventory"
          />
        </View>

        <View className="flex-1">
          <Button
            label="Restock Items"
            icon={PackageReceiveIcon}
            variant="secondary"
            size="lg"
            fullWidth
            onPress={onRestock}
            accessibilityLabel="Restock existing inventory items"
          />
        </View>
      </View>
    </View>
  );
}
