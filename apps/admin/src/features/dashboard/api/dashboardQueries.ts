import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import type { DashboardMetricsResponse, TopProductItem } from '../../../types/models';

export function useDashboardMetricsQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'metrics'],
    queryFn: async () => {
      try {
        const data = await apiClient.get<DashboardMetricsResponse>('/analytics/dashboard');
        return data;
      } catch {
        const fallback = await apiClient.get<any>('/analytics/cycles');
        return fallback;
      }
    },
    refetchInterval: 1000 * 30,
  });
}

export function useTopProductsQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'top-products'],
    queryFn: async () => {
      const data = await apiClient.get<TopProductItem[]>('/analytics/top-products');
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 1000 * 60,
  });
}
