import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Mail02Icon,
  SquareLock02Icon,
  UserIcon,
  Call02Icon,
  Store01Icon,
  Location01Icon,
  Grid02Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/lib/colors";

const ICON_MAP: Record<string, any> = {
  email: Mail02Icon,
  "mail-outline": Mail02Icon,
  mail: Mail02Icon,
  lock: SquareLock02Icon,
  "lock-outline": SquareLock02Icon,
  person: UserIcon,
  "person-outline": UserIcon,
  user: UserIcon,
  phone: Call02Icon,
  "phone-enabled": Call02Icon,
  business: Store01Icon,
  store: Store01Icon,
  "location-on": Location01Icon,
  location: Location01Icon,
  category: Grid02Icon,
};

// types
interface InputFieldProps {
  icon?: any;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isPassword?: boolean;
  showPassword?: boolean;
  togglePassword?: () => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: string;
  onBlur?: (e: any) => void;
}

export function InputField({
  icon,
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  showPassword,
  togglePassword,
  keyboardType,
  autoCapitalize,
  autoComplete,
  onBlur,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const resolvedIcon = typeof icon === "string" ? ICON_MAP[icon] || icon : icon;

  return (
    <View className="w-full">
      <View
        className={`h-14 flex-row items-center px-4 rounded-2xl ${
          isFocused ? "border-2 border-bolt-blue" : "border border-bolt-border"
        }`}
        style={
          isFocused
            ? {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 2,
              }
            : undefined
        }
      >
        {resolvedIcon && (
          <HugeiconsIcon
            icon={resolvedIcon}
            size={20}
            color={isFocused ? Colors.primary : Colors.slate}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholder={placeholder}
          className="flex-1 ml-3 font-inter text-bolt-graphite text-base"
          placeholderTextColor={Colors.slate}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={togglePassword}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <HugeiconsIcon
              icon={showPassword ? ViewIcon : ViewOffSlashIcon}
              size={20}
              color={isFocused ? Colors.primary : Colors.slate}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
