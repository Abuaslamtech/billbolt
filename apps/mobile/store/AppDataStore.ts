import { create } from 'zustand';
import {
  ProductWithStock,
  Sale,
  Restock,
  Receipt,
  DashboardMetrics,
  ProductPerformance,
  CycleSummary,
} from '@/types/models';
import {
  initializeStorage,
  getProductsWithStock,
  getSales,
  getRestocks,
  getReceipts,
  addProduct,
  addRestock,
  createReceipt,
  getBusinessInfo,
  getUserProfile,
  saveBusinessInfo,
  BusinessInfo,
  DEFAULT_BUSINESS_INFO,
} from '@/services/storage/localStorage';
import {
  getDashboardMetrics,
  getProductPerformanceList,
  getMonthlyCycleSummaries,
} from '@/services/storage/analyticsEngine';
import { cycleLabel, businessCycleStart } from '@/services/storage/cycleUtils';

interface AppDataState {
  isInitialized: boolean;
  isLoading: boolean;
  businessInfo: BusinessInfo;
  products: ProductWithStock[];
  sales: Sale[];
  restocks: Restock[];
  receipts: Receipt[];
  metrics: DashboardMetrics | null;
  topProducts: ProductPerformance[];
  cycleSummaries: CycleSummary[];

  // Actions
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  addNewProduct: (input: {
    name: string;
    category?: string;
    qrCode?: string;
    costPrice: number;
    sellingPrice: number;
    openingStock: number;
    reorderLevel: number;
  }) => Promise<ProductWithStock>;
  logNewRestock: (input: {
    productId: string;
    qty: number;
    costPerUnit: number;
    notes?: string;
  }) => Promise<void>;
  createNewReceipt: (input: {
    customerName: string;
    customerPhone?: string;
    items: { productId: string; qty: number }[];
    paymentMethod?: Receipt['paymentMethod'];
    soldBy?: string;
    notes?: string;
    date?: string;
    discount?: number;
  }) => Promise<Receipt>;
  updateBusiness: (info: Partial<BusinessInfo>) => Promise<void>;
  reset: () => void;
}

export const useAppDataStore = create<AppDataState>((set, get) => ({
  isInitialized: false,
  isLoading: true,
  businessInfo: DEFAULT_BUSINESS_INFO,
  products: [],
  sales: [],
  restocks: [],
  receipts: [],
  metrics: null,
  topProducts: [],
  cycleSummaries: [],

  init: async () => {
    try {
      set({ isLoading: true });
      await initializeStorage();
      await get().refresh();
      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize app data:', error);
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    try {
      const results = await Promise.allSettled([
        getBusinessInfo(),
        getProductsWithStock(),
        getSales(),
        getRestocks(),
        getReceipts(),
        getDashboardMetrics(),
        getProductPerformanceList(),
        getMonthlyCycleSummaries(),
        getUserProfile(),
      ]);

      const [
        businessInfoRes,
        productsRes,
        salesRes,
        restocksRes,
        receiptsRes,
        metricsRes,
        topProductsRes,
        cycleSummariesRes,
      ] = results;

      const current = get();

      const businessInfo = businessInfoRes.status === 'fulfilled' ? businessInfoRes.value : current.businessInfo;
      const products = productsRes.status === 'fulfilled' ? productsRes.value : current.products;
      const sales = salesRes.status === 'fulfilled' ? salesRes.value : current.sales;
      const restocks = restocksRes.status === 'fulfilled' ? restocksRes.value : current.restocks;
      const receipts = receiptsRes.status === 'fulfilled' ? receiptsRes.value : current.receipts;
      let metrics = metricsRes.status === 'fulfilled' && metricsRes.value ? metricsRes.value : current.metrics;
      let topProducts = topProductsRes.status === 'fulfilled' && topProductsRes.value ? topProductsRes.value : current.topProducts;
      let cycleSummaries = cycleSummariesRes.status === 'fulfilled' && cycleSummariesRes.value ? cycleSummariesRes.value : current.cycleSummaries;

      // ─── Offline Fallback: Derive metrics if server analytics is unavailable ──
      if (!metrics || metricsRes.status !== 'fulfilled') {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Receipts are primary source of truth; fall back to sales if empty
        const todayReceipts = receipts.filter((r) => (r.date || r.createdAt)?.startsWith(todayStr));
        const todaySales = todayReceipts.length > 0
          ? todayReceipts.reduce((sum, r) => sum + r.total, 0)
          : sales.filter((s) => s.date?.startsWith(todayStr)).reduce((sum, s) => sum + s.revenue, 0);

        const yesterdayReceipts = receipts.filter((r) => (r.date || r.createdAt)?.startsWith(yesterdayStr));
        const yesterdaySales = yesterdayReceipts.length > 0
          ? yesterdayReceipts.reduce((sum, r) => sum + r.total, 0)
          : sales.filter((s) => s.date?.startsWith(yesterdayStr)).reduce((sum, s) => sum + s.revenue, 0);

        let todaySalesGrowth = 0;
        if (yesterdaySales > 0) {
          todaySalesGrowth = Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100);
        } else if (todaySales > 0) {
          todaySalesGrowth = 100;
        }

        const currentCycleStart = businessCycleStart(now);
        const thisMonthRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
        const thisMonthProfit = sales.reduce((sum, s) => sum + s.profit, 0);
        const totalReceiptsCount = receipts.length;
        const totalCustomersCount = new Set(
          receipts.map((r) => r.customerName?.toLowerCase().trim()).filter(Boolean),
        ).size;

        const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;
        const needReorderCount = products.filter(
          (p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel,
        ).length;

        metrics = {
          todaySales,
          yesterdaySales,
          todaySalesGrowth,
          thisMonthRevenue,
          thisMonthProfit,
          thisMonthGrowth: 0,
          totalReceiptsCount,
          totalCustomersCount,
          productsTracked: products.length,
          needReorderCount,
          outOfStockCount,
          currentCycleLabel: cycleLabel(currentCycleStart),
        };
      }

      // ─── Offline Fallback: Derive top products if empty ────────────────────
      if ((!topProducts || topProducts.length === 0) && products.length > 0) {
        topProducts = products.map((p) => {
          const prodSales = sales.filter((s) => s.productId === p.id);
          const totalRevenue = prodSales.reduce((sum, s) => sum + s.revenue, 0);
          const totalCost = prodSales.reduce((sum, s) => sum + s.cost, 0);
          const totalProfit = totalRevenue - totalCost;
          const totalUnitsSold = prodSales.reduce((sum, s) => sum + s.qty, 0);
          const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : null;

          return {
            productId: p.id,
            productName: p.name,
            category: p.category,
            totalRevenue,
            totalCost,
            totalProfit,
            totalUnitsSold,
            margin,
            currentStock: p.currentStock,
            status: p.status,
          };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
      }

      set({
        businessInfo,
        products,
        sales,
        restocks,
        receipts,
        metrics,
        topProducts,
        cycleSummaries,
      });
    } catch (error) {
      console.error('Failed to refresh data store:', error);
    }
  },

  addNewProduct: async (input) => {
    const product = await addProduct(input);
    await get().refresh();
    return product;
  },

  logNewRestock: async (input) => {
    await addRestock(input);
    await get().refresh();
  },

  createNewReceipt: async (input) => {
    const receipt = await createReceipt(input);
    await get().refresh();
    return receipt;
  },

  updateBusiness: async (info) => {
    const updated = await saveBusinessInfo(info);
    set({ businessInfo: updated });
  },

  reset: () => {
    set({
      isInitialized: false,
      isLoading: true,
      businessInfo: DEFAULT_BUSINESS_INFO,
      products: [],
      sales: [],
      restocks: [],
      receipts: [],
      metrics: null,
      topProducts: [],
      cycleSummaries: [],
    });
  },
}));
