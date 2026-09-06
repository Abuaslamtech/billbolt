import React from "react";
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  icon?: any;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
  icon: Icon = Alert02Icon,
}: ConfirmDialogProps) {
  if (!visible) return null;

  const isDanger = confirmVariant === "danger";

  const handleConfirm = () => {
    Haptics.notificationAsync(
      isDanger
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <TouchableWithoutFeedback>
            <View
              className="w-full max-w-sm bg-bolt-card rounded-3xl p-6 border border-bolt-border items-center"
              style={Shadows.card}
            >
              {/* Icon Badge */}
              <View
                className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${
                  isDanger ? "bg-bolt-danger-bg border border-bolt-danger-border" : "bg-bolt-light"
                }`}
              >
                <HugeiconsIcon
                  icon={Icon}
                  size={26}
                  color={isDanger ? Colors.danger.text : Colors.primary}
                />
              </View>

              {/* Title & Message */}
              <Text className="font-poppins-bold text-base text-bolt-graphite text-center">
                {title}
              </Text>
              <Text className="font-inter text-xs text-bolt-slate text-center mt-2 leading-5 px-2">
                {message}
              </Text>

              {/* Actions */}
              <View className="w-full gap-2.5 mt-6">
                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  className={`w-full h-12 rounded-2xl items-center justify-center ${
                    isDanger ? "bg-bolt-red" : "bg-bolt-blue"
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={confirmText}
                >
                  <Text className="font-poppins-semibold text-bolt-card text-sm">
                    {confirmText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  className="w-full h-11 rounded-2xl bg-bolt-surface border border-bolt-border items-center justify-center"
                  accessibilityRole="button"
                  accessibilityLabel={cancelText}
                >
                  <Text className="font-inter-semibold text-bolt-graphite text-xs">
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default ConfirmDialog;
