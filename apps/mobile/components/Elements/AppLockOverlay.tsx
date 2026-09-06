import React from "react";
import {
Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { HugeiconsIcon } from "@hugeicons/react-native";
import FingerPrintIcon from '@hugeicons/core-free-icons/FingerPrintIcon';
import AlertCircleIcon from '@hugeicons/core-free-icons/AlertCircleIcon';
import LockPasswordIcon from '@hugeicons/core-free-icons/LockPasswordIcon';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import logo from "@/assets/images/icon.png";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

import { Image } from 'expo-image';
interface AppLockOverlayProps {
  onUnlock: () => void;
  onUsePassword?: () => void;
  isAuthenticating?: boolean;
  errorMessage?: string | null;
}

export default function AppLockOverlay({
  onUnlock,
  onUsePassword,
  isAuthenticating = false,
  errorMessage,
}: AppLockOverlayProps) {
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.97, { stiffness: 400, damping: 15 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { stiffness: 400, damping: 15 });
  };

  const handleUnlockPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUnlock();
  };

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface items-center justify-between px-6 py-12">
      <StatusBar style="dark" />

      {/* Top spacer for optical balance */}
      <View className="h-4" />

      {/* Center Branding & Lock Status */}
      <View className="items-center w-full max-w-[320px]">
        {/* Logo Container with Soft Shadow */}
        <View
          className="w-20 h-20 rounded-3xl overflow-hidden shadow-md mb-6"
          style={Shadows.primaryButton}
        >
          <Image
            source={logo}
            className="w-full h-full"
            contentFit="contain"
          />
        </View>

        {/* Lock Status Pill */}
        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-bolt-light border border-bolt-blue/15 mb-3">
          <HugeiconsIcon icon={LockPasswordIcon} size={14} color={Colors.primary} />
          <Text className="text-2xs font-inter-semibold text-bolt-blue uppercase tracking-widest">
            Privacy Locked
          </Text>
        </View>

        {/* Screen Title */}
        <Text className="text-2xl font-poppins-bold text-bolt-graphite text-center tracking-tight">
          Billbolt is Locked
        </Text>

        {/* Friendly Subtitle */}
        <Text className="text-sm font-inter text-bolt-slate text-center mt-1.5 leading-5">
          Confirm your fingerprint or Face ID to access your shop records.
        </Text>

        {/* Error Feedback Banner if authentication missed */}
        {errorMessage && (
          <View className="w-full mt-5 px-3.5 py-2.5 bg-bolt-danger-bg border border-bolt-danger-border rounded-xl flex-row items-center gap-2">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={16}
              color={Colors.danger.text}
            />
            <Text className="text-xs font-inter-medium text-bolt-danger-text flex-1">
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Primary Unlock CTA */}
        <Animated.View style={[animatedButtonStyle, { width: "100%", marginTop: 24 }]}>
          <Pressable
            onPress={handleUnlockPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isAuthenticating}
            className="w-full h-14 bg-bolt-blue rounded-2xl flex-row items-center justify-center gap-2.5"
            style={Shadows.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Tap to unlock with fingerprint"
          >
            <HugeiconsIcon icon={FingerPrintIcon} size={22} color="white" />
            <Text className="text-white font-inter-semibold text-base">
              {isAuthenticating ? "Verifying..." : "Tap to Unlock"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Bottom Fallback Option */}
      {onUsePassword ? (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onUsePassword();
          }}
          className="py-3 px-6"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Use password instead"
        >
          <Text className="text-sm font-inter-medium text-bolt-slate">
            Use Password Instead
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="h-6" />
      )}
    </SafeAreaView>
  );
}
