import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { apiClient } from '@/lib/apiClient';
import { useSyncStore } from '@/store/syncStore';
import { generateId } from '@/services/storage/cycleUtils';

const SYNC_QUEUE_KEY = '@billbolt_sync_queue';

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
  | 'UPDATE_BUSINESS';

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

// ─── Queue Processor ──────────────────────────────────────────────────────────

export async function processSyncQueue(): Promise<void> {
  if (isProcessing) return;
  // Acquire mutex immediately and synchronously before any asynchronous pause
  isProcessing = true;
  useSyncStore.getState().setIsSyncing(true);

  let remainingQueue: SyncQueueItem[] = [];

  try {
    const queue = await getPendingQueue();
    if (queue.length === 0) {
      useSyncStore.getState().setPendingCount(0);
      return;
    }

    // Deduplicate by tempEntityId to prevent executing identical actions
    const seenTempIds = new Set<string>();
    const deduplicatedQueue: SyncQueueItem[] = [];
    for (const item of queue) {
      if (item.tempEntityId) {
        if (seenTempIds.has(item.tempEntityId)) continue;
        seenTempIds.add(item.tempEntityId);
      }
      deduplicatedQueue.push(item);
    }

    const initialCount = deduplicatedQueue.length;
    remainingQueue = [...deduplicatedQueue];
    const idMap: Record<string, string> = {}; // Maps tempId -> serverId

    while (remainingQueue.length > 0) {
      const currentItem = remainingQueue[0];

      try {
        if (currentItem.type === 'ADD_PRODUCT') {
          const { data } = await apiClient.post('/inventory/products', currentItem.payload);
          if (currentItem.tempEntityId && data?.id) {
            idMap[currentItem.tempEntityId] = data.id;
          }
        } else if (currentItem.type === 'LOG_RESTOCK') {
          const payload = { ...currentItem.payload };
          if (idMap[payload.productId]) {
            payload.productId = idMap[payload.productId];
          }
          await apiClient.post('/inventory/restocks', payload);
        } else if (currentItem.type === 'CREATE_RECEIPT') {
          const payload = { ...currentItem.payload };
          if (Array.isArray(payload.items)) {
            payload.items = payload.items.map((item: any) => ({
              ...item,
              productId: idMap[item.productId] || item.productId,
            }));
          }
          await apiClient.post('/receipts', payload);
        } else if (currentItem.type === 'UPDATE_BUSINESS') {
          await apiClient.patch('/business/me', currentItem.payload);
        }

        // Successfully synced this item -> remove from remaining queue
        remainingQueue.shift();
        await savePendingQueue(remainingQueue);
      } catch (err: any) {
        console.error(`[SyncEngine] Error syncing item ${currentItem.id}:`, err);

        const isNetworkError =
          !err?.response ||
          err?.code === 'ECONNABORTED' ||
          err?.message?.includes('Network Error');

        if (isNetworkError) {
          useSyncStore.getState().setIsOnline(false);
          // Break loop on network failure and retry when connection returns
          break;
        }

        // Non-network error (e.g. 400 Bad Request / Validation error)
        currentItem.retryCount += 1;
        currentItem.lastError = err?.response?.data?.message || err.message;

        if (currentItem.retryCount >= 3) {
          // Drop invalid items after 3 attempts to prevent stuck queue
          console.warn(`[SyncEngine] Dropping unrecoverable item ${currentItem.id}`);
          remainingQueue.shift();
          await savePendingQueue(remainingQueue);
        } else {
          break;
        }
      }
    }

    const syncedCount = initialCount - remainingQueue.length;
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
  } finally {
    isProcessing = false;
    useSyncStore.getState().setIsSyncing(false);
    useSyncStore.getState().setPendingCount(remainingQueue.length);
  }
}

// ─── Network & Background Synchronization Listeners ──────────────────────────

export function startNetworkSyncListener(): () => void {
  // 1. Initial check on queue count
  getPendingQueue().then((q) => {
    useSyncStore.getState().setPendingCount(q.length);
  });

  const cleanupFunctions: Array<() => void> = [];

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
