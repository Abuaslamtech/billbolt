import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import FlashIcon from "@hugeicons/core-free-icons/FlashIcon";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { DebtorCustomerSummary } from "@/types/models";
import { useAppDataStore } from "@/store/AppDataStore";

interface RecordPaymentModalProps {
  visible: boolean;
  debtor: DebtorCustomerSummary | null;
  onClose: () => void;
}

interface RecordPaymentContentProps {
  debtor: DebtorCustomerSummary;
  onClose: () => void;
}

function RecordPaymentContent({ debtor, onClose }: RecordPaymentContentProps) {
  const [amount, setAmount] = useState(
    debtor.remainingBalance > 0 ? String(debtor.remainingBalance) : ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Transfer" | "Card">("Cash");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordRepayment = useAppDataStore((state) => state.recordRepayment);

  const parsedAmount = parseFloat(amount) || 0;
  const newBalance = Math.max(0, debtor.remainingBalance - parsedAmount);

  const handleSubmit = async () => {
    if (parsedAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a payment amount greater than zero.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await recordRepayment({
        customerName: debtor.customerName,
        customerPhone: debtor.customerPhone,
        amount: parsedAmount,
        paymentMethod,
        date: new Date().toISOString().slice(0, 10),
        note: note.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Payment Recorded",
        text2: `Successfully recorded ${formatCurrency(parsedAmount)} from ${debtor.customerName}.`,
      });

      onClose();
    } catch (err: any) {
      console.error("Failed to record repayment:", err);
      Toast.show({
        type: "error",
        text1: "Recording Failed",
        text2: err.message || "Please check your network and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black/60 justify-end"
    >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />

        <View className="bg-bolt-card rounded-t-3xl border-t border-bolt-border p-5 max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-bolt-divider">
            <View>
              <Text className="font-poppins-bold text-lg text-bolt-graphite">
                Record Payment
              </Text>
              <Text className="font-inter text-xs text-bolt-slate mt-0.5">
                {debtor.customerName} · Owes {formatCurrency(debtor.remainingBalance)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-bolt-surface items-center justify-center active:bg-bolt-divider"
              accessibilityRole="button"
              accessibilityLabel="Close payment modal"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="pt-4">
            {/* Amount Input */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-bolt-slate">
                  Amount Paying (₦)
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAmount(String(debtor.remainingBalance));
                  }}
                  className="bg-bolt-light px-2.5 py-1 rounded-lg border border-bolt-blue/20"
                >
                  <Text className="font-inter-bold text-xs text-bolt-blue">
                    Pay Full: {formatCurrency(debtor.remainingBalance)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="bg-bolt-surface border border-bolt-border rounded-xl px-4 h-13 justify-center">
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={Colors.slate}
                  keyboardType="numeric"
                  autoFocus
                  className="font-poppins-bold text-xl text-bolt-graphite py-0"
                />
              </View>
            </View>

            {/* Payment Method Selector */}
            <View className="mb-4">
              <Text className="font-inter-medium text-xs text-bolt-slate mb-1.5">
                Payment Method
              </Text>
              <View className="flex-row gap-2">
                {(["Cash", "Transfer", "Card"] as const).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPaymentMethod(method);
                      }}
                      className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                        isSelected
                          ? "bg-bolt-light border-2 border-bolt-blue"
                          : "bg-bolt-surface border border-bolt-border active:bg-bolt-divider"
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${method}`}
                    >
                      <Text
                        className={`text-xs ${
                          isSelected
                            ? "font-poppins-bold text-bolt-blue"
                            : "font-inter-semibold text-bolt-graphite"
                        }`}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Note input */}
            <View className="mb-4">
              <Text className="font-inter-medium text-xs text-bolt-slate mb-1.5">
                Note (Optional)
              </Text>
              <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-11 justify-center">
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="e.g. Paid part via brother"
                  placeholderTextColor={Colors.slate}
                  className="font-inter text-sm text-bolt-graphite py-0"
                />
              </View>
            </View>

            {/* Balance Remaining Preview */}
            <View className="bg-bolt-surface rounded-xl border border-bolt-border p-3.5 mb-5 flex-row justify-between items-center">
              <Text className="font-inter text-xs text-bolt-slate">Balance After Payment</Text>
              <Text
                className={`font-poppins-bold text-base ${
                  newBalance <= 0 ? "text-bolt-success-text" : "text-bolt-danger-text"
                }`}
              >
                {formatCurrency(newBalance)}
              </Text>
            </View>

            {/* Confirm CTA */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || parsedAmount <= 0}
              className={`py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-4 ${
                parsedAmount > 0 && !isSubmitting
                  ? "bg-bolt-blue active:bg-bolt-primary-dark"
                  : "bg-bolt-disabled"
              }`}
              accessibilityRole="button"
              accessibilityLabel={`Confirm payment of ${formatCurrency(parsedAmount)}`}
            >
              <HugeiconsIcon icon={FlashIcon} size={18} color={Colors.card} />
              <Text className="font-poppins-semibold text-sm text-bolt-card">
                {isSubmitting
                  ? "Recording..."
                  : `Confirm Payment • ${formatCurrency(parsedAmount)}`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
  );
}

export default function RecordPaymentModal({
  visible,
  debtor,
  onClose,
}: RecordPaymentModalProps) {
  if (!visible || !debtor) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <RecordPaymentContent
        key={`${debtor.customerPhone}-${debtor.customerName}-${debtor.remainingBalance}`}
        debtor={debtor}
        onClose={onClose}
      />
    </Modal>
  );
}

