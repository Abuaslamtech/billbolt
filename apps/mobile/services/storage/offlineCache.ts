import AsyncStorage from '@react-native-async-storage/async-storage';
export interface BusinessInfo {
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  logoUrl?: string | null;
}

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: '',
  type: '',
  phone: '',
  email: '',
  address: '',
  currency: '₦',
  logoUrl: null,
};
import {
  ProductWithStock,
  Receipt,
  ReceiptItem,
  Restock,
  Sale,
  DashboardMetrics,
  StockStatus,
} from '@/types/models';
import { cycleKey, generateId, generateCleanReceiptNumber } from './cycleUtils';
import { useAuthStore } from '@/store/authStore';

const KEYS = {
  PRODUCTS: '@billbolt_cache_products',
  SALES: '@billbolt_cache_sales',
  RESTOCKS: '@billbolt_cache_restocks',
  RECEIPTS: '@billbolt_cache_receipts',
  BUSINESS: '@billbolt_cache_business',
  METRICS: '@billbolt_cache_metrics',
};

// ─── Generic JSON Storage Helpers ─────────────────────────────────────────────

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function save<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[OfflineCache] Failed to save ${key}:`, err);
  }
}

// ─── Getters & Setters ────────────────────────────────────────────────────────

export async function getCachedProducts(): Promise<ProductWithStock[]> {
  return load<ProductWithStock[]>(KEYS.PRODUCTS, []);
}

export async function setCachedProducts(products: ProductWithStock[]): Promise<void> {
  await save(KEYS.PRODUCTS, products);
}

export async function getCachedSales(): Promise<Sale[]> {
  return load<Sale[]>(KEYS.SALES, []);
}

export async function setCachedSales(sales: Sale[]): Promise<void> {
  await save(KEYS.SALES, sales);
}

export async function getCachedRestocks(): Promise<Restock[]> {
  return load<Restock[]>(KEYS.RESTOCKS, []);
}

export async function setCachedRestocks(restocks: Restock[]): Promise<void> {
  await save(KEYS.RESTOCKS, restocks);
}

export async function getCachedReceipts(): Promise<Receipt[]> {
  return load<Receipt[]>(KEYS.RECEIPTS, []);
}

export async function setCachedReceipts(receipts: Receipt[]): Promise<void> {
  await save(KEYS.RECEIPTS, receipts);
}

export async function getCachedBusinessInfo(): Promise<BusinessInfo> {
  return load<BusinessInfo>(KEYS.BUSINESS, DEFAULT_BUSINESS_INFO);
}

export async function setCachedBusinessInfo(info: BusinessInfo): Promise<void> {
  await save(KEYS.BUSINESS, info);
}

export async function getCachedMetrics(): Promise<DashboardMetrics | null> {
  return load<DashboardMetrics | null>(KEYS.METRICS, null);
}

export async function setCachedMetrics(metrics: DashboardMetrics): Promise<void> {
  await save(KEYS.METRICS, metrics);
}

// ─── Local Stock Recalculation Helper ─────────────────────────────────────────

function computeStatus(currentStock: number, reorderLevel: number): StockStatus {
  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock <= reorderLevel) return 'Low Stock';
  return 'In Stock';
}

// ─── Local Offline Mutations ──────────────────────────────────────────────────

import { generateProductSku } from '@/lib/qr/qrGenerator';

export async function createOfflineProduct(input: {
  name: string;
  category?: string;
  qrCode?: string;
  costPrice: number;
  sellingPrice: number;
  openingStock: number;
  reorderLevel: number;
}): Promise<ProductWithStock> {
  const products = await getCachedProducts();
  const tempId = generateId('temp_prod');
  const now = new Date().toISOString();
  const generatedQrCode = input.qrCode || generateProductSku(input.name);

  const newProduct: ProductWithStock = {
    id: tempId,
    name: input.name,
    category: input.category,
    qrCode: generatedQrCode,
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    openingStock: input.openingStock,
    reorderLevel: input.reorderLevel,
    totalSold: 0,
    totalRestocked: 0,
    currentStock: input.openingStock,
    status: computeStatus(input.openingStock, input.reorderLevel),
    createdAt: now,
  };

  const updatedProducts = [newProduct, ...products];
  await setCachedProducts(updatedProducts);
  return newProduct;
}

export async function createOfflineRestock(input: {
  productId: string;
  qty: number;
  costPerUnit: number;
  date?: string;
  notes?: string;
}): Promise<Restock> {
  const [products, restocks] = await Promise.all([
    getCachedProducts(),
    getCachedRestocks(),
  ]);

  const targetProduct = products.find((p) => p.id === input.productId);
  const productName = targetProduct?.name || 'Product';
  const now = new Date();
  const dateStr = input.date ? input.date.split('T')[0] : now.toISOString().split('T')[0];
  const cycle = cycleKey(new Date(dateStr));
  const tempId = generateId('temp_restock');

  const newRestock: Restock = {
    id: tempId,
    productId: input.productId,
    productName,
    qty: input.qty,
    costPerUnit: input.costPerUnit,
    totalCost: input.qty * input.costPerUnit,
    date: dateStr,
    cycle,
    notes: input.notes,
    createdAt: now.toISOString(),
  };

  // Update cached restocks
  await setCachedRestocks([newRestock, ...restocks]);

  // Update product stock locally
  if (targetProduct) {
    const updatedProducts = products.map((p) => {
      if (p.id === input.productId) {
        const totalRestocked = p.totalRestocked + input.qty;
        const currentStock = p.currentStock + input.qty;
        return {
          ...p,
          totalRestocked,
          currentStock,
          status: computeStatus(currentStock, p.reorderLevel),
        };
      }
      return p;
    });
    await setCachedProducts(updatedProducts);
  }

  return newRestock;
}

export async function createOfflineReceipt(input: {
  customerName: string;
  customerPhone?: string;
  items: { productId: string; qty: number }[];
  paymentMethod?: Receipt['paymentMethod'];
  soldBy?: string;
  notes?: string;
  date?: string;
  discount?: number;
}): Promise<Receipt> {
  const [products, receipts, sales] = await Promise.all([
    getCachedProducts(),
    getCachedReceipts(),
    getCachedSales(),
  ]);

  const tempId = generateId('temp_rcpt');
  const now = new Date();
  const dateStr = input.date ? input.date.split('T')[0] : now.toISOString().split('T')[0];
  const cycle = cycleKey(new Date(dateStr));

  let subtotal = 0;
  const rawReceiptItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const unitPrice = product ? product.sellingPrice : 0;
    const unitCost = product ? product.costPrice : 0;
    const lineTotal = unitPrice * item.qty;
    const cost = unitCost * item.qty;
    subtotal += lineTotal;
    return {
      productId: item.productId,
      productName: product ? product.name : 'Unknown Product',
      qty: item.qty,
      unitPrice,
      unitCost,
      lineTotal,
      cost,
    };
  });

  const discountAmount = Math.max(0, Number(input.discount) || 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const seller = input.soldBy?.trim() || useAuthStore.getState().user?.fullName?.trim() || 'Owner';

  let allocatedDiscount = 0;
  const receiptItems: ReceiptItem[] = [];
  const newSales: Sale[] = [];

  for (let index = 0; index < rawReceiptItems.length; index++) {
    const item = rawReceiptItems[index];
    let itemDiscount = 0;
    if (discountAmount > 0 && subtotal > 0) {
      if (index === rawReceiptItems.length - 1) {
        itemDiscount = discountAmount - allocatedDiscount;
      } else {
        itemDiscount = Math.round((item.lineTotal / subtotal) * discountAmount);
        allocatedDiscount += itemDiscount;
      }
    }
    const netRevenue = Math.max(0, item.lineTotal - itemDiscount);

    receiptItems.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      discount: itemDiscount,
      total: netRevenue,
    });

    newSales.push({
      id: generateId('temp_sale'),
      date: dateStr,
      cycle,
      productId: item.productId,
      productName: item.productName,
      qty: item.qty,
      soldBy: seller,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      discount: itemDiscount,
      revenue: netRevenue,
      cost: item.cost,
      profit: netRevenue - item.cost,
      receiptId: tempId,
      customerName: input.customerName || 'Walk-in Customer',
      createdAt: now.toISOString(),
    });
  }

  const receipt: Receipt = {
    id: tempId,
    receiptNumber: generateCleanReceiptNumber(),
    date: dateStr,
    customerName: input.customerName || 'Walk-in Customer',
    customerPhone: input.customerPhone,
    items: receiptItems,
    subtotal,
    discount: discountAmount > 0 ? discountAmount : undefined,
    total: finalTotal,
    paymentMethod: input.paymentMethod || 'Cash',
    soldBy: seller,
    notes: input.notes,
    createdAt: now.toISOString(),
  };

  // Deduct stock for each item in local cache
  const updatedProducts = products.map((p) => {
    const cartItem = input.items.find((i) => i.productId === p.id);
    if (cartItem) {
      const totalSold = p.totalSold + cartItem.qty;
      const currentStock = p.currentStock - cartItem.qty;
      return {
        ...p,
        totalSold,
        currentStock,
        status: computeStatus(currentStock, p.reorderLevel),
      };
    }
    return p;
  });

  await Promise.all([
    setCachedReceipts([receipt, ...receipts]),
    setCachedSales([...newSales, ...sales]),
    setCachedProducts(updatedProducts),
  ]);

  return receipt;
}

export async function updateOfflineBusinessInfo(
  info: Partial<BusinessInfo>,
): Promise<BusinessInfo> {
  const current = await getCachedBusinessInfo();
  const updated: BusinessInfo = { ...current, ...info };
  await setCachedBusinessInfo(updated);
  return updated;
}

export async function clearOfflineCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PRODUCTS,
      KEYS.SALES,
      KEYS.RESTOCKS,
      KEYS.RECEIPTS,
      KEYS.BUSINESS,
      KEYS.METRICS,
    ]);
  } catch (err) {
    console.error('[OfflineCache] Failed to clear offline cache:', err);
  }
}
