import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Notification03Icon from '@hugeicons/core-free-icons/Notification03Icon';
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Button } from "./Buton";
import { requestPermission } from "@/config/firebase";

interface NotificationPrimerModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function NotificationPrimerModal({
  visible,
  onComplete,
}: NotificationPrimerModalProps) {
  const [loading, setLoading] = useState(false);

  const handleTurnOn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await requestPermission();
    } catch (e) {
      console.error("Failed to request permission:", e);
    } finally {
      setLoading(false);
      onComplete();
    }
  };

  const handleNotNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleNotNow}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 shadow-2xl items-center pb-10">
          {/* Handle bar */}
          <View className="items-center mb-6">
            <View className="w-10 h-1 rounded-full bg-bolt-border" />
          </View>

          {/* Icon Pill */}
          <View className="w-16 h-16 rounded-2xl bg-bolt-light items-center justify-center mb-4">
            <HugeiconsIcon icon={Notification03Icon} size={28} color={Colors.primary} />
          </View>

          {/* Clean 2-word Title */}
          <Text className="text-xl font-poppins-bold text-bolt-graphite text-center mb-2">
            Enable Notifications?
          </Text>

          {/* Ultra-lean 1-line Subtitle */}
          <Text className="text-sm font-inter text-bolt-slate text-center leading-5 mb-6 px-4">
            Get instant alerts for sales, low stock, and daily store summaries.
          </Text>

          {/* Primary Action */}
          <View className="w-full mb-3">
            <Button
              label={loading ? "Enabling..." : "Turn On"}
              onPress={handleTurnOn}
              loading={loading}
              isChecked={true}
            />
          </View>

          {/* Secondary Action */}
          <TouchableOpacity
            onPress={handleNotNow}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            className="py-2"
            activeOpacity={0.7}
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
