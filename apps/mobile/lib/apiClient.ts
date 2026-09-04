import axios, { AxiosRequestConfig } from 'axios';
import { clearAuthStorage, getRefreshToken, getToken, saveRefreshToken, saveToken } from '@/services/storage/auth';
import { refreshAccessToken } from '@/services/auth/authService';
import { shouldProactivelyRefresh } from '@/services/auth/tokenValidation';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Single in-flight refresh promise to prevent race conditions across concurrent requests
let refreshPromise: Promise<string | null> | null = null;

async function executeTokenRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        performHardLogout();
        return null;
      }

      const res = await refreshAccessToken(refreshToken);
      await saveToken(res.accessToken);
      await saveRefreshToken(res.refreshToken);
      useAuthStore.getState().setToken(res.accessToken);
      return res.accessToken;
    } catch (err: any) {
      // Only force logout if the refresh token is rejected as invalid/expired (401/403)
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        performHardLogout();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Request interceptor: attach access token ─────────────────────────────────

apiClient.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().token ?? (await getToken());

  if (token) {
    // Proactive refresh: if token expires in < 5 min, refresh before sending request
    if (shouldProactivelyRefresh(token)) {
      const refreshed = await executeTokenRefresh();
      if (refreshed) {
        token = refreshed;
      }
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Response interceptor: handle 401 with refresh retry ─────────────────────

apiClient.interceptors.response.use(
  (response) => {
    useSyncStore.getState().setIsOnline(true);
    return response;
  },
  async (error) => {
    if (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error')
    ) {
      useSyncStore.getState().setIsOnline(false);
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await executeTokenRefresh();
      if (newToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

/** Hard logout — clears all auth state and navigates to login */
export function performHardLogout() {
  clearAuthStorage().catch(() => {});
  useAuthStore.getState().clearAuth();
  // Lazy import to avoid circular dep
  const { router } = require('expo-router');
  setTimeout(() => {
    try {
      router.replace('/(auth)');
    } catch {}
  }, 0);
}
