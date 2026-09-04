// Fill these in after deploying the backend (see eimaan-backend/README.md).
export const API_BASE_URL = 'PASTE_YOUR_RAILWAY_URL_HERE'; // e.g. https://eimaan-api.up.railway.app
export const API_KEY = 'PASTE_YOUR_API_KEY_HERE'; // same value you set as API_KEY on Railway

export type SalePayload = { date: string; product: string; qty: number; soldBy?: string };
export type RestockPayload = { date: string; product: string; qty: number; costPerUnit: number };
export type ProductPayload = {
  name: string;
  category?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  openingStock?: number;
};

async function request<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  if (API_BASE_URL.includes('PASTE_YOUR')) {
    throw new Error('Set API_BASE_URL and API_KEY in src/api.ts first — see README.md');
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(json.message) ? json.message.join(', ') : json.message;
    throw new Error(message || `Request failed (${res.status})`);
  }
  return json as T;
}

export function fetchProducts(): Promise<string[]> {
  return request<string[]>('/products?namesOnly=1', 'GET');
}

export function submitSale(payload: SalePayload) {
  return request('/sales', 'POST', payload);
}

export function submitRestock(payload: RestockPayload) {
  return request('/restocks', 'POST', payload);
}

export function submitProduct(payload: ProductPayload) {
  return request('/products', 'POST', payload);
}

// Generic dispatcher used by the offline queue to replay any queued action.
export function callApiGeneric(action: string, data: Record<string, unknown>) {
  switch (action) {
    case 'submitSale':
      return submitSale(data as SalePayload);
    case 'submitRestock':
      return submitRestock(data as RestockPayload);
    case 'submitProduct':
      return submitProduct(data as ProductPayload);
    default:
      throw new Error('Unknown action: ' + action);
  }
}
