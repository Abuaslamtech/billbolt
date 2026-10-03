import "../global.css";
import { cssInterop } from "nativewind";
import { Image } from "expo-image";

cssInterop(Image, { className: "style" });

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, TextInput } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toastConfig } from "@/components/Elements/ToastConfig";
import { startNetworkSyncListener } from "@/services/sync/syncEngine";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Cap system font scaling at 1.25x so extreme accessibility settings don't break layouts
[Text, TextInput].forEach((comp: any) => {
  comp.defaultProps = { ...comp.defaultProps, maxFontSizeMultiplier: 1.25 };
});

// Configure Google Sign-In once at app startup
GoogleSignin.configure({
  webClientId:
    "381178769112-s39q38b0r1hkuvg974li9fnnp5b2lir2.apps.googleusercontent.com",
  offlineAccess: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Hide splash screen once fonts are resolved to eliminate FOYT and layout shifts
  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontsError]);

  // Mount offline network sync listener
  useEffect(() => {
    const unsubscribe = startNetworkSyncListener();
    return () => {
      unsubscribe?.();
    };
  }, []);

  const insets = useSafeAreaInsets();

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#F9FAFB" },
        }}
      />
      <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 54)} />
    </>
  );
}

