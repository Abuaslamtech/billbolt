import google from "@/assets/images/google.png";
import { Image } from 'expo-image';
import React from "react";
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// types
interface AuthFooterTypes {
  label: string;
  switchPage: string;
  action: string;
  onPress: (event: GestureResponderEvent) => void;
  handleRoute: (event: GestureResponderEvent) => void;
  disabled: boolean;
}

export function AuthFooter({
  label,
  switchPage,
  action,
  onPress,
  handleRoute,
  disabled,
}: AuthFooterTypes) {
  return (
    <>
      {/* Divider */}
      <View className="w-full flex-row items-center my-4">
        <View className="flex-1 h-px bg-bolt-border" />
        <Text className="mx-4 text-bolt-slate font-inter-medium">OR</Text>
        <View className="flex-1 h-px bg-bolt-border" />
      </View>

      {/* Google Sign Up */}
      <TouchableOpacity
        className="w-full h-14 bg-bolt-card border border-bolt-border rounded-full flex flex-row items-center justify-center gap-3 shadow-sm active:bg-bolt-surface"
        onPress={onPress}
        disabled={disabled}
      >
        <Image source={google} contentFit="contain" className="w-8 h-8" />
        <Text className="text-bolt-graphite font-semibold font-inter-medium">
          {label}
        </Text>
      </TouchableOpacity>

      {/* Login Link */}
      <View className="w-full flex items-center mt-4">
        <Text className="text-bolt-slate font-inter-medium">
          {switchPage}
          <Text
            className="font-inter-medium text-bolt-blue font-semibold"
            onPress={handleRoute}
          >
            {action}
          </Text>
        </Text>
      </View>
    </>
  );
}
