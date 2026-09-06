import { HugeiconsIcon } from "@hugeicons/react-native";
import Mail02Icon from '@hugeicons/core-free-icons/Mail02Icon';
import SquareLock02Icon from '@hugeicons/core-free-icons/SquareLock02Icon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import Call02Icon from '@hugeicons/core-free-icons/Call02Icon';
import Store01Icon from '@hugeicons/core-free-icons/Store01Icon';
import Location01Icon from '@hugeicons/core-free-icons/Location01Icon';
import Grid02Icon from '@hugeicons/core-free-icons/Grid02Icon';
import ViewIcon from '@hugeicons/core-free-icons/ViewIcon';
import ViewOffSlashIcon from '@hugeicons/core-free-icons/ViewOffSlashIcon';
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  Platform,
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

// Android ReactTextInputManager AUTOFILL_HINTS_MAP compatibility
const AUTOCOMPLETE_MAP: Record<string, any> = {
  email: "email",
  "email-address": "email",
  password: "password",
  "current-password": "password",
  "new-password": "password-new",
  "password-new": "password-new",
  username: "username",
  name: "name",
  "full-name": "name",
  tel: "tel",
  phone: "tel",
  off: "off",
};

const TEXT_CONTENT_TYPE_MAP: Record<string, any> = {
  email: "emailAddress",
  "email-address": "emailAddress",
  password: "password",
  "current-password": "password",
  "new-password": "newPassword",
  "password-new": "newPassword",
  username: "username",
  name: "name",
  tel: "telephoneNumber",
  phone: "telephoneNumber",
  off: "none",
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
  textContentType?: any;
  importantForAutofill?: "auto" | "no" | "noExcludeDescendants" | "yes" | "yesExcludeDescendants";
  onBlur?: (e: any) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  blurOnSubmit?: boolean;
  autoFocus?: boolean;
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
  textContentType,
  importantForAutofill,
  onBlur,
  onSubmitEditing,
  returnKeyType,
  blurOnSubmit,
  autoFocus,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const resolvedIcon = typeof icon === "string" ? ICON_MAP[icon] || icon : icon;

  const resolvedAutoComplete = autoComplete ? (AUTOCOMPLETE_MAP[autoComplete] || autoComplete) : undefined;
  const resolvedTextContentType = textContentType || (autoComplete ? TEXT_CONTENT_TYPE_MAP[autoComplete] : undefined);
  const resolvedImportantForAutofill = importantForAutofill || (autoComplete && autoComplete !== "off" ? "yes" : undefined);

  return (
    <View className="w-full">
      <View
        className={`h-14 flex-row items-center px-4 rounded-2xl border-2 ${
          isFocused ? "border-bolt-blue" : "border-bolt-border"
        }`}
        style={
          isFocused && Platform.OS === "ios"
            ? {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
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
          className="flex-1 ml-3 font-inter text-bolt-graphite text-base bg-transparent"
          placeholderTextColor={Colors.slate}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={resolvedAutoComplete}
          textContentType={resolvedTextContentType}
          importantForAutofill={resolvedImportantForAutofill}
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
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
