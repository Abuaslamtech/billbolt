import React from "react";
import { View, Text } from 'react-native';
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import logo from "@/assets/images/icon.png";
import atlabxLogo from "@/assets/images/atlabx.png";
import AppLockOverlay from "@/components/Elements/AppLockOverlay";
import { useBootScreen } from "@/hooks/useBootScreen";
import { Shadows } from "@/lib/styles";

import { Image } from 'expo-image';
export default function Index() {
  const {
    isLocked,
    isAuthenticating,
    lockErrorMessage,
    handleUnlock,
    handleUsePassword,
  } = useBootScreen();

  if (isLocked) {
    return (
      <AppLockOverlay
        onUnlock={handleUnlock}
        onUsePassword={handleUsePassword}
        isAuthenticating={isAuthenticating}
        errorMessage={lockErrorMessage}
      />
    );
  }

  return (
    <View className="flex-1 bg-white items-center justify-between py-12 px-6">
      <StatusBar style="dark" />

      {/* Top spacer for optical balance */}
      <View className="h-6" />

      {/* Center Branding Hero */}
      <View className="items-center">
        <Animated.View entering={FadeIn.duration(500).springify()}>
          <View
            className="w-24 h-24 rounded-3xl overflow-hidden shadow-md"
            style={Shadows.heroButton}
          >
            <Image
              source={logo}
              className="w-full h-full"
              contentFit="contain"
            />
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.Text
          entering={FadeInDown.delay(180).duration(400).springify()}
          className="text-bolt-blue font-poppins-bold text-3xl mt-4 tracking-wide"
        >
          Billbolt
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          className="text-bolt-slate font-inter-medium text-xs mt-1"
        >
          Smart business made simple
        </Animated.Text>
      </View>

      {/* Bottom: from AtlabX Technologies (Meta style) */}
      <Animated.View
        entering={FadeIn.delay(400).duration(500)}
        className="items-center"
      >
        <Text className="text-2xs font-inter-semibold text-bolt-slate uppercase tracking-widest mb-1.5">
          from
        </Text>
        <View className="flex-row items-center gap-2">
          <Image
            source={atlabxLogo}
            className="w-6 h-6"
            contentFit="contain"
          />
          <Text className="text-sm font-poppins-bold text-[#0F2A63] tracking-wide">
            AtlabX Technologies
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
