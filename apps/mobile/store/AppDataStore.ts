import { create } from 'zustand';
import {
  ProductWithStock,
  Sale,
  Restock,
  Receipt,
  DashboardMetrics,
  ProductPerformance,
  CycleSummary,
  DebtorCustomerSummary,
  DebtRepayment,
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
  recordDebtRepayment,
  getDebtRepayments,
  computeDebtorsSummary,
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
import { cycleLabel, businessCycleStart, cycleKey, formatYMD } from '@/services/storage/cycleUtils';

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
  frequentProducts: ProductWithStock[];
  cycleSummaries: CycleSummary[];
  debtors: DebtorCustomerSummary[];

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
    depositAmount?: number;
    dueDate?: string;
    soldBy?: string;
    notes?: string;
    date?: string;
    discount?: number;
  }) => Promise<Receipt>;
  recordRepayment: (input: {
    receiptId?: string;
    customerPhone: string;
    customerName: string;
    amount: number;
    paymentMethod?: 'Cash' | 'Transfer' | 'Card';
    date?: string;
    note?: string;
  }) => Promise<DebtRepayment>;
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
  frequentProducts: [],
  cycleSummaries: [],
  debtors: [],

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
        const todayStr = formatYMD(now);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatYMD(yesterday);

        const isDateToday = (dateVal?: string) => {
          if (!dateVal) return false;
          if (dateVal.startsWith(todayStr)) return true;
          try {
            return formatYMD(dateVal) === todayStr;
          } catch {
            return false;
          }
        };

        const isDateYesterday = (dateVal?: string) => {
          if (!dateVal) return false;
          if (dateVal.startsWith(yesterdayStr)) return true;
          try {
            return formatYMD(dateVal) === yesterdayStr;
          } catch {
            return false;
          }
        };

        // Receipts are primary source of truth; fall back to sales if empty
        const todayReceipts = receipts.filter((r) => isDateToday(r.date) || isDateToday(r.createdAt));
        const todaySalesRecords = sales.filter((s) => isDateToday(s.date) || isDateToday(s.createdAt));

        const todaySales = todayReceipts.length > 0
          ? todayReceipts.reduce((sum, r) => sum + r.total, 0)
          : todaySalesRecords.reduce((sum, s) => sum + s.revenue, 0);

        const yesterdayReceipts = receipts.filter((r) => isDateYesterday(r.date) || isDateYesterday(r.createdAt));
        const yesterdaySalesRecords = sales.filter((s) => isDateYesterday(s.date) || isDateYesterday(s.createdAt));
        const yesterdaySales = yesterdayReceipts.length > 0
          ? yesterdayReceipts.reduce((sum, r) => sum + r.total, 0)
          : yesterdaySalesRecords.reduce((sum, s) => sum + s.revenue, 0);

        let todaySalesGrowth = 0;
        if (yesterdaySales > 0) {
          todaySalesGrowth = Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100);
        } else if (todaySales > 0) {
          todaySalesGrowth = 100;
        }

        const currentCycleStart = businessCycleStart(now);
        const currentCycle = cycleKey(now);

        // Current cycle revenue: receipts are primary (matching backend); fall back to sales
        const cycleReceipts = receipts.filter(
          (r) => r.cycle === currentCycle || (r.date && cycleKey(r.date) === currentCycle),
        );
        const cycleSales = sales.filter((s) => s.cycle === currentCycle);

        const thisMonthRevenue = cycleReceipts.length > 0
          ? cycleReceipts.reduce((sum, r) => sum + r.total, 0)
          : cycleSales.reduce((sum, s) => sum + s.revenue, 0);
        const thisMonthProfit = cycleSales.reduce((sum, s) => sum + s.profit, 0);

        // Previous cycle revenue for month-over-month growth
        const prevCycleStart = new Date(currentCycleStart);
        prevCycleStart.setMonth(prevCycleStart.getMonth() - 1);
        const prevCycle = cycleKey(prevCycleStart);
        const prevCycleReceipts = receipts.filter(
          (r) => r.cycle === prevCycle || (r.date && cycleKey(r.date) === prevCycle),
        );
        const prevCycleSales = sales.filter((s) => s.cycle === prevCycle);
        const prevMonthRevenue = prevCycleReceipts.length > 0
          ? prevCycleReceipts.reduce((sum, r) => sum + r.total, 0)
          : prevCycleSales.reduce((sum, s) => sum + s.revenue, 0);

        let thisMonthGrowth = 0;
        if (prevMonthRevenue > 0) {
          thisMonthGrowth = Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
        } else if (thisMonthRevenue > 0) {
          thisMonthGrowth = 100;
        }

        const totalReceiptsCount = receipts.length;
        const totalCustomersCount = new Set(
          receipts.map((r) => r.customerName?.toLowerCase().trim()).filter(Boolean),
        ).size;

        const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;
        const needReorderCount = products.filter(
          (p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel,
        ).length;

        let todayCash = todayReceipts
          .filter((r) => r.paymentMethod === "Cash")
          .reduce((sum, r) => sum + (r.amountPaid !== undefined ? r.amountPaid : r.total), 0);
        let todayTransfer = todayReceipts
          .filter((r) => r.paymentMethod === "Transfer")
          .reduce((sum, r) => sum + (r.amountPaid !== undefined ? r.amountPaid : r.total), 0);
        let todayCard = todayReceipts
          .filter((r) => r.paymentMethod === "Card")
          .reduce((sum, r) => sum + (r.amountPaid !== undefined ? r.amountPaid : r.total), 0);

        // Include debt repayments collected today into cash flow
        const cachedRepayments = await getDebtRepayments();
        const todayRepayments = cachedRepayments.filter((rep) => isDateToday(rep.date) || isDateToday(rep.createdAt));
        const todayRepayCash = todayRepayments.filter((r) => r.paymentMethod === 'Cash').reduce((s, r) => s + r.amount, 0);
        const todayRepayTransfer = todayRepayments.filter((r) => r.paymentMethod === 'Transfer').reduce((s, r) => s + r.amount, 0);
        const todayRepayCard = todayRepayments.filter((r) => r.paymentMethod === 'Card').reduce((s, r) => s + r.amount, 0);
        todayCash += todayRepayCash;
        todayTransfer += todayRepayTransfer;
        todayCard += todayRepayCard;

        // Fallback: If todaySales > 0 but receipts had no paymentMethod or sales were from legacy sales array
        if (todaySales > 0 && todayCash === 0 && todayTransfer === 0 && todayCard === 0) {
          todayCash = todaySales;
        }

        const debtors = computeDebtorsSummary(receipts);
        const totalOutstandingDebt = debtors.reduce((sum, d) => sum + d.remainingBalance, 0);
        const totalDebtorsCount = debtors.length;
        const overdueDebtorsCount = debtors.filter((d) => d.isOverdue).length;

        metrics = {
          todaySales,
          yesterdaySales,
          todaySalesGrowth,
          thisMonthRevenue,
          thisMonthProfit,
          thisMonthGrowth,
          totalReceiptsCount,
          totalCustomersCount,
          productsTracked: products.length,
          needReorderCount,
          outOfStockCount,
          todayCash,
          todayTransfer,
          todayCard,
          totalDebtorsCount,
          totalOutstandingDebt,
          overdueDebtorsCount,
          currentCycle,
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

      // ─── Production-Grade Velocity Indexing: Calculate Frequent Products ───
      const salesCountMap = new Map<string, number>();
      receipts.forEach((r) => {
        (r.items || []).forEach((item) => {
          if (item.productId) {
            salesCountMap.set(item.productId, (salesCountMap.get(item.productId) || 0) + (item.quantity || (item as any).qty || 1));
          }
        });
      });
      sales.forEach((s) => {
        if (s.productId) {
          salesCountMap.set(s.productId, (salesCountMap.get(s.productId) || 0) + (s.qty || 1));
        }
      });

      const frequentProducts = products
        .filter((p) => p.currentStock > 0)
        .sort((a, b) => {
          const countA = salesCountMap.get(a.id) || 0;
          const countB = salesCountMap.get(b.id) || 0;
          if (countB !== countA) {
            return countB - countA;
          }
          // Cold-start tie breaker: rank highest in-stock items first
          return b.currentStock - a.currentStock;
        })
        .slice(0, 5);

      const debtors = computeDebtorsSummary(receipts);

      set({
        businessInfo,
        products,
        sales,
        restocks,
        receipts,
        debtors,
        metrics,
        topProducts,
        frequentProducts,
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

  recordRepayment: async (input) => {
    const rep = await recordDebtRepayment(input);
    await get().refresh();
    return rep;
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
      debtors: [],
      metrics: null,
      topProducts: [],
      frequentProducts: [],
      cycleSummaries: [],
    });
  },
}));
