import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Message01Icon from "@hugeicons/core-free-icons/Message01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { Colors } from "@/lib/colors";
import { formatCurrency } from "@/store/saleStore";
import { DebtorCustomerSummary } from "@/types/models";
import { useAppDataStore } from "@/store/AppDataStore";

interface SendReminderModalProps {
  visible: boolean;
  debtor: DebtorCustomerSummary | null;
  onClose: () => void;
}

export default function SendReminderModal({
  visible,
  debtor,
  onClose,
}: SendReminderModalProps) {
  const businessInfo = useAppDataStore((state) => state.businessInfo);
  const shopName = businessInfo?.name || "our store";

  if (!debtor) return null;

  // Format Nigerian phone number for WhatsApp (e.g. 08012345678 -> 2348012345678)
  const formatPhoneForWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0") && clean.length === 11) {
      return "234" + clean.slice(1);
    }
    if (clean.startsWith("234")) {
      return clean;
    }
    return clean;
  };

  const formattedBalance = formatCurrency(debtor.remainingBalance);
  const reminderMessage = `Good day ${debtor.customerName}, this is a gentle reminder from ${shopName} regarding your outstanding balance of ${formattedBalance}. Kindly arrange payment at your earliest convenience. Thank you for your continued patronage!`;

  const handleOpenWhatsApp = async () => {
    if (!debtor.customerPhone) {
      Toast.show({
        type: "error",
        text1: "No Phone Number",
        text2: "This debtor has no phone number on file.",
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const targetPhone = formatPhoneForWhatsApp(debtor.customerPhone);
    const encodedText = encodeURIComponent(reminderMessage);
    const url = `whatsapp://send?phone=${targetPhone}&text=${encodedText}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      // Fallback to web WhatsApp or standard SMS
      const webUrl = `https://wa.me/${targetPhone}?text=${encodedText}`;
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
        onClose();
      } else {
        Toast.show({
          type: "error",
          text1: "WhatsApp Not Installed",
          text2: "Could not open WhatsApp on this device.",
        });
      }
    }
  };

  const handleOpenSMS = async () => {
    if (!debtor.customerPhone) {
      Toast.show({
        type: "error",
        text1: "No Phone Number",
        text2: "This debtor has no phone number on file.",
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const encodedText = encodeURIComponent(reminderMessage);
    const url = `sms:${debtor.customerPhone}?body=${encodedText}`;

    try {
      await Linking.openURL(url);
      onClose();
    } catch {
      Toast.show({
        type: "error",
        text1: "SMS Not Available",
        text2: "Could not open messaging app.",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />

        <View className="bg-bolt-card rounded-t-3xl border-t border-bolt-border p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-bolt-divider">
            <View>
              <Text className="font-poppins-bold text-lg text-bolt-graphite">
                Send Payment Reminder
              </Text>
              <Text className="font-inter text-xs text-bolt-slate mt-0.5">
                {debtor.customerName} · {debtor.customerPhone}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-bolt-surface items-center justify-center active:bg-bolt-divider"
              accessibilityRole="button"
              accessibilityLabel="Close reminder modal"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="pt-4">
            {/* Message Preview */}
            <Text className="font-inter-medium text-xs text-bolt-slate mb-1.5">
              Message Preview
            </Text>
            <View className="bg-bolt-surface border border-bolt-border rounded-xl p-3.5 mb-5">
              <Text className="font-inter text-xs text-bolt-graphite leading-relaxed">
                {reminderMessage}
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-2.5 mb-4">
              {/* WhatsApp Button */}
              <TouchableOpacity
                onPress={handleOpenWhatsApp}
                activeOpacity={0.75}
                className="py-3.5 px-4 rounded-2xl bg-bolt-blue active:bg-bolt-primary-dark flex-row items-center justify-center gap-2"
                accessibilityRole="button"
                accessibilityLabel="Send reminder via WhatsApp"
              >
                <HugeiconsIcon icon={Message01Icon} size={18} color={Colors.card} />
                <Text className="font-poppins-semibold text-sm text-bolt-card">
                  Send via WhatsApp
                </Text>
              </TouchableOpacity>

              {/* SMS Button */}
              <TouchableOpacity
                onPress={handleOpenSMS}
                activeOpacity={0.75}
                className="py-3.5 px-4 rounded-2xl bg-bolt-surface border border-bolt-border flex-row items-center justify-center gap-2 active:bg-bolt-divider"
                accessibilityRole="button"
                accessibilityLabel="Send reminder via SMS"
              >
                <Text className="font-inter-semibold text-sm text-bolt-graphite">
                  Send via SMS Text
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
