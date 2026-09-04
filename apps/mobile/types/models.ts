export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  category?: string;
  qrCode?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  openingStock: number;
  createdAt: string;
}

export interface ProductWithStock extends Product {
  totalSold: number;
  totalRestocked: number;
  currentStock: number;
  status: StockStatus;
}

export interface Sale {
  id: string;
  date: string;
  cycle: string; // YYYY-MM-DD cycle start marker (e.g. 14th of month)
  productId: string;
  productName: string;
  qty: number;
  soldBy?: string;
  unitPrice: number;
  unitCost: number;
  discount?: number;
  revenue: number;
  cost: number;
  profit: number;
  receiptId?: string;
  customerName?: string;
  createdAt: string;
}

export interface Restock {
  id: string;
  date: string;
  cycle: string;
  productId: string;
  productName: string;
  qty: number;
  costPerUnit: number;
  totalCost: number;
  notes?: string;
  createdAt: string;
}

export interface ReceiptItem {
  productId: string;
  productName: string;
  qty: number;
  quantity?: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface Receipt {
  id: string;
  receiptNumber?: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod?: 'Cash' | 'Transfer' | 'Card' | 'Other';
  soldBy?: string;
  notes?: string;
  createdAt: string;
}

export interface CycleSummary {
  cycle: string; // YYYY-MM-DD
  label: string; // e.g. "14 Jul 2026 - 13 Aug 2026"
  revenue: number;
  cost: number;
  profit: number;
  unitsSold: number;
  restockSpend: number;
  margin: number | null; // profit / revenue
}

export interface GroupedCycleSummary {
  periodCovered: string;
  revenue: number;
  cost: number;
  profit: number;
  unitsSold: number;
  margin: number | null;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category?: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalUnitsSold: number;
  margin: number | null;
  currentStock: number;
  status: StockStatus;
}

export interface DashboardMetrics {
  todaySales: number;
  yesterdaySales?: number;
  todaySalesGrowth: number; // percentage vs yesterday
  thisMonthRevenue: number;
  thisMonthProfit: number;
  thisMonthGrowth: number; // percentage vs last cycle
  totalReceiptsCount: number;
  totalCustomersCount: number;
  productsTracked: number;
  needReorderCount: number;
  outOfStockCount: number;
  currentCycleLabel: string;
}
