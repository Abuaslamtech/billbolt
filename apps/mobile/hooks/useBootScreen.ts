import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";

import { initializeNotification } from "@/config/firebase";
import { getMyProfile, refreshAccessToken } from "@/services/auth/authService";
import { isTokenExpired } from "@/services/auth/tokenValidation";
import {
  clearAuthStorage,
  getCachedUser,
  getOnboarded,
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from "@/services/storage/auth";
import { clearOfflineCache } from "@/services/storage/offlineCache";
import { clearSyncQueue } from "@/services/sync/syncEngine";
import { useAppDataStore } from "@/store/AppDataStore";
import { useAuthStore } from "@/store/authStore";
import { useSyncStore } from "@/store/syncStore";
import { BIOMETRIC_KEY } from "@/lib/constants";

const waitMinimum = async (startTime: number, minMs = 1200) => {
  const elapsed = Date.now() - startTime;
  if (elapsed < minMs) {
    await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
  }
};

export function useBootScreen() {
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lockErrorMessage, setLockErrorMessage] = useState<string | null>(null);

  // Setup Firebase notifications non-blockingly
  useEffect(() => {
    let unsubscribeFunctions: any;
    const setUpNotification = async () => {
      try {
        unsubscribeFunctions = await initializeNotification();
      } catch (error) {
        console.log("Notification Initialization error: ", error);
      }
    };
    setUpNotification();

    return () => {
      if (unsubscribeFunctions) {
        unsubscribeFunctions.foregroundUnsubscribe?.();
        unsubscribeFunctions.notificationOpenedUnsubscribe?.();
        unsubscribeFunctions.tokenRefreshUnsubscribe?.();
      }
    };
  }, []);

  // Handlers for App Lock Overlay
  const handleUnlock = async () => {
    setIsAuthenticating(true);
    setLockErrorMessage(null);
    try {
      const authRes = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Billbolt",
        fallbackLabel: "Use Password",
        cancelLabel: "Cancel",
      });
      setIsAuthenticating(false);

      if (authRes.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsLocked(false);
        router.replace("/(main)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLockErrorMessage("Fingerprint not recognized. Tap below to try again.");
      }
    } catch {
      setIsAuthenticating(false);
      setLockErrorMessage("Authentication failed. Tap below to try again.");
    }
  };

  const handleUsePassword = async () => {
    await Promise.allSettled([
      clearAuthStorage(),
      clearOfflineCache(),
      clearSyncQueue(),
    ]);
    useAppDataStore.getState().reset();
    useSyncStore.getState().setPendingCount(0);
    useAuthStore.getState().clearAuth();
    setIsLocked(false);
    router.replace("/(auth)");
  };

  // Central Boot Sequence & Security Routing Decision
  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    const proceedToAppWithSecurity = async () => {
      try {
        // 1. Check if App Lock is enabled
        const isAppLockEnabled = (await AsyncStorage.getItem(BIOMETRIC_KEY)) === "true";

        if (isAppLockEnabled) {
          setIsAuthenticating(true);
          setLockErrorMessage(null);
          try {
            const authRes = await LocalAuthentication.authenticateAsync({
              promptMessage: "Unlock Billbolt",
              fallbackLabel: "Use Password",
              cancelLabel: "Cancel",
            });
            if (!isMounted) return;
            setIsAuthenticating(false);

            if (authRes.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace("/(main)");
              return;
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              setIsLocked(true);
              setLockErrorMessage("Fingerprint not recognized. Tap below to try again.");
              return;
            }
          } catch {
            if (!isMounted) return;
            setIsAuthenticating(false);
            setIsLocked(true);
            setLockErrorMessage("Authentication failed. Tap below to try again.");
            return;
          }
        }

        // 2. If App Lock is NOT enabled, proceed to main dashboard directly
        if (!isMounted) return;
        router.replace("/(main)");
      } catch (err) {
        console.error("[Boot] Security gate error:", err);
        if (!isMounted) return;
        router.replace("/(main)");
      }
    };

    const bootApp = async () => {
      try {
        console.log("[Boot] Starting boot sequence...");
        const { setToken, setUser, setOnboarded } = useAuthStore.getState();

        // 1. Check if user has completed onboarding
        const hasOnboarded = await getOnboarded();
        console.log("[Boot] Has onboarded:", hasOnboarded);
        if (!isMounted) return;
        setOnboarded(hasOnboarded);

        if (!hasOnboarded) {
          await waitMinimum(startTime);
          if (!isMounted) return;
          console.log("[Boot] Navigating to /(onboarding)");
          router.replace("/(onboarding)");
          return;
        }

        // 2. Check for stored auth token in SecureStore
        let accessToken = await getToken();
        console.log("[Boot] Access token present:", Boolean(accessToken));

        if (accessToken) {
          // If expired, try silent refresh
          if (isTokenExpired(accessToken)) {
            console.log("[Boot] Token expired, attempting refresh...");
            const refreshToken = await getRefreshToken();
            if (refreshToken) {
              try {
                const res = await refreshAccessToken(refreshToken);
                await saveToken(res.accessToken);
                await saveRefreshToken(res.refreshToken);
                accessToken = res.accessToken;
                setUser(res.user as any);
              } catch (refreshErr: any) {
                console.log("[Boot] Refresh failed:", refreshErr?.message);
                if (refreshErr?.response?.status === 401 || refreshErr?.response?.status === 403) {
                  await Promise.allSettled([
                    clearAuthStorage(),
                    clearOfflineCache(),
                    clearSyncQueue(),
                  ]);
                  useAppDataStore.getState().reset();
                  useSyncStore.getState().setPendingCount(0);
                  accessToken = null;
                }
              }
            } else {
              await Promise.allSettled([
                clearAuthStorage(),
                clearOfflineCache(),
                clearSyncQueue(),
              ]);
              useAppDataStore.getState().reset();
              useSyncStore.getState().setPendingCount(0);
              accessToken = null;
            }
          }

          // If token is valid, fetch fresh profile and initialize app data
          if (accessToken) {
            try {
              console.log("[Boot] Fetching user profile...");
              const profile = await getMyProfile(accessToken);
              if (!isMounted) return;
              setToken(accessToken);
              setUser(profile as any);

              if (!profile.business) {
                await waitMinimum(startTime);
                if (!isMounted) return;
                console.log("[Boot] Navigating to SetupShopWizard");
                router.replace("/(auth)/SetupShopWizard");
                return;
              }

              console.log("[Boot] Initializing app data store...");
              await useAppDataStore.getState().init();
              await waitMinimum(startTime);
              if (!isMounted) return;

              console.log("[Boot] Running security gate...");
              await proceedToAppWithSecurity();
              return;
            } catch (profileErr: any) {
              console.log("[Boot] Profile fetch error:", profileErr?.message);
              if (profileErr?.response?.status === 401 || profileErr?.response?.status === 403) {
                await Promise.allSettled([
                  clearAuthStorage(),
                  clearOfflineCache(),
                  clearSyncQueue(),
                ]);
                useAppDataStore.getState().reset();
                useSyncStore.getState().setPendingCount(0);
                accessToken = null;
              } else {
                // Offline / network timeout — load cached user profile and enter app
                const cachedUser = await getCachedUser();
                if (cachedUser && isMounted) {
                  setUser(cachedUser);
                }
                if (isMounted) {
                  setToken(accessToken);
                  await useAppDataStore.getState().init();
                  await waitMinimum(startTime);
                  if (!isMounted) return;
                  console.log("[Boot] Offline mode: Running security gate...");
                  await proceedToAppWithSecurity();
                  return;
                }
              }
            }
          }
        }

        // 3. User is onboarded but not logged in -> Auth screen
        await waitMinimum(startTime);
        if (!isMounted) return;
        console.log("[Boot] Navigating to /(auth)");
        router.replace("/(auth)");
      } catch (error) {
        console.error("[Boot] Sequence error:", error);
        await waitMinimum(startTime);
        if (!isMounted) return;
        router.replace("/(auth)");
      }
    };

    bootApp();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isLocked,
    isAuthenticating,
    lockErrorMessage,
    handleUnlock,
    handleUsePassword,
  };
}
