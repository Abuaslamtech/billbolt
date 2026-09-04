import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  PackageReceiveIcon,
  Tick01Icon,
  PrinterIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { useAppDataStore } from '@/store/AppDataStore';
import { getCurrencySymbol } from '@/lib/formatters';
import { Colors } from '@/lib/colors';
import { ProductWithStock } from '@/types/models';
import ProductQrLabel from '@/components/QR/ProductQrLabel';
import { Shadows } from "@/lib/styles";

interface LogRestockModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProductId?: string;
}

export default function LogRestockModal({
  visible,
  onClose,
  selectedProductId,
}: LogRestockModalProps) {
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const { products, logNewRestock } = useAppDataStore();

  const [productId, setProductId] = useState(selectedProductId || '');
  const [qty, setQty] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Success state holding restocked product to preview & print fresh stickers
  const [restockedProduct, setRestockedProduct] = useState<ProductWithStock | null>(null);
  const [restockedQty, setRestockedQty] = useState<number>(0);
  const labelRef = useRef<View>(null);

  useEffect(() => {
    if (selectedProductId) {
      setProductId(selectedProductId);
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        setCostPerUnit(product.costPrice.toString());
      }
    }
  }, [selectedProductId, products]);

  const resetForm = () => {
    setProductId(selectedProductId || '');
    setQty('');
    setCostPerUnit('');
    setNotes('');
    setRestockedProduct(null);
    setRestockedQty(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!productId) {
      Toast.show({ type: 'error', text1: 'Please select a product' });
      return;
    }
    const quantity = parseInt(qty, 10);
    const unitCost = parseFloat(costPerUnit);

    if (isNaN(quantity) || quantity <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid quantity' });
      return;
    }
    if (isNaN(unitCost) || unitCost < 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid cost per unit' });
      return;
    }

    const matched = products.find((p) => p.id === productId);

    try {
      setIsSubmitting(true);
      await logNewRestock({
        productId,
        qty: quantity,
        costPerUnit: unitCost,
        notes: notes.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Restock Logged',
        text2: `Successfully added ${quantity} units to inventory`,
      });

      if (matched) {
        setRestockedProduct(matched);
        setRestockedQty(quantity);
      } else {
        handleClose();
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to log restock', text2: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareAndPrint = async () => {
    if (isExporting || !labelRef.current || !restockedProduct) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExporting(true);

    try {
      const uri = await captureRef(labelRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: 'info',
          text1: 'Sharing Not Supported',
          text2: 'Image sharing is not supported on this platform.',
        });
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `${restockedProduct.name} QR Label (Restock Batch)`,
        UTI: 'public.png',
      });
    } catch (err: any) {
      console.error('[LogRestockModal] Share error:', err);
      Toast.show({
        type: 'error',
        text1: 'Could not export label',
        text2: 'Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === productId);
  const totalCost = (parseInt(qty, 10) || 0) * (parseFloat(costPerUnit) || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%] border-t border-bolt-light">
          {/* Header */}
          <View className="flex-row justify-between items-center pb-4 border-b border-bolt-divider">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  restockedProduct ? 'bg-bolt-success-bg' : 'bg-bolt-light'
                }`}
              >
                <HugeiconsIcon
                  icon={restockedProduct ? CheckmarkCircle02Icon : PackageReceiveIcon}
                  size={22}
                  color={restockedProduct ? Colors.success.text : Colors.primary}
                />
              </View>
              <View>
                <Text className="font-poppins-bold text-xl text-bolt-graphite">
                  {restockedProduct ? 'Restock Complete!' : 'Log Product Restock'}
                </Text>
                <Text className="font-inter text-xs text-bolt-slate">
                  {restockedProduct
                    ? `Print labels for ${restockedQty} newly added units`
                    : 'Add incoming inventory stock'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close restock modal"
              className="w-8 h-8 rounded-full bg-bolt-divider items-center justify-center"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          {/* Conditional Body */}
          {restockedProduct ? (
            /* ── STATE B: Success & Print Labels ── */
            <View className="py-4 items-center">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ alignItems: 'center', paddingVertical: 12 }}
              >
                <ProductQrLabel ref={labelRef} product={restockedProduct} size="standard" />
              </ScrollView>

              <View className="flex-row items-center gap-2.5 pt-3 border-t border-bolt-divider w-full">
                {/* Primary Hero: Print Container Labels (Bigger in width) */}
                <TouchableOpacity
                  onPress={handleShareAndPrint}
                  disabled={isExporting}
                  accessibilityRole="button"
                  accessibilityLabel="Print batch container stickers"
                  className="flex-1 bg-bolt-blue h-14 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-bolt-primary-dark"
                  style={Shadows.primaryButton}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color={Colors.card} />
                  ) : (
                    <>
                      <HugeiconsIcon icon={PrinterIcon} size={18} color={Colors.card} />
                      <Text className="font-poppins-semibold text-white text-sm">
                        Print Labels
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Companion: Done */}
                <TouchableOpacity
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel="Done and close"
                  className="w-20 h-14 bg-bolt-surface border border-bolt-border rounded-2xl items-center justify-center active:bg-bolt-divider"
                >
                  <Text className="font-inter-semibold text-bolt-graphite text-sm">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── STATE A: Restock Form ── */
            <ScrollView showsVerticalScrollIndicator={false} className="py-4">
              {/* Product Selector */}
              <View className="mb-4">
                <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">Product *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-2"
                >
                  {products.map((p) => {
                    const isSelected = p.id === productId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setProductId(p.id);
                          setCostPerUnit(p.costPrice.toString());
                        }}
                        className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border mr-1.5 ${
                          isSelected
                            ? 'bg-bolt-blue border-bolt-blue'
                            : 'bg-bolt-surface border-bolt-border'
                        }`}
                      >
                        {isSelected && <HugeiconsIcon icon={Tick01Icon} size={12} color="#FFFFFF" />}
                        <Text
                          className={`font-inter-medium text-xs ${
                            isSelected ? 'text-white' : 'text-bolt-graphite'
                          }`}
                        >
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Quantity and Cost per Unit */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">
                    Units Restocked *
                  </Text>
                  <TextInput
                    value={qty}
                    onChangeText={setQty}
                    placeholder="e.g. 20"
                    placeholderTextColor={Colors.slate}
                    keyboardType="numeric"
                    className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">
                    Unit Cost ({currency}) *
                  </Text>
                  <TextInput
                    value={costPerUnit}
                    onChangeText={setCostPerUnit}
                    placeholder="e.g. 1600"
                    placeholderTextColor={Colors.slate}
                    keyboardType="numeric"
                    className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">
                  Batch / Supplier Note (Optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Main supplier delivery"
                  placeholderTextColor={Colors.slate}
                  className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
                />
              </View>

              {/* Restock Spend Summary */}
              <View className="bg-bolt-surface p-4 rounded-2xl border border-bolt-border mb-6 flex-row justify-between items-center">
                <Text className="font-inter-medium text-bolt-slate text-sm">Total Restock Spend:</Text>
                <Text className="font-poppins-bold text-bolt-graphite text-xl">
                  {currency}{(totalCost ?? 0).toLocaleString()}
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className={`bg-bolt-blue rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-sm ${
                  isSubmitting ? 'opacity-70' : 'active:scale-98'
                }`}
              >
                <HugeiconsIcon icon={PackageReceiveIcon} size={20} color="#FFFFFF" />
                <Text className="font-poppins-semibold text-white text-base">
                  {isSubmitting ? 'Saving Restock...' : 'Confirm Restock'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
