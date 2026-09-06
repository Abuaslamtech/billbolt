import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from '@/services/storage/auth';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const http = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  needsBusinessSetup?: boolean;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    credit: number;
    business: {
      id: string;
      name: string;
      type: string | null;
      address: string | null;
      phone: string | null;
      email: string | null;
      currency: string;
      logoUrl?: string | null;
    } | null;
  };
}

/** Google OAuth — send Firebase ID token, receive our JWT pair */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/google', { idToken });
  return data;
}

/** Email Sign-Up — creates Firebase + DB user, returns JWT pair */
export async function emailSignup(dto: {
  email: string;
  password: string;
  fullName: string;
  businessName?: string;
  businessType?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/email/signup', dto);
  return data;
}

/**
 * Email Login — direct email + password login verified against PostgreSQL
 */
export async function emailLogin(dto: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/email/login', dto);
  return data;
}

/** Refresh — exchange a valid refresh token for a new access token */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; user: AuthResponse['user'] }> {
  const { data } = await http.post('/auth/refresh', { refreshToken });
  return data;
}

/** Logout — revoke the refresh token server-side */
export async function logoutApi(accessToken: string): Promise<void> {
  await http.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/** Fetch authenticated user's profile */
export async function getMyProfile(accessToken: string): Promise<AuthResponse['user']> {
  const { data } = await http.get('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}
