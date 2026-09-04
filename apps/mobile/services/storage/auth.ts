import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'billbolt_access_token',
  REFRESH_TOKEN: 'billbolt_refresh_token',
  USER_EMAIL: 'billbolt_user_email',
  USER_PROFILE: 'billbolt_user_profile',
  HAS_ONBOARDED: 'billbolt_has_onboarded',
} as const;

// ─── Access Token (SecureStore — encrypted) ───────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
}

// ─── Refresh Token (SecureStore — encrypted) ──────────────────────────────────

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function removeRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
}

// ─── User Profile Cache (AsyncStorage — for instant offline access) ───────────

export async function saveCachedUser(user: any): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save cached user profile:', err);
  }
}

export async function getCachedUser(): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function removeCachedUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_PROFILE);
}

// ─── User Email (AsyncStorage — for UI display only) ─────────────────────────

export async function saveUserEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_EMAIL, email);
}

export async function getUserEmail(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.USER_EMAIL);
}

export async function removeUserEmail(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_EMAIL);
}

// ─── Onboarding State (AsyncStorage) ─────────────────────────────────────────

export async function persistOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEYS.HAS_ONBOARDED, 'true');
}

export async function getOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.HAS_ONBOARDED)) === 'true';
}

// ─── Clear All Auth Storage ───────────────────────────────────────────────────

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    removeToken(),
    removeRefreshToken(),
    removeUserEmail(),
    removeCachedUser(),
  ]);
}
