import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import Login01Icon from '@hugeicons/core-free-icons/Login01Icon';
import HourglassIcon from '@hugeicons/core-free-icons/HourglassIcon';
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  Text,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/lib/colors";

const ICON_MAP: Record<string, any> = {
  "check-circle": CheckmarkCircle02Icon,
  login: Login01Icon,
  "hourglass-empty": HourglassIcon,
};

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  iconName?: any;
  disabled?: boolean;
  loading?: boolean;
  isChecked?: boolean;
}

export function Button({
  label,
  loading,
  onPress,
  iconName,
  disabled,
  isChecked,
}: ButtonProps) {
  const isDisabled = disabled || !isChecked;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.97, { stiffness: 400, damping: 15 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 15 });
  };

  const resolvedIcon =
    typeof iconName === "string" ? ICON_MAP[iconName] || iconName : iconName;

  return (
    <Animated.View style={[animatedStyle, { width: "100%", marginTop: 16 }]}>
      <Pressable
        className={`w-full h-14 rounded-2xl flex-row gap-2 items-center justify-center ${
          isDisabled ? "bg-bolt-disabled" : "bg-bolt-blue"
        }`}
        style={
          isDisabled
            ? { opacity: 0.65 }
            : {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }
        }
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : resolvedIcon ? (
          typeof resolvedIcon === "object" ? (
            <HugeiconsIcon icon={resolvedIcon} size={20} color="white" />
          ) : null
        ) : null}
        <Text className="text-white font-inter-semibold text-base">
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

