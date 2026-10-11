export type { Business, User, Product, Store, SaleItem } from '@billbolt/types';

export type ScreenTab = 'dashboard' | 'merchants' | 'receipts' | 'inventory' | 'system';

export interface DashboardMetricsResponse {
  todaySales: number;
  yesterdaySales: number;
  todaySalesGrowth: number;
  thisMonthRevenue: number;
  totalReceiptsCount: number;
  totalCustomersCount: number;
  needReorderCount: number;
  outOfStockCount: number;
  todayCash: number;
  todayTransfer: number;
  todayCard: number;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface ReceiptItemResponse {
  id: string;
  productId: string;
  qty: number;
  price: number;
  total: number;
  product?: {
    id: string;
    name: string;
    sellingPrice: number;
  };
}

export interface ReceiptResponse {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone?: string | null;
  total: number;
  amountPaid: number;
  paymentMethod: string;
  date: string;
  createdAt: string;
  items?: ReceiptItemResponse[];
}

export interface InventoryProductResponse {
  id: string;
  name: string;
  category?: string | null;
  sellingPrice: number;
  costPrice: number;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  qrCode?: string | null;
}

export interface BusinessResponse {
  id: string;
  name: string;
  type?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  logoUrl?: string | null;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  credit: number;
  business?: BusinessResponse | null;
}
