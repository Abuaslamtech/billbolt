import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ProductWithStock,
  Receipt,
  ReceiptItem,
  Restock,
  Sale,
  DashboardMetrics,
  StockStatus,
  DebtRepayment,
  PaymentStatus,
} from "@/types/models";
import {
  cycleKey,
  generateId,
  generateCleanReceiptNumber,
  formatYMD,
} from "./cycleUtils";
import { useAuthStore } from "@/store/authStore";

import { generateProductSku } from "@/lib/qr/qrGenerator";
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
  name: "",
  type: "",
  phone: "",
  email: "",
  address: "",
  currency: "₦",
  logoUrl: null,
};

const KEYS = {
  PRODUCTS: "@billbolt_cache_products",
  SALES: "@billbolt_cache_sales",
  RESTOCKS: "@billbolt_cache_restocks",
  RECEIPTS: "@billbolt_cache_receipts",
  REPAYMENTS: "@billbolt_cache_repayments",
  BUSINESS: "@billbolt_cache_business",
  METRICS: "@billbolt_cache_metrics",
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

export async function setCachedProducts(
  products: ProductWithStock[],
): Promise<void> {
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

export async function getCachedRepayments(): Promise<DebtRepayment[]> {
  return load<DebtRepayment[]>(KEYS.REPAYMENTS, []);
}

export async function setCachedRepayments(
  repayments: DebtRepayment[],
): Promise<void> {
  await save(KEYS.REPAYMENTS, repayments);
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

export async function setCachedMetrics(
  metrics: DashboardMetrics,
): Promise<void> {
  await save(KEYS.METRICS, metrics);
}

// ─── Local Stock Recalculation Helper ─────────────────────────────────────────

function computeStatus(
  currentStock: number,
  reorderLevel: number,
): StockStatus {
  if (currentStock <= 0) return "Out of Stock";
  if (currentStock <= reorderLevel) return "Low Stock";
  return "In Stock";
}

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
  const tempId = generateId("temp_prod");
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
  const productName = targetProduct?.name || "Product";
  const now = new Date();
  const dateStr = formatYMD(input.date || now);
  const cycle = cycleKey(dateStr);
  const tempId = generateId("temp_restock");

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
          costPrice:
            input.costPerUnit !== undefined ? input.costPerUnit : p.costPrice,
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
  paymentMethod?: Receipt["paymentMethod"];
  depositAmount?: number;
  dueDate?: string;
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

  const tempId = generateId("temp_rcpt");
  const now = new Date();
  const dateStr = formatYMD(input.date || now);
  const cycle = cycleKey(dateStr);

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
      productName: product ? product.name : "Unknown Product",
      qty: item.qty,
      unitPrice,
      unitCost,
      lineTotal,
      cost,
    };
  });

  const discountAmount = Math.max(0, Number(input.discount) || 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const seller =
    input.soldBy?.trim() ||
    useAuthStore.getState().user?.fullName?.trim() ||
    "Owner";

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
      id: generateId("temp_sale"),
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
      customerName: input.customerName || "Walk-in Customer",
      createdAt: now.toISOString(),
    });
  }

  const isCredit = input.paymentMethod === "Credit";
  const depositAmount = isCredit
    ? Math.max(0, Math.min(finalTotal, Number(input.depositAmount) || 0))
    : finalTotal;
  const amountPaid = depositAmount;
  const balanceOwed = Math.max(0, finalTotal - amountPaid);
  const paymentStatus: PaymentStatus =
    balanceOwed <= 0 ? "paid" : amountPaid > 0 ? "partially_paid" : "unpaid";

  const initialRepayments: DebtRepayment[] =
    isCredit && depositAmount > 0
      ? [
          {
            id: generateId("temp_rep"),
            receiptId: tempId,
            customerPhone: input.customerPhone || "",
            customerName: input.customerName || "Walk-in Customer",
            amount: depositAmount,
            paymentMethod: "Cash",
            date: dateStr,
            note: "Initial deposit at checkout",
            createdAt: now.toISOString(),
          },
        ]
      : [];

  const receipt: Receipt = {
    id: tempId,
    receiptNumber: generateCleanReceiptNumber(),
    date: dateStr,
    cycle,
    customerName: input.customerName || "Walk-in Customer",
    customerPhone: input.customerPhone,
    items: receiptItems,
    subtotal,
    discount: discountAmount > 0 ? discountAmount : undefined,
    total: finalTotal,
    paymentMethod: input.paymentMethod || "Cash",
    paymentStatus,
    amountPaid,
    balanceOwed,
    depositAmount: isCredit ? depositAmount : undefined,
    dueDate: isCredit ? input.dueDate : undefined,
    repayments: initialRepayments,
    soldBy: seller,
    notes: input.notes,
    createdAt: now.toISOString(),
  };

  if (initialRepayments.length > 0) {
    const existingRepayments = await getCachedRepayments();
    await setCachedRepayments([...initialRepayments, ...existingRepayments]);
  }

  // Deduct stock for each item in local cache (aggregated by productId)
  const deductionMap = new Map<string, number>();
  for (const item of input.items) {
    deductionMap.set(
      item.productId,
      (deductionMap.get(item.productId) || 0) + item.qty,
    );
  }

  const updatedProducts = products.map((p) => {
    const qtySold = deductionMap.get(p.id);
    if (qtySold) {
      const totalSold = p.totalSold + qtySold;
      const currentStock = p.currentStock - qtySold;
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

export async function applyRestockToCachedProducts(
  productId: string,
  qty: number,
  costPrice?: number,
): Promise<void> {
  const products = await getCachedProducts();
  const updated = products.map((p) => {
    if (p.id === productId) {
      const totalRestocked = p.totalRestocked + qty;
      const currentStock = p.currentStock + qty;
      return {
        ...p,
        costPrice: costPrice !== undefined ? costPrice : p.costPrice,
        totalRestocked,
        currentStock,
        status: computeStatus(currentStock, p.reorderLevel),
      };
    }
    return p;
  });
  await setCachedProducts(updated);
}

export async function applySaleDeductionToCachedProducts(
  items: { productId: string; qty: number }[],
): Promise<void> {
  const products = await getCachedProducts();
  const deductionMap = new Map<string, number>();
  for (const item of items) {
    deductionMap.set(
      item.productId,
      (deductionMap.get(item.productId) || 0) + item.qty,
    );
  }

  const updated = products.map((p) => {
    const qtySold = deductionMap.get(p.id);
    if (qtySold) {
      const totalSold = p.totalSold + qtySold;
      const currentStock = p.currentStock - qtySold;
      return {
        ...p,
        totalSold,
        currentStock,
        status: computeStatus(currentStock, p.reorderLevel),
      };
    }
    return p;
  });
  await setCachedProducts(updated);
}

export async function recordSalesFromReceipt(receipt: Receipt): Promise<void> {
  if (!Array.isArray(receipt.items) || receipt.items.length === 0) return;
  const [products, existingSales] = await Promise.all([
    getCachedProducts(),
    getCachedSales(),
  ]);
  const productMap = new Map(products.map((p) => [p.id, p]));
  const now = new Date().toISOString();
  const newSales: Sale[] = receipt.items.map((item) => {
    const prod = productMap.get(item.productId);
    const unitCost = prod ? prod.costPrice : 0;
    const cost = unitCost * item.quantity;
    const revenue = item.total;
    const saleDate = formatYMD(receipt.date || new Date());
    return {
      id: generateId("sale"),
      date: saleDate,
      cycle: receipt.cycle || cycleKey(saleDate),
      productId: item.productId,
      productName: item.productName,
      qty: item.quantity,
      soldBy: receipt.soldBy || "Owner",
      unitPrice: item.unitPrice,
      unitCost,
      discount: item.discount || 0,
      revenue,
      cost,
      profit: revenue - cost,
      receiptId: receipt.id,
      customerName: receipt.customerName,
      createdAt: receipt.createdAt || now,
    };
  });
  await setCachedSales([...newSales, ...existingSales]);
}

export async function remapCachedProductIds(
  idMap: Record<string, string>,
): Promise<void> {
  if (!idMap || Object.keys(idMap).length === 0) return;
  const [products, restocks, sales, receipts] = await Promise.all([
    getCachedProducts(),
    getCachedRestocks(),
    getCachedSales(),
    getCachedReceipts(),
  ]);

  let productsModified = false;
  const updatedProducts = products.map((p) => {
    if (idMap[p.id]) {
      productsModified = true;
      return { ...p, id: idMap[p.id] };
    }
    return p;
  });

  let restocksModified = false;
  const updatedRestocks = restocks.map((r) => {
    if (idMap[r.productId]) {
      restocksModified = true;
      return { ...r, productId: idMap[r.productId] };
    }
    return r;
  });

  let salesModified = false;
  const updatedSales = sales.map((s) => {
    if (idMap[s.productId]) {
      salesModified = true;
      return { ...s, productId: idMap[s.productId] };
    }
    return s;
  });

  let receiptsModified = false;
  const updatedReceipts = receipts.map((rcpt) => {
    let itemModified = false;
    const items = rcpt.items.map((i) => {
      if (idMap[i.productId]) {
        itemModified = true;
        return { ...i, productId: idMap[i.productId] };
      }
      return i;
    });
    if (itemModified) {
      receiptsModified = true;
      return { ...rcpt, items };
    }
    return rcpt;
  });

  const promises: Promise<void>[] = [];
  if (productsModified) promises.push(setCachedProducts(updatedProducts));
  if (restocksModified) promises.push(setCachedRestocks(updatedRestocks));
  if (salesModified) promises.push(setCachedSales(updatedSales));
  if (receiptsModified) promises.push(setCachedReceipts(updatedReceipts));
  await Promise.all(promises);
}

export async function recordOfflineDebtRepayment(input: {
  receiptId?: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  paymentMethod?: "Cash" | "Transfer" | "Card";
  date?: string;
  note?: string;
}): Promise<DebtRepayment> {
  const now = new Date();
  const dateStr = input.date ? formatYMD(input.date) : formatYMD(now);
  const repId = generateId("temp_rep");

  const repayment: DebtRepayment = {
    id: repId,
    receiptId: input.receiptId,
    customerPhone: input.customerPhone,
    customerName: input.customerName,
    amount: input.amount,
    paymentMethod: input.paymentMethod || "Cash",
    date: dateStr,
    note: input.note,
    createdAt: now.toISOString(),
  };

  const [receipts, repayments] = await Promise.all([
    getCachedReceipts(),
    getCachedRepayments(),
  ]);

  let remaining = input.amount;
  const updatedReceipts = receipts.map((r) => {
    const isTarget = input.receiptId
      ? r.id === input.receiptId
      : (Boolean(r.customerPhone) && r.customerPhone === input.customerPhone) ||
        (Boolean(r.customerName) &&
          r.customerName.toLowerCase() === input.customerName.toLowerCase());

    if (isTarget && (r.balanceOwed || 0) > 0 && remaining > 0) {
      const curBal = r.balanceOwed || 0;
      const payNow = Math.min(remaining, curBal);
      const newPaid = (r.amountPaid || 0) + payNow;
      const newBal = Math.max(0, r.total - newPaid);
      remaining -= payNow;

      return {
        ...r,
        amountPaid: newPaid,
        balanceOwed: newBal,
        paymentStatus:
          newBal <= 0 ? ("paid" as const) : ("partially_paid" as const),
        repayments: [repayment, ...(r.repayments || [])],
      };
    }
    return r;
  });

  await Promise.all([
    setCachedReceipts(updatedReceipts),
    setCachedRepayments([repayment, ...repayments]),
  ]);

  return repayment;
}

export async function clearOfflineCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PRODUCTS,
      KEYS.SALES,
      KEYS.RESTOCKS,
      KEYS.RECEIPTS,
      KEYS.REPAYMENTS,
      KEYS.BUSINESS,
      KEYS.METRICS,
    ]);
  } catch (err) {
    console.error("[OfflineCache] Failed to clear offline cache:", err);
  }
}
