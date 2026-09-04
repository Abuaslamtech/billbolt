import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;

  setIsOnline: (online: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncedAt: (date: Date) => void;
  triggerSync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,

  setIsOnline: (isOnline) => set({ isOnline }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  triggerSync: async () => {
    const { processSyncQueue } = await import('@/services/sync/syncEngine');
    await processSyncQueue();
  },
}));
