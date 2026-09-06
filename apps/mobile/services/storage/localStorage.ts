/**
 * Data service — Offline-first wrapper over the NestJS cloud backend.
 *
 * Online: fetches from API and populates local AsyncStorage cache.
 * Offline / Network Error: instantly serves from local cache, saves
 * mutations locally with temporary IDs, and queues actions for background sync.
 */
import Toast from 'react-native-toast-message';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import {
  Product,
  ProductWithStock,
  Receipt,
  Restock,
  Sale,
} from '@/types/models';
import {
  BusinessInfo,
  DEFAULT_BUSINESS_INFO,
  getCachedBusinessInfo,
  getCachedProducts,
  getCachedReceipts,
  getCachedRestocks,
  getCachedSales,
  setCachedBusinessInfo,
  setCachedProducts,
  setCachedReceipts,
  setCachedRestocks,
  setCachedSales,
  createOfflineProduct,
  createOfflineReceipt,
  createOfflineRestock,
  updateOfflineBusinessInfo,
  clearOfflineCache,
} from './offlineCache';
import { enqueueSyncAction } from '@/services/sync/syncEngine';

export { BusinessInfo, DEFAULT_BUSINESS_INFO, clearOfflineCache };

export async function getBusinessInfo(): Promise<BusinessInfo> {
  const isOnline = useSyncStore.getState().isOnline;
  if (!isOnline) return getCachedBusinessInfo();

  try {
    const { data } = await apiClient.get('/business/me');
    const info: BusinessInfo = {
      name: data.name ?? '',
      type: data.type ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      address: data.address ?? '',
      currency: data.currency ?? '₦',
      logoUrl: data.logoUrl ?? null,
    };
    await setCachedBusinessInfo(info);
    return info;
  } catch (err) {
    return getCachedBusinessInfo();
  }
}

export async function getUserProfile(): Promise<any> {
  const isOnline = useSyncStore.getState().isOnline;
  if (!isOnline) return useAuthStore.getState().user;

  try {
    const { data } = await apiClient.get('/auth/me');
    if (data) {
      useAuthStore.getState().setUser(data);
    }
    return data;
  } catch (err) {
    return useAuthStore.getState().user;
  }
}

export async function saveBusinessInfo(info: Partial<BusinessInfo>): Promise<BusinessInfo> {
  const isOnline = useSyncStore.getState().isOnline;

  if (isOnline) {
    try {
      const { data } = await apiClient.patch('/business/me', info);
      const updated: BusinessInfo = {
        name: data.name ?? '',
        type: data.type ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        currency: data.currency ?? '₦',
        logoUrl: data.logoUrl ?? null,
      };
      await setCachedBusinessInfo(updated);
      return updated;
    } catch (err) {
      // Fallback to offline on error
    }
  }

  const local = await updateOfflineBusinessInfo(info);
  await enqueueSyncAction('UPDATE_BUSINESS', info);
  Toast.show({
    type: 'info',
    text1: 'Saved Offline',
    text2: 'Business info updated locally. Will sync when online.',
  });
  return local;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return getProductsWithStock();
}

export async function getProductsWithStock(): Promise<ProductWithStock[]> {
  const isOnline = useSyncStore.getState().isOnline;
  if (!isOnline) return getCachedProducts();

  try {
    const { data } = await apiClient.get('/inventory/products');
    if (Array.isArray(data)) {
      await setCachedProducts(data);
      return data;
    }
    return getCachedProducts();
  } catch (err) {
    return getCachedProducts();
  }
}

import { generateProductSku } from '@/lib/qr/qrGenerator';

export async function addProduct(
  input: Omit<Product, 'id' | 'createdAt'>,
): Promise<ProductWithStock> {
  const isOnline = useSyncStore.getState().isOnline;
  const qrCode = input.qrCode || generateProductSku(input.name);
  const payload = { ...input, qrCode };

  if (isOnline) {
    try {
      const { data } = await apiClient.post('/inventory/products', payload);
      const cached = await getCachedProducts();
      await setCachedProducts([data, ...cached.filter((p) => p.id !== data.id)]);
      return data;
    } catch (err) {
      // Fallback to offline on error
    }
  }

  const localProduct = await createOfflineProduct(payload);
  await enqueueSyncAction('ADD_PRODUCT', payload, localProduct.id);
  Toast.show({
    type: 'info',
    text1: 'Added Offline',
    text2: `${input.name} saved locally. Will sync to cloud when connected.`,
  });
  return localProduct;
}

// ─── Restocks ─────────────────────────────────────────────────────────────────

export async function getRestocks(): Promise<Restock[]> {
  const isOnline = useSyncStore.getState().isOnline;
  if (!isOnline) return getCachedRestocks();

  try {
    const { data } = await apiClient.get('/inventory/restocks');
    if (Array.isArray(data)) {
      await setCachedRestocks(data);
      return data;
    }
    return getCachedRestocks();
  } catch (err) {
    return getCachedRestocks();
  }
}

export async function addRestock(input: {
  productId: string;
  qty: number;
  costPerUnit: number;
  date?: string;
  notes?: string;
}): Promise<Restock> {
  const isOnline = useSyncStore.getState().isOnline;

  if (isOnline) {
    try {
      const { data } = await apiClient.post('/inventory/restocks', input);
      const cached = await getCachedRestocks();
      await setCachedRestocks([data, ...cached.filter((r) => r.id !== data.id)]);
      return data;
    } catch (err) {
      // Fallback to offline on error
    }
  }

  const localRestock = await createOfflineRestock(input);
  await enqueueSyncAction('LOG_RESTOCK', input, localRestock.id);
  Toast.show({
    type: 'info',
    text1: 'Restock Saved Offline',
    text2: 'Stock count updated locally. Will sync when online.',
  });
  return localRestock;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function getSales(): Promise<Sale[]> {
  const isOnline = useSyncStore.getState().isOnline;
  if (!isOnline) return getCachedSales();

  try {
    const { data } = await apiClient.get('/sales');
    if (Array.isArray(data)) {
      await setCachedSales(data);
      return data;
    }
    return getCachedSales();
  } catch (err) {
    return getCachedSales();
  }
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export async function getReceipts(): Promise<Receipt[]> {
  const isOnline = useSyncStore.getState().isOnline;
  if (!isOnline) return getCachedReceipts();

  try {
    const { data } = await apiClient.get('/receipts?limit=100');
    const list: Receipt[] = data.receipts ?? data;
    if (Array.isArray(list)) {
      await setCachedReceipts(list);
      return list;
    }
    return getCachedReceipts();
  } catch (err) {
    return getCachedReceipts();
  }
}

export async function createReceipt(input: {
  customerName: string;
  customerPhone?: string;
  items: { productId: string; qty: number }[];
  paymentMethod?: Receipt['paymentMethod'];
  soldBy?: string;
  notes?: string;
  date?: string;
  discount?: number;
}): Promise<Receipt> {
  const isOnline = useSyncStore.getState().isOnline;

  if (isOnline) {
    try {
      const { data } = await apiClient.post<Receipt>('/receipts', input);
      const cached = await getCachedReceipts();
      await setCachedReceipts([data, ...cached.filter((r) => r.id !== data.id)]);
      return data;
    } catch (err: any) {
      // Only fall back to offline if it was a genuine network error (no response).
      // For server errors (4xx/5xx), rethrow so the caller knows something is wrong
      // and we don't create a duplicate offline record + extra sync queue entry.
      const isNetworkError =
        !err?.response ||
        err?.code === 'ECONNABORTED' ||
        err?.message?.includes('Network Error');

      if (!isNetworkError) {
        // Server is reachable but returned an error – rethrow it
        throw err;
      }
      // Genuine network failure – fall through to offline path
    }
  }

  // Network unreachable -> generate instant local receipt and queue sync
  const localReceipt = await createOfflineReceipt(input);
  await enqueueSyncAction('CREATE_RECEIPT', input, localReceipt.id);
  Toast.show({
    type: 'info',
    text1: 'Recorded Offline',
    text2: 'Receipt created. Will sync to cloud automatically.',
  });
  return localReceipt;
}

// ─── Initialize Storage ───────────────────────────────────────────────────────

export async function initializeStorage(): Promise<void> {
  // Pre-warm local cache on startup
  await Promise.allSettled([
    getCachedBusinessInfo(),
    getCachedProducts(),
    getCachedSales(),
    getCachedReceipts(),
    getCachedRestocks(),
  ]);
}
