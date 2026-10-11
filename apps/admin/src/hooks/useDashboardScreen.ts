import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface AdminDashboardData {
  totalPlatformRevenue: number;
  todayRevenue: number;
  todayReceiptsCount: number;
  totalReceiptsCount: number;
  totalMerchantsCount: number;
  totalProductsCount: number;
  totalUsersCount: number;
  paymentBreakdown: {
    cash: number;
    transfer: number;
    card: number;
    other: number;
  };
  recentReceipts: any[];
  topMerchants: any[];
  isGlobalAdmin: boolean;
}

export function useDashboardScreen() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard', 'overview'],
    queryFn: async (): Promise<AdminDashboardData> => {
      // 1. Try dedicated Admin Module endpoint first
      try {
        const adminData = await apiClient.get<any>('/admin/dashboard');
        if (adminData && typeof adminData.totalMerchantsCount === 'number') {
          return {
            totalPlatformRevenue: adminData.totalPlatformRevenue ?? 0,
            todayRevenue: adminData.todayRevenue ?? 0,
            todayReceiptsCount: adminData.todayReceiptsCount ?? 0,
            totalReceiptsCount: adminData.totalReceiptsCount ?? 0,
            totalMerchantsCount: adminData.totalMerchantsCount ?? 0,
            totalProductsCount: adminData.totalProductsCount ?? 0,
            totalUsersCount: adminData.totalUsersCount ?? 0,
            paymentBreakdown: adminData.paymentBreakdown ?? { cash: 0, transfer: 0, card: 0, other: 0 },
            recentReceipts: Array.isArray(adminData.recentReceipts) ? adminData.recentReceipts : [],
            topMerchants: Array.isArray(adminData.topMerchants) ? adminData.topMerchants : [],
            isGlobalAdmin: true,
          };
        }
      } catch {
        // Fallback for pre-deployment Render builds
      }

      // 2. Fallback to merchant-scoped routes
      const [metricsData, receiptsData] = await Promise.all([
        apiClient.get<any>('/analytics/dashboard').catch(() => null),
        apiClient.get<any>('/receipts?page=1&limit=8').catch(() => ({ receipts: [] })),
      ]);

      return {
        totalPlatformRevenue: metricsData?.thisMonthRevenue ?? 0,
        todayRevenue: metricsData?.todaySales ?? 0,
        todayReceiptsCount: metricsData?.todaySalesGrowth ?? 0,
        totalReceiptsCount: metricsData?.totalReceiptsCount ?? 0,
        totalMerchantsCount: 1,
        totalProductsCount: metricsData?.totalCustomersCount ?? 0,
        totalUsersCount: 1,
        paymentBreakdown: {
          cash: metricsData?.todayCash ?? 0,
          transfer: metricsData?.todayTransfer ?? 0,
          card: metricsData?.todayCard ?? 0,
          other: 0,
        },
        recentReceipts: Array.isArray(receiptsData?.receipts) ? receiptsData.receipts : [],
        topMerchants: [],
        isGlobalAdmin: false,
      };
    },
    refetchInterval: 1000 * 25,
  });

  return {
    dashboard: data,
    isLoading,
    error: error ? (error as any).message : null,
    refetch: () => {
      refetch();
    },
  };
}
