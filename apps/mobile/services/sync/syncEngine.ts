import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiClient } from '@/lib/apiClient';
import { useSyncStore } from '@/store/syncStore';
import { generateId, formatYMD } from '@/services/storage/cycleUtils';
import { remapCachedProductIds } from '@/services/storage/offlineCache';

const SYNC_QUEUE_KEY = '@billbolt_sync_queue';
const ID_MAP_KEY = '@billbolt_id_mappings';

// Dynamically load NetInfo precompiled bundle if available in environment
let NetInfo: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const NetInfoModule = require('@react-native-community/netinfo/lib/commonjs');
  NetInfo = NetInfoModule.default || NetInfoModule;
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NetInfoModule = require('@react-native-community/netinfo');
    NetInfo = NetInfoModule.default || NetInfoModule;
  } catch {
    // NetInfo will gracefully fallback to Web / AppState / Heartbeat listeners
  }
}

export type SyncActionType =
  | 'CREATE_RECEIPT'
  | 'ADD_PRODUCT'
  | 'LOG_RESTOCK'
  | 'UPDATE_BUSINESS'
  | 'RECORD_DEBT_REPAYMENT';

export interface SyncQueueItem {
  id: string;
  type: SyncActionType;
  tempEntityId?: string;
  payload: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

let isProcessing = false;

// ─── Persistent ID Map (Survives app restarts) ────────────────────────────────

export async function getPersistentIdMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(ID_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function savePersistentIdMap(map: Record<string, string>): Promise<void> {
  try {
    await AsyncStorage.setItem(ID_MAP_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('[SyncEngine] Failed to save ID map:', err);
  }
}

// ─── Queue Management ─────────────────────────────────────────────────────────

export async function getPendingQueue(): Promise<SyncQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function savePendingQueue(queue: SyncQueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    useSyncStore.getState().setPendingCount(queue.length);
  } catch (err) {
    console.error('[SyncEngine] Failed to save sync queue:', err);
  }
}

export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    await AsyncStorage.removeItem(ID_MAP_KEY);
    useSyncStore.getState().setPendingCount(0);
  } catch (err) {
    console.error('[SyncEngine] Failed to clear sync queue:', err);
  }
}

export async function enqueueSyncAction(
  type: SyncActionType,
  payload: any,
  tempEntityId?: string,
): Promise<void> {
  const queue = await getPendingQueue();

  // Prevent duplicate enqueue if the exact same entity is already in the queue
  if (tempEntityId && queue.some((item) => item.tempEntityId === tempEntityId)) {
    return;
  }

  const item: SyncQueueItem = {
    id: generateId('sync_item'),
    type,
    tempEntityId,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  const updatedQueue = [...queue, item];
  await savePendingQueue(updatedQueue);

  // If online, attempt background sync immediately
  if (useSyncStore.getState().isOnline) {
    processSyncQueue().catch(() => {});
  }
}

// ─── Production-Grade Atomic Batch Sync Processor ────────────────────────────

export async function processSyncQueue(): Promise<void> {
  if (isProcessing) return;
  // Acquire mutex immediately and synchronously
  isProcessing = true;
  useSyncStore.getState().setIsSyncing(true);

  try {
    const queue = await getPendingQueue();
    if (queue.length === 0) {
      useSyncStore.getState().setPendingCount(0);
      return;
    }

    const persistentIdMap = await getPersistentIdMap();

    const productsToSync: any[] = [];
    const restocksToSync: any[] = [];
    const receiptsToSync: any[] = [];
    const repaymentsToSync: any[] = [];
    const businessUpdatesToSync: SyncQueueItem[] = [];

    // Deduplicate by tempEntityId / receiptNumber to prevent duplicate payloads
    const seenTempIds = new Set<string>();

    for (const item of queue) {
      if (item.tempEntityId) {
        if (seenTempIds.has(item.tempEntityId)) continue;
        seenTempIds.add(item.tempEntityId);
      }

      if (item.type === 'ADD_PRODUCT') {
        productsToSync.push({
          clientTempId: item.tempEntityId || item.id,
          name: item.payload.name,
          category: item.payload.category,
          qrCode: item.payload.qrCode,
          costPrice: Number(item.payload.costPrice) || 0,
          sellingPrice: Number(item.payload.sellingPrice) || 0,
          openingStock: parseInt(item.payload.openingStock, 10) || 0,
          reorderLevel: parseInt(item.payload.reorderLevel, 10) || 5,
        });
      } else if (item.type === 'LOG_RESTOCK') {
        const resolvedProdId =
          persistentIdMap[item.payload.productId] || item.payload.productId;
        restocksToSync.push({
          clientTempId: item.tempEntityId || item.id,
          productId: resolvedProdId,
          qty: item.payload.qty,
          costPerUnit: Number(item.payload.costPerUnit) || 0,
          date: item.payload.date ? formatYMD(item.payload.date) : formatYMD(),
          notes: item.payload.notes,
        });
      } else if (item.type === 'CREATE_RECEIPT') {
        const items = Array.isArray(item.payload.items)
          ? item.payload.items.map((i: any) => ({
              productId: persistentIdMap[i.productId] || i.productId,
              qty: i.qty,
            }))
          : [];
        receiptsToSync.push({
          receiptNumber: item.payload.receiptNumber,
          customerName: item.payload.customerName || 'Walk-in Customer',
          customerPhone: item.payload.customerPhone,
          items,
          paymentMethod: item.payload.paymentMethod,
          soldBy: item.payload.soldBy,
          notes: item.payload.notes,
          date: item.payload.date ? formatYMD(item.payload.date) : formatYMD(),
          discount: item.payload.discount ? Number(item.payload.discount) : undefined,
        });
      } else if (item.type === 'RECORD_DEBT_REPAYMENT') {
        repaymentsToSync.push({
          clientTempId: item.tempEntityId || item.id,
          receiptId: item.payload.receiptId,
          customerPhone: item.payload.customerPhone,
          customerName: item.payload.customerName,
          amount: Number(item.payload.amount) || 0,
          paymentMethod: item.payload.paymentMethod || 'Cash',
          date: item.payload.date ? formatYMD(item.payload.date) : formatYMD(),
          note: item.payload.note,
        });
      } else if (item.type === 'UPDATE_BUSINESS') {
        businessUpdatesToSync.push(item);
      }
    }

    let syncedProductIds: Record<string, string> = {};
    let syncedRestockTempIds: string[] = [];
    let syncedReceiptNumbers: string[] = [];
    let syncedRepaymentTempIds: string[] = [];

    // 1. Process batch sync if there are products, restocks, receipts, or repayments
    if (
      productsToSync.length > 0 ||
      restocksToSync.length > 0 ||
      receiptsToSync.length > 0 ||
      repaymentsToSync.length > 0
    ) {
      const batchPayload = {
        products: productsToSync,
        restocks: restocksToSync,
        receipts: receiptsToSync,
        repayments: repaymentsToSync,
      };

      const { data } = await apiClient.post('/sync', batchPayload);

      if (data?.syncedProductIds && Object.keys(data.syncedProductIds).length > 0) {
        syncedProductIds = data.syncedProductIds;
        Object.assign(persistentIdMap, syncedProductIds);
        await savePersistentIdMap(persistentIdMap);
        await remapCachedProductIds(syncedProductIds);
      }
      if (Array.isArray(data?.syncedRestockTempIds)) {
        syncedRestockTempIds = data.syncedRestockTempIds;
      }
      if (Array.isArray(data?.syncedReceiptNumbers)) {
        syncedReceiptNumbers = data.syncedReceiptNumbers;
      }
      if (Array.isArray(data?.syncedRepaymentTempIds)) {
        syncedRepaymentTempIds = data.syncedRepaymentTempIds;
      }
    }

    // 2. Process business updates (if any)
    const syncedBusinessIds: string[] = [];
    for (const bItem of businessUpdatesToSync) {
      try {
        await apiClient.patch('/business/me', bItem.payload);
        syncedBusinessIds.push(bItem.id);
      } catch (bErr) {
        console.error('[SyncEngine] Business update sync failed:', bErr);
      }
    }

    // 3. Filter acknowledged items out of the pending queue (Never blindly drop!)
    const remainingQueue = queue.filter((item) => {
      if (item.type === 'ADD_PRODUCT') {
        const tempId = item.tempEntityId || item.id;
        return !syncedProductIds[tempId];
      }
      if (item.type === 'LOG_RESTOCK') {
        const tempId = item.tempEntityId || item.id;
        return !syncedRestockTempIds.includes(tempId);
      }
      if (item.type === 'CREATE_RECEIPT') {
        return !syncedReceiptNumbers.includes(item.payload?.receiptNumber);
      }
      if (item.type === 'RECORD_DEBT_REPAYMENT') {
        const tempId = item.tempEntityId || item.id;
        return !syncedRepaymentTempIds.includes(tempId);
      }
      if (item.type === 'UPDATE_BUSINESS') {
        return !syncedBusinessIds.includes(item.id);
      }
      return false;
    });

    await savePendingQueue(remainingQueue);

    const initialTotal = queue.length;
    const syncedCount = initialTotal - remainingQueue.length;

    if (syncedCount > 0) {
      useSyncStore.getState().setLastSyncedAt(new Date());

      // Refresh local store from cloud to synchronize IDs and authoritative calculations
      const { useAppDataStore } = await import('@/store/AppDataStore');
      await useAppDataStore.getState().refresh();

      Toast.show({
        type: 'success',
        text1: 'Cloud Sync Complete',
        text2: `Successfully synced ${syncedCount} offline record${syncedCount > 1 ? 's' : ''}.`,
      });
    }
  } catch (err: any) {
    console.error('[SyncEngine] Batch sync error:', err);

    const isNetworkError =
      !err?.response ||
      err?.code === 'ECONNABORTED' ||
      err?.message?.includes('Network Error');

    if (isNetworkError) {
      useSyncStore.getState().setIsOnline(false);
    } else {
      // Server error or validation failure — keep records safe in storage, do NOT delete
      console.warn(
        '[SyncEngine] Server responded with error during batch sync:',
        err?.response?.data || err.message,
      );
    }
  } finally {
    isProcessing = false;
    useSyncStore.getState().setIsSyncing(false);
    const remaining = await getPendingQueue();
    useSyncStore.getState().setPendingCount(remaining.length);
  }
}

// ─── Network & Background Synchronization Listeners ──────────────────────────

export function startNetworkSyncListener(): () => void {
  // 1. Initial check on queue count
  getPendingQueue().then((q) => {
    useSyncStore.getState().setPendingCount(q.length);
  });

  const cleanupFunctions: (() => void)[] = [];

  // 2. Fetch initial network state immediately
  if (NetInfo?.fetch) {
    NetInfo.fetch()
      .then((state: any) => {
        const isOnline = Boolean(
          state.isConnected &&
            (state.isInternetReachable === null || state.isInternetReachable === true),
        );
        useSyncStore.getState().setIsOnline(isOnline);
        if (isOnline) {
          processSyncQueue().catch(() => {});
        }
      })
      .catch(() => {});
  }

  // 3. Native NetInfo listener (if available)
  if (NetInfo?.addEventListener) {
    try {
      const netInfoUnsubscribe = NetInfo.addEventListener((state: any) => {
        const isOnline = Boolean(
          state.isConnected &&
            (state.isInternetReachable === null || state.isInternetReachable === true),
        );

        useSyncStore.getState().setIsOnline(isOnline);

        if (isOnline) {
          processSyncQueue().catch((err) => {
            console.error('[SyncEngine] Auto-sync failed:', err);
          });
        }
      });
      cleanupFunctions.push(netInfoUnsubscribe);
    } catch (err) {
      console.warn('[SyncEngine] NetInfo listener setup warning:', err);
    }
  }

  // 4. Web browser events (for Expo web support)
  if (typeof window !== 'undefined' && window.addEventListener) {
    const handleOnline = () => {
      useSyncStore.getState().setIsOnline(true);
      processSyncQueue().catch(() => {});
    };
    const handleOffline = () => {
      useSyncStore.getState().setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    cleanupFunctions.push(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  }

  // 5. Periodic polling / heartbeat check (triggers every 10s if pending items exist)
  const heartbeatInterval = setInterval(() => {
    if (NetInfo?.fetch) {
      NetInfo.fetch()
        .then((state: any) => {
          const isOnline = Boolean(
            state.isConnected &&
              (state.isInternetReachable === null || state.isInternetReachable === true),
          );
          useSyncStore.getState().setIsOnline(isOnline);
          if (isOnline && useSyncStore.getState().pendingCount > 0) {
            processSyncQueue().catch(() => {});
          }
        })
        .catch(() => {});
    } else if (useSyncStore.getState().pendingCount > 0) {
      processSyncQueue().catch(() => {});
    }
  }, 10000);

  cleanupFunctions.push(() => clearInterval(heartbeatInterval));

  return () => {
    cleanupFunctions.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  };
}
