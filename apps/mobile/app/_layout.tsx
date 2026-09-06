import "../global.css";
import { cssInterop } from "nativewind";
import { Image } from "expo-image";

cssInterop(Image, { className: "style" });

import {
  Inter_400Regular,
  Inter_600SemiBold,
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
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/Elements/ToastConfig";
import { startNetworkSyncListener } from "@/services/sync/syncEngine";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

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
    Inter_600SemiBold,
  });

  // Hide the native splash immediately on first render so our custom
  // splash screen (index.tsx) is visible for the full boot sequence.
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 16); // single frame — show native splash just long enough to avoid a white flash
    return () => clearTimeout(t);
  }, []);

  // Mount offline network sync listener
  useEffect(() => {
    const unsubscribe = startNetworkSyncListener();
    return () => {
      unsubscribe?.();
    };
  }, []);

  // Always render — fonts load in background, Poppins/Inter have system fallbacks
  // so text is readable even before font files finish loading.

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} topOffset={54} />
    </>
  );
}

