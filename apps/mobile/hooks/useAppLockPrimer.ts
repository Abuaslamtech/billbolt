import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

import { useAppDataStore } from "@/store/AppDataStore";
import { BIOMETRIC_KEY, APP_LOCK_PROMPT_SHOWN_KEY } from "@/lib/constants";

export function useAppLockPrimer() {
  const [showPrimerModal, setShowPrimerModal] = useState(false);
  const receipts = useAppDataStore((state) => state.receipts);

  useEffect(() => {
    let isMounted = true;

    const checkShouldPrompt = async () => {
      try {
        // 1. If App Lock is already turned on, never prompt
        const isEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
        if (isEnabled === "true" || !isMounted) return;

        // 2. If prompt was already shown/handled on this device, never prompt again
        const hasPrompted = await AsyncStorage.getItem(APP_LOCK_PROMPT_SHOWN_KEY);
        if (hasPrompted === "true" || !isMounted) return;

        // 3. Check hardware capabilities
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled || !isMounted) return;

        // 4. Check that merchant has existing records (> 1)
        if (receipts.length > 1) {
          // Brief 500ms delay so dashboard finishes entrance animation first
          setTimeout(() => {
            if (isMounted) {
              setShowPrimerModal(true);
            }
          }, 500);
        }
      } catch (err) {
        console.log("[AppLockPrimer] Check error:", err);
      }
    };

    checkShouldPrompt();

    return () => {
      isMounted = false;
    };
  }, [receipts.length]);

  const handleEnableAppLock = async () => {
    try {
      const authRes = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm fingerprint to enable App Lock",
        fallbackLabel: "Cancel",
      });

      if (authRes.success) {
        await AsyncStorage.setItem(BIOMETRIC_KEY, "true");
        await AsyncStorage.setItem(APP_LOCK_PROMPT_SHOWN_KEY, "true");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowPrimerModal(false);
        Toast.show({
          type: "success",
          text1: "App Lock Enabled",
          text2: "Your shop records are now protected with fingerprint.",
        });
      }
    } catch (err) {
      console.error("[AppLockPrimer] Enable error:", err);
    }
  };

  const handleDismissPrimer = async () => {
    try {
      await AsyncStorage.setItem(APP_LOCK_PROMPT_SHOWN_KEY, "true");
      setShowPrimerModal(false);
    } catch (err) {
      console.error("[AppLockPrimer] Dismiss error:", err);
      setShowPrimerModal(false);
    }
  };

  return {
    showPrimerModal,
    handleEnableAppLock,
    handleDismissPrimer,
  };
}
