import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import FingerPrintIcon from '@hugeicons/core-free-icons/FingerPrintIcon';
import ShieldCheckIcon from '@hugeicons/core-free-icons/ShieldCheckIcon';
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Button } from "./Buton";

interface AppLockPrimerModalProps {
  visible: boolean;
  onEnable: () => Promise<void> | void;
  onDismiss: () => void;
}

export default function AppLockPrimerModal({
  visible,
  onEnable,
  onDismiss,
}: AppLockPrimerModalProps) {
  const [loading, setLoading] = useState(false);

  const handleTurnOn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await onEnable();
    } catch (e) {
      console.error("Failed to enable app lock:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNotNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleNotNow}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 shadow-2xl items-center pb-10">
          {/* Subtle drag/handle bar */}
          <View className="items-center mb-6">
            <View className="w-10 h-1 rounded-full bg-bolt-border" />
          </View>

          {/* Signature Brand Icon Pill */}
          <View className="w-16 h-16 rounded-2xl bg-bolt-light border border-bolt-blue/15 items-center justify-center mb-4">
            <HugeiconsIcon icon={FingerPrintIcon} size={32} color={Colors.primary} />
          </View>

          {/* Clean Merchant Title */}
          <Text className="text-xl font-poppins-bold text-bolt-graphite text-center mb-2">
            Turn On App Lock?
          </Text>

          {/* Human Explanation Subtitle */}
          <Text className="text-sm font-inter text-bolt-slate text-center leading-5 mb-4 px-3">
            Keep your daily sales, profit, and store records private when you step away from your counter.
          </Text>

          {/* Reassurance Card */}
          <View className="w-full bg-bolt-surface border border-bolt-border rounded-2xl p-3.5 flex-row items-center gap-2.5 mb-4">
            <View className="w-8 h-8 rounded-xl bg-bolt-light items-center justify-center">
              <HugeiconsIcon icon={ShieldCheckIcon} size={18} color={Colors.primary} />
            </View>
            <Text className="text-xs font-inter-medium text-bolt-slate flex-1 leading-4">
              Optional privacy feature. You can turn this on or off anytime in Account Settings.
            </Text>
          </View>

          {/* Primary Action Button */}
          <View className="w-full">
            <Button
              label={loading ? "Enabling..." : "Turn On Fingerprint Lock"}
              onPress={handleTurnOn}
              loading={loading}
              iconName={FingerPrintIcon}
              isChecked={true}
            />
          </View>

          {/* Secondary Action */}
          <TouchableOpacity
            onPress={handleNotNow}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            className="py-3 mt-2"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Not Now"
          >
            <Text className="text-sm font-inter-medium text-bolt-slate">
              Not Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
