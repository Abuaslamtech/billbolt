import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { ProductWithStock, Product } from '@/types/models';
import { useAppDataStore } from '@/store/AppDataStore';
import { formatCurrency } from '@/lib/formatters';

import QRCodeSVG from './QRCodeSVG';
import { Shadows } from "@/lib/styles";

interface ProductQrLabelProps {
  product: ProductWithStock | Product;
  size?: 'compact' | 'standard';
}

/**
 * Printable Container / Shelf Sticker Label
 * Designed for standard thermal label printers (e.g. 50x30mm, 50x50mm)
 * or digital sharing via WhatsApp/AirPrint.
 */
const ProductQrLabel = forwardRef<View, ProductQrLabelProps>(
  ({ product, size = 'standard' }, ref) => {
    const { businessInfo } = useAppDataStore();
    const storeName = businessInfo?.name?.trim() || 'STORE INVENTORY';
    const qrString = product.qrCode || '';
    const isCompact = size === 'compact';

    return (
      <View
        ref={ref}
        collapsable={false}
        className={`bg-white rounded-[24px] border border-bolt-border/50 items-center justify-center overflow-hidden ${isCompact ? 'p-4 w-[220px]' : 'p-6 w-[280px]'
          }`}
        style={Shadows.cardElevated}
      >
        {/* Subtle top punch-hole effect for realism */}
        <View className="w-12 h-1.5 bg-bolt-border/30 rounded-full mb-4" />

        {/* Store Header Banner */}
        <Text
          numberOfLines={1}
          className="font-inter-bold text-[9px] text-bolt-slate uppercase tracking-[0.2em] text-center mb-3"
        >
          {storeName}
        </Text>

        <View className="w-full h-[1px] bg-bolt-divider mb-2.5" />

        {/* Product Name */}
        <Text
          numberOfLines={2}
          className="font-poppins-bold text-[15px] text-bolt-graphite text-center leading-tight mb-5 px-2"
        >
          {product.name}
        </Text>

        {/* Crisp Vector QR Code with dashed cutout effect */}
        <View className="p-3 border-2 border-dashed border-bolt-border/60 rounded-[16px] mb-4 items-center justify-center bg-bolt-surface/30">
          <QRCodeSVG value={qrString} size={isCompact ? 120 : 150} quietZone={1} />
        </View>

        {/* Human-Readable SKU / Identifier */}
        <View className="bg-bolt-surface px-4 py-1.5 rounded-full mb-3">
          <Text className="font-poppins-semibold text-[11px] text-bolt-graphite tracking-widest uppercase">
            {qrString}
          </Text>
        </View>

        {/* Subtle Brand Watermark */}
        <Text className="font-inter text-[8px] text-bolt-disabled uppercase tracking-wider">
          Powered by Billbolt
        </Text>
      </View>
    );
  }
);

ProductQrLabel.displayName = 'ProductQrLabel';

export default ProductQrLabel;
