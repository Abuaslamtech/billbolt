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
        <Text className="mx-4 text-bolt-slate font-inter-semibold text-xs tracking-wider">OR</Text>
        <View className="flex-1 h-px bg-bolt-border" />
      </View>

      {/* Google Sign Up */}
      <TouchableOpacity
        className="w-full h-14 bg-bolt-card border border-bolt-border rounded-full flex flex-row items-center justify-center gap-3 shadow-sm active:bg-bolt-surface"
        onPress={onPress}
        disabled={disabled}
      >
        <Image source={google} contentFit="contain" className="w-8 h-8" />
        <Text className="text-bolt-graphite font-inter-semibold text-sm">
          {label}
        </Text>
      </TouchableOpacity>

      {/* Switch Page Link */}
      <View className="w-full flex items-center mt-5 py-2">
        <Text className="text-bolt-slate font-inter text-sm">
          {switchPage}
          <Text
            className="font-inter-semibold text-bolt-blue text-sm"
            onPress={handleRoute}
          >
            {action}
          </Text>
        </Text>
      </View>
    </>
  );
}
