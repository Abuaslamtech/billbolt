import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import Login01Icon from "@hugeicons/core-free-icons/Login01Icon";
import HourglassIcon from "@hugeicons/core-free-icons/HourglassIcon";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

const ICON_MAP: Record<string, any> = {
  "check-circle": CheckmarkCircle02Icon,
  login: Login01Icon,
  "hourglass-empty": HourglassIcon,
};

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  label?: string;
  children?: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: any;
  iconName?: any; // Backward compatibility with legacy Buton.tsx
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  isChecked?: boolean; // Backward compatibility
  fullWidth?: boolean;
  haptic?: boolean;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Standard Design System Button Component
 * - Tactile spring-physics press compression (Emil Kowalski doctrine)
 * - Variants: primary, secondary, outline, ghost, danger
 * - Sizes: sm (36px), md (48px), lg (56px)
 * - Flexible layout: inline, flex-1 in action bars, or full-width
 */
export function Button({
  label,
  children,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconName,
  iconPosition = "left",
  disabled,
  loading,
  isChecked,
  fullWidth,
  haptic = true,
  className = "",
  textClassName = "",
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || Boolean(loading) || isChecked === false;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.set(withSpring(0.97, { stiffness: 450, damping: 18 }));
    }
  };

  const handlePressOut = () => {
    scale.set(withSpring(1, { stiffness: 450, damping: 18 }));
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(e);
  };

  // Resolve legacy iconName or modern icon prop
  const resolvedIcon =
    icon ||
    (typeof iconName === "string" ? ICON_MAP[iconName] || iconName : iconName);

  // Size styling tokens
  const sizeStyles = {
    sm: {
      container: "h-9 px-3 rounded-xl gap-1.5",
      text: "text-xs font-inter-semibold",
      iconSize: 16,
    },
    md: {
      container: "h-12 px-4 rounded-2xl gap-2",
      text: "text-sm font-inter-semibold",
      iconSize: 18,
    },
    lg: {
      container: "h-14 px-4 rounded-2xl gap-2",
      text: "text-base font-inter-semibold",
      iconSize: 20,
    },
  }[size];

  // Variant styling tokens
  const variantStyles = {
    primary: {
      container: isDisabled ? "bg-bolt-disabled" : "bg-bolt-blue active:bg-bolt-primary-dark",
      text: "text-white",
      shadow: isDisabled ? undefined : Shadows.primaryButton,
      iconColor: "#FFFFFF",
      spinnerColor: "#FFFFFF",
    },
    secondary: {
      container: isDisabled
        ? "bg-bolt-surface border border-bolt-border opacity-50"
        : "bg-bolt-card border border-bolt-border active:bg-bolt-divider",
      text: "text-bolt-graphite",
      shadow: isDisabled ? undefined : Shadows.card,
      iconColor: Colors.primary,
      spinnerColor: Colors.primary,
    },
    outline: {
      container: isDisabled
        ? "bg-transparent border border-bolt-border opacity-40"
        : "bg-transparent border border-bolt-border active:bg-bolt-divider",
      text: "text-bolt-graphite",
      shadow: undefined,
      iconColor: Colors.slate,
      spinnerColor: Colors.slate,
    },
    ghost: {
      container: isDisabled ? "bg-transparent opacity-40" : "bg-transparent active:bg-bolt-light",
      text: "text-bolt-blue",
      shadow: undefined,
      iconColor: Colors.primary,
      spinnerColor: Colors.primary,
    },
    danger: {
      container: isDisabled ? "bg-red-300" : "bg-red-600 active:bg-red-700",
      text: "text-white",
      shadow: undefined,
      iconColor: "#FFFFFF",
      spinnerColor: "#FFFFFF",
    },
  }[variant];

  const renderIcon = () => {
    if (!resolvedIcon) return null;
    if (typeof resolvedIcon === "object") {
      return (
        <HugeiconsIcon
          icon={resolvedIcon}
          size={sizeStyles.iconSize}
          color={variantStyles.iconColor}
        />
      );
    }
    return null;
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth ? { width: "100%" } : undefined,
      ]}
      className={fullWidth ? "w-full" : undefined}
    >
      <Pressable
        className={`flex-row items-center justify-center ${sizeStyles.container} ${variantStyles.container} ${className}`}
        style={[variantStyles.shadow, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (typeof label === "string" ? label : undefined)}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyles.spinnerColor} />
        ) : (
          <>
            {iconPosition === "left" && renderIcon()}
            {label ? (
              <Text
                className={`${sizeStyles.text} ${variantStyles.text} ${textClassName}`}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {label}
              </Text>
            ) : (
              children
            )}
            {iconPosition === "right" && renderIcon()}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default Button;
