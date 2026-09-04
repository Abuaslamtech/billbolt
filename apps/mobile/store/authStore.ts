import { create } from 'zustand';
import { saveCachedUser } from '@/services/storage/auth';

export type Business = {
  id: string;
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  currency: string;
  logoUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  credit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  business: Business | null;
};

type AuthState = {
  /** Authenticated user — persisted to cache for offline access */
  user: User | null;
  /** Access token — in memory only. Source of truth is SecureStore. */
  token: string | null;
  /** Boot sequence complete */
  isInitialized: boolean;
  /** Token refresh or profile fetch in progress */
  isValidating: boolean;
  /** Has the user seen the onboarding slides */
  hasOnboarded: boolean;

  setUser: (user: User | Partial<User> | null) => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
  setValidating: (value: boolean) => void;
  setOnboarded: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,
  isValidating: false,
  hasOnboarded: false,

  setUser: (user) =>
    set((state) => {
      const mergedUser = user ? ({ ...state.user, ...user } as User) : null;
      if (mergedUser) {
        saveCachedUser(mergedUser).catch(() => {});
      }
      return { user: mergedUser };
    }),
  setToken: (token) => set({ token }),
  clearAuth: () => set({ user: null, token: null }),
  setInitialized: (value) => set({ isInitialized: value }),
  setValidating: (value) => set({ isValidating: value }),
  setOnboarded: (value) => set({ hasOnboarded: value }),
}));
