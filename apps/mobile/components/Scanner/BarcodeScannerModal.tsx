import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  FlashIcon,
  FlashOffIcon,
  QrCode01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Camera01Icon,
} from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useAppDataStore } from '@/store/AppDataStore';
import { ProductWithStock } from '@/types/models';
import { Colors } from '@/lib/colors';
import { formatCurrency } from '@/lib/formatters';
import { getProductInitials } from '@/lib/qr/qrGenerator';
import { Shadows } from "@/lib/styles";

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProductScanned: (product: ProductWithStock) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_BOX_SIZE = Math.min(SCREEN_WIDTH * 0.72, 260);

export default function BarcodeScannerModal({
  visible,
  onClose,
  onProductScanned,
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [scannedRecently, setScannedRecently] = useState(false);
  const [lastScannedProduct, setLastScannedProduct] = useState<ProductWithStock | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { products } = useAppDataStore();

  // Subtle reticle breathing pulse
  const reticlePulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setScannedRecently(false);
      setLastScannedProduct(null);
      setErrorMessage(null);
      setTorchOn(false);

      reticlePulse.value = withRepeat(
        withTiming(1.03, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedReticleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reticlePulse.value }],
  }));

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scannedRecently) return;

    const scannedData = (result.data || '').trim();
    if (!scannedData) return;

    setScannedRecently(true);

    // Look up product in local store by id (legacy fallback), qrCode (e.g. BB-SG-4821), or barcode
    let matchedProduct = products.find(
      (p) =>
        p.id === scannedData ||
        (p.qrCode && p.qrCode.toLowerCase() === scannedData.toLowerCase()) ||
        ((p as any).barcode && (p as any).barcode.toLowerCase() === scannedData.toLowerCase())
    );

    // Fallback: If no direct match, check if it's an unsaved legacy generated SKU (e.g. BB-INI-1234)
    if (!matchedProduct && /^BB\-[A-Z]{1,3}\-\d{4}$/i.test(scannedData)) {
      const parts = scannedData.split('-');
      if (parts.length === 3) {
        const scannedInitials = parts[1].toUpperCase();
        // Find products whose initials match the scanned initials
        const potentialMatches = products.filter(
          (p) => getProductInitials(p.name).toUpperCase() === scannedInitials
        );
        // If there's exactly one match (or we just optimistically pick the first one)
        if (potentialMatches.length > 0) {
          matchedProduct = potentialMatches[0];
        }
      }
    }

    if (matchedProduct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLastScannedProduct(matchedProduct);
      setErrorMessage(null);

      // Trigger the callback to add item to sale
      onProductScanned(matchedProduct);

      // Auto-reset scan lockout after 1.8s for continuous scanning
      setTimeout(() => {
        setScannedRecently(false);
      }, 1800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setErrorMessage(`Code "${scannedData}" not in inventory.`);
      setLastScannedProduct(null);

      // Allow retry after 2.2s
      setTimeout(() => {
        setScannedRecently(false);
        setErrorMessage(null);
      }, 2200);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} translucent={false} />

      {!permission ? (
        <SafeAreaView className="flex-1 bg-bolt-surface items-center justify-center">
          <Text className="font-inter-medium text-sm text-bolt-slate">
            Checking camera access...
          </Text>
        </SafeAreaView>
      ) : !permission.granted ? (
        <SafeAreaView className="flex-1 bg-bolt-surface justify-between">
          {/* Header */}
          <View className="px-5 pt-3 items-start">
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close camera setup"
              className="w-10 h-10 rounded-full bg-bolt-card border border-bolt-border items-center justify-center shadow-sm"
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.graphite} />
            </TouchableOpacity>
          </View>

          {/* Centered Permission Card */}
          <View className="px-6">
            <View
              className="bg-bolt-card border border-bolt-border rounded-3xl p-6 items-center"
              style={Shadows.card}
            >
              <View className="w-16 h-16 rounded-2xl bg-bolt-light items-center justify-center mb-4">
                <HugeiconsIcon icon={Camera01Icon} size={30} color={Colors.primary} />
              </View>

              <Text className="font-poppins-bold text-xl text-bolt-graphite text-center mb-2">
                Enable Camera Access
              </Text>

              <Text className="font-inter text-sm text-bolt-slate text-center leading-relaxed mb-6 px-2">
                Scan product barcodes and container QR codes for instant counter checkout.
              </Text>

              <TouchableOpacity
                onPress={requestPermission}
                accessibilityRole="button"
                accessibilityLabel="Grant camera access"
                className="w-full bg-bolt-blue py-4 rounded-2xl items-center active:bg-bolt-primary-dark"
                style={Shadows.primaryButton}
              >
                <Text className="font-inter-bold text-white text-base">
                  Grant Camera Access
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom dismissal */}
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Not now"
            className="items-center py-4"
            activeOpacity={0.7}
          >
            <Text className="font-inter-medium text-sm text-bolt-slate">
              Not Now
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <View className="flex-1 bg-bolt-graphite">
          {/* Live Full-bleed Camera Feed */}
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torchOn}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'ean13',
                'ean8',
                'code128',
                'code39',
                'upc_a',
                'upc_e',
              ],
            }}
            onBarcodeScanned={scannedRecently ? undefined : handleBarcodeScanned}
          />

          {/* ── 1. Top Header Bar (Clean Billbolt Surface) ─────────────────── */}
          <SafeAreaView edges={['top']} className="bg-bolt-card border-b border-bolt-border">
            <View className="flex-row items-center justify-between px-4 py-3">
              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close scanner"
                className="w-10 h-10 rounded-full bg-bolt-surface border border-bolt-border items-center justify-center active:bg-bolt-divider"
                activeOpacity={0.75}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.graphite} />
              </TouchableOpacity>

              {/* Header Title & Subtitle */}
              <View className="items-center">
                <Text className="font-poppins-semibold text-base text-bolt-graphite">
                  Scan Product
                </Text>
                <Text className="font-inter text-xs text-bolt-slate">
                  Point at label or barcode
                </Text>
              </View>

              {/* Torch / Flash Toggle */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTorchOn(!torchOn);
                }}
                accessibilityRole="button"
                accessibilityLabel={torchOn ? 'Turn off flash' : 'Turn on flash'}
                className={`w-10 h-10 rounded-full border items-center justify-center ${
                  torchOn
                    ? 'bg-bolt-light border-bolt-blue'
                    : 'bg-bolt-surface border-bolt-border active:bg-bolt-divider'
                }`}
                activeOpacity={0.75}
              >
                <HugeiconsIcon
                  icon={torchOn ? FlashOffIcon : FlashIcon}
                  size={18}
                  color={torchOn ? Colors.primary : Colors.slate}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* ── 2. Viewfinder Zone ─────────────────────────────────────────── */}
          <View className="flex-1 items-center justify-center">
            {/* Soft Reticle Viewfinder */}
            <Animated.View
              style={[
                {
                  width: SCAN_BOX_SIZE,
                  height: SCAN_BOX_SIZE,
                },
                animatedReticleStyle,
              ]}
              className="rounded-3xl border-2 border-white/90 relative items-center justify-center"
            >
              {/* Corner Accents: Smooth Blue L-Guides */}
              <View className="absolute w-7 h-7 -top-0.5 -left-0.5 border-t-3 border-l-3 rounded-tl-2xl border-bolt-blue" />
              <View className="absolute w-7 h-7 -top-0.5 -right-0.5 border-t-3 border-r-3 rounded-tr-2xl border-bolt-blue" />
              <View className="absolute w-7 h-7 -bottom-0.5 -left-0.5 border-b-3 border-l-3 rounded-bl-2xl border-bolt-blue" />
              <View className="absolute w-7 h-7 -bottom-0.5 -right-0.5 border-b-3 border-r-3 rounded-br-2xl border-bolt-blue" />
            </Animated.View>

            {/* Instruction Pill */}
            <View className="mt-5 bg-bolt-graphite/75 px-4 py-1.5 rounded-full border border-white/10">
              <Text className="font-inter-medium text-xs text-white">
                Hold code steady inside frame
              </Text>
            </View>
          </View>

          {/* ── 3. Bottom Card (Billbolt Card Surface) ────────────────────── */}
          <SafeAreaView edges={['bottom']} className="bg-bolt-card rounded-t-3xl border-t border-bolt-border shadow-2xl px-5 pt-4 pb-5">
            {/* Dynamic Status / Feedback Row */}
            {lastScannedProduct ? (
              /* Success State: Item Added */
              <View className="flex-row items-center gap-3 bg-bolt-success-bg border border-bolt-success-border px-3.5 py-3 rounded-2xl">
                <View className="w-10 h-10 rounded-xl bg-bolt-mint/20 items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} color={Colors.mint} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="font-poppins-bold text-sm text-bolt-graphite pr-2 flex-1"
                      numberOfLines={1}
                    >
                      {lastScannedProduct.name}
                    </Text>
                    <Text className="font-poppins-bold text-sm text-bolt-blue">
                      {formatCurrency(lastScannedProduct.sellingPrice)}
                    </Text>
                  </View>
                  <Text className="font-inter-medium text-xs text-bolt-success-text mt-0.5">
                    Added to sale • Ready for next scan
                  </Text>
                </View>
              </View>
            ) : errorMessage ? (
              /* Warning State: Not Found */
              <View className="flex-row items-center gap-3 bg-bolt-warning-bg border border-bolt-warning-border px-3.5 py-3 rounded-2xl">
                <View className="w-10 h-10 rounded-xl bg-bolt-warning-text/15 items-center justify-center">
                  <HugeiconsIcon icon={AlertCircleIcon} size={20} color={Colors.warning.text} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-xs text-bolt-warning-text" numberOfLines={2}>
                    {errorMessage}
                  </Text>
                </View>
              </View>
            ) : (
              /* Idle Ready State */
              <View className="flex-row items-center gap-3 bg-bolt-surface border border-bolt-divider px-3.5 py-3 rounded-2xl">
                <View className="w-10 h-10 rounded-xl bg-bolt-light items-center justify-center">
                  <HugeiconsIcon icon={QrCode01Icon} size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-xs text-bolt-graphite">
                    POS Scanner Ready
                  </Text>
                  <Text className="font-inter text-2xs text-bolt-slate mt-0.5">
                    Items will be added to cart as soon as scanned
                  </Text>
                </View>
              </View>
            )}

            {/* Primary Action Button (Brand Blue) */}
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Done scanning"
              className="w-full bg-bolt-blue h-14 rounded-2xl items-center justify-center active:bg-bolt-primary-dark mt-3"
              style={Shadows.primaryButton}
            >
              <Text className="font-poppins-semibold text-white text-base">
                Done Scanning
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}
    </Modal>
  );
}
