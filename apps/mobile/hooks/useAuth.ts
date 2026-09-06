import { useState } from "react";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { auth } from "@/config/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  emailLogin,
  emailSignup,
  googleLogin,
  logoutApi,
} from "@/services/auth/authService";
import {
  clearAuthStorage,
  persistOnboarded,
  saveRefreshToken,
  saveToken,
  saveUserEmail,
} from "@/services/storage/auth";
import { clearOfflineCache } from "@/services/storage/localStorage";
import { clearSyncQueue } from "@/services/sync/syncEngine";
import { useAuthStore } from "@/store/authStore";
import { useAppDataStore } from "@/store/AppDataStore";
import { useSyncStore } from "@/store/syncStore";

interface SignUpData {
  email: string;
  password: string;
  setLoading: (value: boolean) => void;
  fullName: string;
  phone?: string;
}

interface LinkAccountData {
  email: string;
  password: string;
  idToken: string | null;
  setIsLinking: (value: boolean) => void;
}

export default function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { setUser, setToken, clearAuth } = useAuthStore();

  // ─── Sign Up with Email & Password ─────────────────────────────────────────
  const signUpWithEmail = async ({
    email,
    password,
    setLoading,
    fullName,
    phone,
  }: SignUpData) => {
    setLoading(true);
    try {
      const authRes = await emailSignup({
        email,
        password,
        fullName,
        phone,
      });

      // Save tokens to SecureStore for persistent login
      await saveToken(authRes.accessToken);
      await saveRefreshToken(authRes.refreshToken);
      await saveUserEmail(email);
      await persistOnboarded();

      // Update store
      setToken(authRes.accessToken);
      setUser(authRes.user as any);

      // Clean & initialize fresh app data for the newly registered account
      useAppDataStore.getState().reset();
      await useAppDataStore.getState().init();

      Toast.show({
        type: "success",
        text1: "Account created",
        text2: "Let's set up your shop.",
        position: "top",
      });

      router.replace("/(auth)/SetupShopWizard");
    } catch (error: any) {
      console.error("Signup error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: typeof msg === "string" ? msg : JSON.stringify(msg),
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Sign In with Email & Password ─────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Direct login against Postgres with bcrypt verification
      const authRes = await emailLogin({
        email: email.trim(),
        password,
      });

      // 2. Persist to SecureStore
      await saveToken(authRes.accessToken);
      await saveRefreshToken(authRes.refreshToken);
      await saveUserEmail(email.trim());
      await persistOnboarded();

      // 3. Update in-memory auth store
      setToken(authRes.accessToken);
      setUser(authRes.user as any);

      // 4. Reset & initialize fresh app data for the signed-in account
      useAppDataStore.getState().reset();
      await useAppDataStore.getState().init();

      Toast.show({
        type: "success",
        text1: "Sign In Successful",
        text2: "Welcome back to BillBolt!",
        position: "top",
      });

      router.replace("/(main)");
    } catch (error: any) {
      console.error("Sign in error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password.";

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: typeof message === "string" ? message : "Please check your details and try again.",
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-In ────────────────────────────────────────────────────────
  const signInWithGoogle = async ({
    setIsModalVisible,
  }: {
    setIsModalVisible?: (value: boolean) => void;
  } = {}) => {
    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      try {
        await GoogleSignin.signOut();
      } catch {}

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("No Google ID token received");
      }

      // Exchange Google ID token with backend
      const authRes = await googleLogin(idToken);

      // Persist tokens
      await saveToken(authRes.accessToken);
      await saveRefreshToken(authRes.refreshToken);
      if (authRes.user.email) {
        await saveUserEmail(authRes.user.email);
      }
      await persistOnboarded();

      // Update store
      setToken(authRes.accessToken);
      setUser(authRes.user as any);

      if (authRes.needsBusinessSetup || !authRes.user.business) {
        Toast.show({
          type: "info",
          text1: "Welcome to Billbolt",
          text2: "Let's set up your shop.",
          position: "top",
        });
        router.replace("/(auth)/SetupShopWizard");
      } else {
        useAppDataStore.getState().reset();
        await useAppDataStore.getState().init();

        Toast.show({
          type: "success",
          text1: "Signed In with Google",
          text2: `Welcome back, ${authRes.user.fullName || authRes.user.email}!`,
          position: "top",
        });
        router.replace("/(main)");
      }
      return { email: authRes.user.email, idToken };
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code !== "SIGN_IN_CANCELLED") {
        Toast.show({
          type: "error",
          text1: "Google Sign-In Failed",
          text2: error.response?.data?.message || error.message || "Failed to sign in with Google",
          position: "top",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ─── Account Linking ───────────────────────────────────────────────────────
  const LinkAccount = async ({
    email,
    idToken,
    password,
    setIsLinking,
  }: LinkAccountData) => {
    setIsLinking(true);
    try {
      if (!idToken) throw new Error("Missing ID Token");
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await userCredential.user.linkWithCredential(googleCredential);

      Toast.show({
        type: "success",
        text1: "Account Linked",
        text2: "Account linked successfully with Google.",
        position: "top",
      });
    } catch (error: any) {
      console.error("Linking failed:", error);
      Toast.show({
        type: "error",
        text1: "Linking Failed",
        text2: error.message || "Could not link account.",
        position: "top",
      });
    } finally {
      setIsLinking(false);
    }
  };

  // ─── Log Out ───────────────────────────────────────────────────────────────
  const LogOut = async () => {
    try {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        logoutApi(currentToken).catch(() => {});
      }
      await auth().signOut().catch(() => {});
      try {
        await GoogleSignin.signOut();
      } catch {}

      await Promise.allSettled([
        clearAuthStorage(),
        clearOfflineCache(),
        clearSyncQueue(),
      ]);
      useAppDataStore.getState().reset();
      useSyncStore.getState().setPendingCount(0);
      clearAuth();

      Toast.show({
        type: "success",
        text1: "Signed out",
        text2: "You have been logged out safely.",
      });

      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout failed:", error);
      await Promise.allSettled([
        clearAuthStorage(),
        clearOfflineCache(),
        clearSyncQueue(),
      ]);
      useAppDataStore.getState().reset();
      useSyncStore.getState().setPendingCount(0);
      clearAuth();
      router.replace("/(auth)");
    }
  };

  return {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    LinkAccount,
    LogOut,
    isLoading,
    isGoogleLoading,
  };
}
