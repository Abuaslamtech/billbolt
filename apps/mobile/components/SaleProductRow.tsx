import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import MinusSignIcon from '@hugeicons/core-free-icons/MinusSignIcon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { ProductWithStock } from "@/types/models";

export interface SaleProductRowProps {
  product: ProductWithStock;
  cartQty: number;
  isLast: boolean;
  onAdd: (product: ProductWithStock) => void;
  onMinus: (productId: string) => void;
  onOpenPicker: (product: ProductWithStock, qty: number) => void;
}

export const SaleProductRow = React.memo(
  function SaleProductRow({
    product,
    cartQty,
    isLast,
    onAdd,
    onMinus,
    onOpenPicker,
  }: SaleProductRowProps) {
    const isOutOfStock = product.currentStock <= 0;
    const isLowStock =
      product.currentStock > 0 &&
      product.currentStock <= (product.reorderLevel || 5);

    return (
      <View
        className={`flex-row items-center justify-between px-4 py-3.5 ${
          !isLast ? "border-b border-bolt-divider" : ""
        } ${cartQty > 0 ? "bg-blue-50/40" : isOutOfStock ? "opacity-50" : ""}`}
      >
        {/* Product Details */}
        <TouchableOpacity
          onPress={() => !isOutOfStock && onAdd(product)}
          activeOpacity={isOutOfStock ? 1 : 0.7}
          className="flex-1 pr-3"
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${formatCurrency(product.sellingPrice)}`}
        >
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-sm text-bolt-graphite leading-snug"
          >
            {product.name}
          </Text>

          <View className="flex-row items-center gap-2 mt-1">
            <Text className="font-poppins-bold text-sm text-bolt-blue">
              {formatCurrency(product.sellingPrice)}
            </Text>
            <Text className="text-bolt-slate text-2xs">•</Text>
            <View
              className={`px-2 py-0.5 rounded-full ${
                isOutOfStock
                  ? "bg-bolt-danger-bg"
                  : isLowStock
                  ? "bg-bolt-warning-bg"
                  : "bg-bolt-success-bg"
              }`}
            >
              <Text
                className={`font-inter-semibold text-2xs ${
                  isOutOfStock
                    ? "text-bolt-danger-text"
                    : isLowStock
                    ? "text-bolt-warning-text"
                    : "text-bolt-success-text"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `${product.currentStock} in stock`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Stepper OR Add Action */}
        {cartQty > 0 ? (
          <View className="flex-row items-center bg-bolt-surface border border-bolt-blue/30 rounded-2xl p-1">
            {/* Left Button: Red Trash if qty is 1, else Minus */}
            <TouchableOpacity
              onPress={() => onMinus(product.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-8 h-8 rounded-xl bg-bolt-card items-center justify-center active:bg-bolt-divider"
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
            >
              <HugeiconsIcon
                icon={cartQty === 1 ? Delete02Icon : MinusSignIcon}
                size={14}
                color={cartQty === 1 ? Colors.danger.text : Colors.graphite}
              />
            </TouchableOpacity>

            {/* Direct Numeric Input Badge (Tap to open picker) */}
            <TouchableOpacity
              onPress={() => onOpenPicker(product, cartQty)}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              className="min-w-[36px] h-8 items-center justify-center px-2 active:bg-bolt-divider rounded-lg"
              accessibilityRole="button"
              accessibilityLabel={`Quantity ${cartQty}. Tap to edit directly.`}
            >
              <Text className="font-poppins-bold text-sm text-bolt-blue text-center">
                {cartQty}
              </Text>
            </TouchableOpacity>

            {/* Right Button: Vibrant Solid Brand Blue Add Button */}
            <TouchableOpacity
              onPress={() => onAdd(product)}
              disabled={cartQty >= product.currentStock}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className={`w-8 h-8 rounded-xl items-center justify-center ${
                cartQty >= product.currentStock
                  ? "bg-bolt-surface opacity-40"
                  : "bg-bolt-blue active:bg-bolt-primary-dark"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => !isOutOfStock && onAdd(product)}
            disabled={isOutOfStock}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`h-9 px-3.5 rounded-xl flex-row items-center gap-1.5 ${
              isOutOfStock
                ? "bg-bolt-surface border border-bolt-border"
                : "bg-bolt-light border border-bolt-blue/30 active:bg-bolt-divider"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to sale`}
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={14}
              color={isOutOfStock ? Colors.slate : Colors.primary}
            />
            <Text
              className={`font-inter-semibold text-xs ${
                isOutOfStock ? "text-bolt-slate" : "text-bolt-blue"
              }`}
            >
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prev, next) => {
    return (
      prev.cartQty === next.cartQty &&
      prev.isLast === next.isLast &&
      prev.product.id === next.product.id &&
      prev.product.currentStock === next.product.currentStock &&
      prev.product.sellingPrice === next.product.sellingPrice &&
      prev.product.name === next.product.name
    );
  }
);
