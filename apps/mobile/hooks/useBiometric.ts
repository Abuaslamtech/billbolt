import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { BIOMETRIC_KEY, APP_LOCK_PROMPT_SHOWN_KEY } from "@/lib/constants";
import { getCachedUser, getToken } from "@/services/storage/auth";
import { useAuthStore } from "@/store/authStore";
import { useAppDataStore } from "@/store/AppDataStore";

export function useBiometric() {
  const [hasBiometric, setHasBiometric] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const isEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
        if (isEnabled === "true") {
          setBiometricEnabled(true);
          const storedToken = await getToken();
          if (storedToken) {
            setHasBiometric(true);
          }
        }
      } catch {
        // ignore error
      }
    };
    checkAvailability();
  }, []);

  const handleBiometricSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to Billbolt",
        fallbackLabel: "Use Password",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        const token = await getToken();
        const cached = await getCachedUser();
        if (token && cached) {
          useAuthStore.getState().setToken(token);
          useAuthStore.getState().setUser(cached);
          useAppDataStore.getState().init();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/(main)");
        } else {
          Toast.show({
            type: "info",
            text1: "Sign In Required",
            text2: "Please enter your password once to refresh your session.",
          });
        }
      }
    } catch (error) {
      console.error("Biometric sign-in error:", error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          Toast.show({
            type: "error",
            text1: "App Lock Unavailable",
            text2: "No fingerprint or Face ID setup found on this device.",
          });
          return;
        }

        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: "Confirm fingerprint to enable App Lock",
          fallbackLabel: "Use PIN / Password",
          cancelLabel: "Cancel",
        });

        if (authResult.success) {
          setBiometricEnabled(true);
          await AsyncStorage.setItem(BIOMETRIC_KEY, "true");
          await AsyncStorage.setItem(APP_LOCK_PROMPT_SHOWN_KEY, "true");
          Toast.show({
            type: "success",
            text1: "App Lock Enabled",
            text2: "Your shop records are now protected with fingerprint.",
          });
        }
      } catch (error) {
        console.error("Biometric authentication error:", error);
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: "Could not verify biometric credentials.",
        });
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem(BIOMETRIC_KEY, "false");
      Toast.show({
        type: "info",
        text1: "App Lock Turned Off",
        text2: "Billbolt will now open directly.",
      });
    }
  };

  return {
    hasBiometric,
    biometricEnabled,
    handleBiometricSignIn,
    handleBiometricToggle,
  };
}
