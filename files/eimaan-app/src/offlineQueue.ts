import AsyncStorage from '@react-native-async-storage/async-storage';
import { callApiGeneric } from './api';

const QUEUE_KEY = 'eimaan_pending_queue_v1';

export type QueueItem = {
  id: string;
  action: 'submitSale' | 'submitRestock' | 'submitProduct';
  data: Record<string, unknown>;
  addedAt: string;
  label: string; // short human-readable description for the pending list
};

export async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueue(item: Omit<QueueItem, 'id' | 'addedAt'>) {
  const queue = await getQueue();
  queue.push({ ...item, id: Math.random().toString(36).slice(2), addedAt: new Date().toISOString() });
  await saveQueue(queue);
}

// Tries the API first; if it fails (no network, server error), queues it
// locally instead and returns 'queued' so the UI can tell the user.
export async function submitWithFallback(
  action: QueueItem['action'],
  data: Record<string, unknown>,
  label: string
): Promise<'synced' | 'queued'> {
  try {
    await callApiGeneric(action, data);
    return 'synced';
  } catch (e) {
    await enqueue({ action, data, label });
    return 'queued';
  }
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  const remaining: QueueItem[] = [];
  let synced = 0;
  for (const item of queue) {
    try {
      await callApiGeneric(item.action, item.data);
      synced++;
    } catch (e) {
      remaining.push(item);
    }
  }
  await saveQueue(remaining);
  return { synced, failed: remaining.length };
}
