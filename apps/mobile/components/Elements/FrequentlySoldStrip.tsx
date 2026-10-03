import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import FlashIcon from '@hugeicons/core-free-icons/FlashIcon';
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import { ProductWithStock } from "@/types/models";
import { formatCurrency } from "@/lib/formatters";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

interface FrequentlySoldStripProps {
  products: ProductWithStock[];
  onSelectProduct: (product: ProductWithStock) => void;
  title?: string;
  className?: string;
}

/**
 * Reusable Frequently Sold 1-Click Action Bar
 * Follows Billbolt Design System: rounded-2xl card, bolt-blue accents, Hugeicons SVG iconography.
 */
export default function FrequentlySoldStrip({
  products,
  onSelectProduct,
  title = "Frequently Sold Items",
  className = "",
}: FrequentlySoldStripProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View
      className={`bg-bolt-card rounded-2xl border border-bolt-border p-3.5 mb-3.5 ${className}`}
      style={Shadows.card}
    >
      <View className="flex-row items-center gap-1.5 mb-2.5">
        <View className="w-5 h-5 rounded-md bg-bolt-light items-center justify-center">
          <HugeiconsIcon icon={FlashIcon} size={12} color={Colors.primary} />
        </View>
        <Text className="font-poppins-semibold text-xs text-bolt-graphite uppercase tracking-wider">
          {title}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pr-2">
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => onSelectProduct(product)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Quick add ${product.name}, ${formatCurrency(product.sellingPrice)}`}
              className="bg-bolt-surface border border-bolt-border px-3 py-2 rounded-xl flex-row items-center gap-2 active:bg-bolt-light active:border-bolt-blue/40"
            >
              <View className="pr-0.5">
                <Text
                  numberOfLines={1}
                  className="font-inter-semibold text-xs text-bolt-graphite leading-tight"
                >
                  {product.name}
                </Text>
                <Text className="font-poppins-bold text-xs text-bolt-blue mt-0.5">
                  {formatCurrency(product.sellingPrice)}
                </Text>
              </View>

              <View className="w-6 h-6 rounded-lg bg-bolt-blue items-center justify-center shadow-xs">
                <HugeiconsIcon icon={Add01Icon} size={12} color={Colors.card} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
