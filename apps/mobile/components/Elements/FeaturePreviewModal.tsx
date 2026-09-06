import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Rocket01Icon from '@hugeicons/core-free-icons/Rocket01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { Colors } from "@/lib/colors";
import { Button } from "./Buton";
import { Shadows } from "@/lib/styles";

interface FeaturePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
}

export default function FeaturePreviewModal({
  visible,
  onClose,
  title,
  subtitle = "Early Access Feature",
  description = "Our team is putting the final touches on this capability. Join the early access priority list to be among the first to get it.",
  badge = "COMING IN V2.0",
}: FeaturePreviewModalProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsJoined(true);
      Toast.show({
        type: "success",
        text1: "Priority Access Confirmed",
        text2: `You're on the list for ${title}!`,
      });
    }, 600);
  };

  const handleClose = () => {
    setIsJoined(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
          {/* Handle bar */}
          <View className="items-center mb-3">
            <View className="w-10 h-1 rounded-full bg-bolt-border" />
          </View>

          {/* Close button top-right */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-bolt-light border border-bolt-blue/20 px-3 py-1 rounded-full">
              <Text className="text-2xs font-inter-bold text-bolt-blue tracking-wider uppercase">
                {badge}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-bolt-surface border border-bolt-border items-center justify-center"
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          {!isJoined ? (
            <View className="items-center py-2">
              {/* Feature Icon container */}
              <View
                className="w-16 h-16 rounded-2xl bg-bolt-light items-center justify-center mb-4"
                style={Shadows.primaryButton}
              >
                <HugeiconsIcon icon={Rocket01Icon} size={30} color={Colors.primary} />
              </View>

              <Text className="text-xl font-poppins-bold text-bolt-graphite text-center mb-1">
                {title}
              </Text>

              <Text className="text-xs font-inter-semibold text-bolt-blue text-center mb-3">
                {subtitle}
              </Text>

              <Text className="text-sm font-inter text-bolt-slate text-center leading-5 mb-6 px-3">
                {description}
              </Text>

              {/* Action Button */}
              <Button
                label={loading ? "Joining..." : "Notify Me on Release"}
                onPress={handleJoinWaitlist}
                loading={loading}
                isChecked={true}
              />
            </View>
          ) : (
            /* Confirmation state */
            <View className="items-center py-4">
              <View className="w-16 h-16 rounded-full bg-bolt-success-bg border border-bolt-success-border items-center justify-center mb-4">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} color={Colors.mint} />
              </View>

              <Text className="text-xl font-poppins-bold text-bolt-graphite text-center mb-2">
                You're on the list!
              </Text>

              <Text className="text-sm font-inter text-bolt-slate text-center leading-5 mb-6 px-4">
                We'll notify your registered email as soon as{" "}
                <Text className="font-inter-semibold text-bolt-graphite">{title}</Text> goes live.
              </Text>

              <Button
                label="Done"
                onPress={handleClose}
                isChecked={true}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
