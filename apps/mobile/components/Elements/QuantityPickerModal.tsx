import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useAppDataStore } from "@/store/AppDataStore";
import { getCurrencySymbol } from "@/lib/formatters";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

export interface QuantityPickerModalProps {
  visible: boolean;
  productName: string;
  currentQty: number;
  maxStock: number;
  unitPrice: number;
  mode?: "sale" | "restock";
  onClose: () => void;
  onConfirm: (newQty: number) => void;
}

export function QuantityPickerModal({
  visible,
  productName,
  currentQty,
  maxStock,
  unitPrice,
  mode = "sale",
  onClose,
  onConfirm,
}: QuantityPickerModalProps) {
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const [qtyString, setQtyString] = useState(String(currentQty));
  const isRestock = mode === "restock";

  useEffect(() => {
    if (visible) {
      setQtyString(String(currentQty));
    }
  }, [visible, currentQty]);

  if (!visible) return null;

  const handleApplyPreset = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const curr = parseInt(qtyString, 10) || 0;
    const next = isRestock ? Math.max(1, curr + delta) : Math.min(maxStock, Math.max(1, curr + delta));
    setQtyString(String(next));
  };

  const handleApplyMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQtyString(String(maxStock));
  };

  const handleSave = () => {
    const parsed = parseInt(qtyString.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Quantity",
        text2: "Please enter a number greater than 0",
      });
      return;
    }

    if (!isRestock && parsed > maxStock) {
      Toast.show({
        type: "error",
        text1: "Exceeds Available Stock",
        text2: `Only ${maxStock} units available in inventory`,
      });
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(parsed);
    onClose();
  };

  const subtotal = (parseInt(qtyString, 10) || 0) * unitPrice;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <TouchableWithoutFeedback>
              <View
                className="w-full max-w-sm bg-bolt-card rounded-3xl p-5 border border-bolt-border"
                style={Shadows.card}
              >
                {/* Header */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-3">
                    <Text
                      numberOfLines={1}
                      className="font-poppins-bold text-base text-bolt-graphite"
                    >
                      {productName}
                    </Text>
                    <Text className="font-inter text-xs text-bolt-slate mt-0.5">
                      {isRestock ? "Current Stock: " : "Available Stock: "}
                      <Text className="font-inter-semibold text-bolt-graphite">
                        {maxStock >= 99999 ? "Unlimited" : `${maxStock} units`}
                      </Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-bolt-divider items-center justify-center"
                    accessibilityRole="button"
                    accessibilityLabel="Close quantity picker"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={15} color={Colors.slate} />
                  </TouchableOpacity>
                </View>

                {/* Big Number Input */}
                <View className="items-center py-4 bg-bolt-surface rounded-2xl border border-bolt-border my-2">
                  <Text className="font-inter text-2xs uppercase tracking-wider text-bolt-slate mb-1">
                    Enter Quantity
                  </Text>
                  <TextInput
                    value={qtyString}
                    onChangeText={setQtyString}
                    keyboardType="number-pad"
                    selectTextOnFocus
                    autoFocus
                    className="font-poppins-bold text-4xl text-bolt-blue text-center w-full py-0"
                  />
                  {subtotal > 0 && (
                    <Text className="font-inter-medium text-xs text-bolt-slate mt-1">
                      {isRestock ? "Restock Spend: " : "Total: "}{currency}{subtotal.toLocaleString("en-NG")}
                    </Text>
                  )}
                </View>

                {/* Fast Presets */}
                <View className="flex-row flex-wrap gap-1.5 my-3 justify-center">
                  {[5, 10, 25, 50].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      onPress={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-xl bg-bolt-surface border border-bolt-border active:bg-bolt-divider"
                    >
                      <Text className="font-inter-semibold text-xs text-bolt-graphite">
                        +{preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {!isRestock && maxStock < 99999 && (
                    <TouchableOpacity
                      onPress={handleApplyMax}
                      className="px-3 py-1.5 rounded-xl bg-bolt-light border border-bolt-blue active:bg-bolt-divider"
                    >
                      <Text className="font-inter-bold text-xs text-bolt-blue">
                        Max ({maxStock})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Save CTA */}
                <TouchableOpacity
                  onPress={handleSave}
                  activeOpacity={0.8}
                  className="w-full h-12 rounded-2xl bg-bolt-blue flex-row items-center justify-center gap-2 mt-2 active:bg-bolt-primary-dark"
                  accessibilityRole="button"
                  accessibilityLabel="Confirm quantity"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color={Colors.card} />
                  <Text className="font-poppins-semibold text-bolt-card text-sm">
                    Set Quantity
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default QuantityPickerModal;
