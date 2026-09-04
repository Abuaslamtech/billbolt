import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  Share01Icon,
  Download01Icon,
} from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { ProductWithStock, Product } from '@/types/models';
import { Colors } from '@/lib/colors';
import ProductQrLabel from './ProductQrLabel';
import { generateProductLabelPdf } from '@/lib/qr/qrPdfGenerator';
import { Shadows } from "@/lib/styles";

interface ProductQrLabelModalProps {
  visible: boolean;
  product: ProductWithStock | Product | null;
  onClose: () => void;
}

export default function ProductQrLabelModal({
  visible,
  product,
  onClose,
}: ProductQrLabelModalProps) {
  const labelRef = useRef<View>(null);
  const [activeAction, setActiveAction] = useState<'download' | 'share' | null>(null);

  if (!visible || !product) return null;

  const handleExportPdf = async (mode: 'download' | 'share') => {
    if (activeAction) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveAction(mode);

    try {
      const pdfUri = await generateProductLabelPdf(product);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: 'info',
          text1: 'Sharing Not Supported',
          text2: 'File sharing is not supported on this platform.',
        });
        return;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle:
          mode === 'download'
            ? `Save ${product.name} Sticker PDF`
            : `Share ${product.name} Sticker PDF`,
        UTI: 'com.adobe.pdf',
      });

      Toast.show({
        type: 'success',
        text1: mode === 'download' ? 'Sticker PDF Ready' : 'Sticker Shared',
        text2: `${product.name} vector PDF ready for printing`,
      });
    } catch (err: any) {
      console.error('[ProductQrLabelModal] PDF error:', err);
      Toast.show({
        type: 'error',
        text1: 'PDF Generation Failed',
        text2: 'Could not export vector label PDF.',
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-bolt-card rounded-t-3xl p-6 max-h-[90%] border-t border-bolt-light">
          {/* Header */}
          <View className="flex-row justify-between items-center pb-3 border-b border-bolt-divider">
            <View>
              <Text className="font-poppins-bold text-lg text-bolt-graphite">
                Product QR Label
              </Text>
              <Text className="font-inter text-xs text-bolt-slate">
                Vector sticker label ready for thermal printing
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close label preview"
              className="w-8 h-8 rounded-full bg-bolt-divider items-center justify-center active:scale-95"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          {/* Label Preview Card */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 18 }}
          >
            <ProductQrLabel ref={labelRef} product={product} size="standard" />
          </ScrollView>

          {/* Action CTAs: Exactly 2 Vector PDF Actions (Download PDF & Share PDF) */}
          <View className="flex-row items-center gap-2.5 pt-3 border-t border-bolt-divider">
            {/* Primary Action: Download PDF */}
            <TouchableOpacity
              onPress={() => handleExportPdf('download')}
              disabled={!!activeAction}
              accessibilityRole="button"
              accessibilityLabel="Download label as PDF"
              className="flex-1 bg-bolt-blue h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-bolt-primary-dark"
              style={Shadows.primaryButton}
            >
              {activeAction === 'download' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <HugeiconsIcon icon={Download01Icon} size={18} color="#FFFFFF" />
                  <Text className="font-poppins-semibold text-white text-sm">
                    Download PDF
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Secondary Action: Share PDF */}
            <TouchableOpacity
              onPress={() => handleExportPdf('share')}
              disabled={!!activeAction}
              accessibilityRole="button"
              accessibilityLabel="Share label as PDF"
              className="flex-1 bg-bolt-card border border-bolt-border h-14 rounded-2xl flex-row items-center justify-center gap-2 active:bg-bolt-divider"
            >
              {activeAction === 'share' ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <HugeiconsIcon icon={Share01Icon} size={18} color={Colors.graphite} />
                  <Text className="font-inter-semibold text-bolt-graphite text-sm">
                    Share PDF
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
