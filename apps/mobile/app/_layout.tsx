import "../global.css";
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
import { useEffect, useState } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/Elements/ToastConfig";
import { startNetworkSyncListener } from "@/services/sync/syncEngine";

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

  const [allowRender, setAllowRender] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setAllowRender(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 400);

    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {});
      clearTimeout(t);
    }

    return () => clearTimeout(t);
  }, [fontsLoaded, fontsError]);

  // Mount offline network sync listener
  useEffect(() => {
    const unsubscribe = startNetworkSyncListener();
    return () => {
      unsubscribe?.();
    };
  }, []);

  if (!fontsLoaded && !fontsError && !allowRender) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} topOffset={54} />
    </>
  );
}

