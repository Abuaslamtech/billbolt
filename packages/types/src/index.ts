/**
 * Shared domain models & interfaces across BillBolt API, Mobile, Admin & Landing
 */

export interface Business {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  currency: string;
  address?: string;
  logoUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface User {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'STAFF';
  phone?: string;
  createdAt: string | Date;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  category?: string;
  qrCode?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SaleItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface Sale {
  id: string;
  businessId: string;
  receiptNumber: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT' | 'Cash' | 'Transfer' | 'Card' | 'Other';
  totalAmount: number;
  items: SaleItem[];
  soldBy: string;
  saleDate: string | Date;
  isHistorical?: boolean;
  notes?: string;
  createdAt: string | Date;
}

export interface SyncBatchProduct {
  clientTempId: string;
  name: string;
  category?: string;
  qrCode?: string;
  costPrice: number;
  sellingPrice: number;
  openingStock: number;
  reorderLevel: number;
}

export interface SyncBatchRestock {
  clientTempId: string;
  productId: string;
  qty: number;
  costPerUnit: number;
  date?: string;
  notes?: string;
}

export interface SyncBatchReceiptItem {
  productId: string;
  qty: number;
}

export type PaymentStatus = 'paid' | 'unpaid' | 'partially_paid';

export interface DebtRepayment {
  id: string;
  receiptId?: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'Card' | 'Credit' | 'Other';
  date: string;
  note?: string;
  createdAt: string | Date;
}

export interface DebtorCustomerSummary {
  customerName: string;
  customerPhone: string;
  totalOwed: number;
  totalPaid: number;
  remainingBalance: number;
  receiptCount: number;
  latestReceiptDate: string;
  earliestDueDate?: string;
  isOverdue: boolean;
  receipts: Receipt[];
}

export interface Receipt {
  id: string;
  receiptNumber?: string;
  date: string;
  cycle?: string;
  customerName: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod?: 'Cash' | 'Transfer' | 'Card' | 'Credit' | 'Other';
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceOwed: number;
  dueDate?: string;
  repayments?: DebtRepayment[];
  soldBy?: string;
  notes?: string;
  createdAt: string | Date;
}

export interface SyncBatchReceipt {
  receiptNumber: string;
  customerName: string;
  customerPhone?: string;
  items: SyncBatchReceiptItem[];
  paymentMethod?: 'Cash' | 'Transfer' | 'Card' | 'Credit' | 'Other';
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  balanceOwed?: number;
  depositAmount?: number;
  dueDate?: string;
  soldBy?: string;
  notes?: string;
  date: string;
  discount?: number;
}

export interface SyncBatchRepayment {
  clientTempId: string;
  receiptId?: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Transfer' | 'Card' | 'Credit' | 'Other';
  date: string;
  note?: string;
}

export interface SyncBatchPayload {
  products?: SyncBatchProduct[];
  restocks?: SyncBatchRestock[];
  receipts?: SyncBatchReceipt[];
  repayments?: SyncBatchRepayment[];
}

export interface SyncBatchResponse {
  success: boolean;
  syncedProductIds: Record<string, string>;
  syncedRestockTempIds: string[];
  syncedReceiptNumbers: string[];
  syncedRepaymentTempIds?: string[];
  syncedAt: string;
}

export interface OutboxSyncItem {
  id: string;
  type: 'CREATE_SALE' | 'UPDATE_PRODUCT' | 'CREATE_CUSTOMER' | 'ADD_PRODUCT' | 'LOG_RESTOCK' | 'CREATE_RECEIPT' | 'UPDATE_BUSINESS' | 'RECORD_DEBT_REPAYMENT';
  payload: Record<string, any>;
  createdAt: number | string;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED';
  retryCount: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

