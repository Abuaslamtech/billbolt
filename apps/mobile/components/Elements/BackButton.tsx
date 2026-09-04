import React from "react";
import { TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";

export interface BackButtonProps {
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function BackButton({
  onPress,
  accessibilityLabel = "Go back",
  style,
  className = "w-9 h-9 rounded-xl bg-bolt-divider items-center justify-center mr-3 active:bg-bolt-border",
}: BackButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      try {
        if (router.canGoBack()) {
          router.back();
        }
      } catch {
        // Safe fallback if navigation context is momentarily unavailable
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={className}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
      activeOpacity={0.75}
    >
      <HugeiconsIcon icon={ArrowLeft02Icon} size={18} color={Colors.graphite} />
    </TouchableOpacity>
  );
}

export { BackButton };
