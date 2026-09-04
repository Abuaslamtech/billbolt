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

export interface Sale {
  id: string;
  businessId: string;
  receiptNumber: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';
  totalAmount: number;
  items: SaleItem[];
  soldBy: string;
  saleDate: string | Date;
  isHistorical?: boolean;
  notes?: string;
  createdAt: string | Date;
}

export interface OutboxSyncItem {
  id: string;
  type: 'CREATE_SALE' | 'UPDATE_PRODUCT' | 'CREATE_CUSTOMER';
  payload: Record<string, any>;
  createdAt: number;
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
