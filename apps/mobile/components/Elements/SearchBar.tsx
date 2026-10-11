import React, { useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

export interface SearchBarProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leadingIcon?: any;
  trailingAction?: React.ReactNode;
  withShadow?: boolean;
}

/**
 * Standardized Design System Search Bar
 * - 48px tactile touch target (h-12)
 * - Rounded-2xl card token with subtle border
 * - Hugeicons Search01 & Cancel01 with haptic feedback
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  containerClassName = "",
  containerStyle,
  leadingIcon = Search01Icon,
  trailingAction,
  withShadow = true,
  ...inputProps
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View
      className={`flex-row items-center bg-bolt-card border border-bolt-border rounded-2xl px-3.5 h-12 ${containerClassName}`}
      style={[withShadow ? Shadows.card : undefined, containerStyle]}
    >
      {/* Leading Search Icon */}
      <HugeiconsIcon icon={leadingIcon} size={18} color={Colors.slate} />

      {/* Input Field */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.slate}
        className="flex-1 ml-2.5 font-inter-medium text-sm text-bolt-graphite py-0 h-full"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        {...inputProps}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-7 h-7 items-center justify-center rounded-full bg-bolt-divider active:bg-bolt-border mr-0.5"
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} color={Colors.slate} />
        </TouchableOpacity>
      )}

      {/* Optional Trailing Slot (e.g. Barcode scan action) */}
      {trailingAction ? (
        <View className="ml-2 pl-2 border-l border-bolt-border">{trailingAction}</View>
      ) : null}
    </View>
  );
}
