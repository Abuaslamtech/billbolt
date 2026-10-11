import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import type {
  DashboardMetricsResponse,
  TopProductItem,
  ReceiptResponse,
} from '../types/models';

export function useDashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<ReceiptResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [metricsData, productsData, receiptsData] = await Promise.all([
        apiClient.get<DashboardMetricsResponse>('/analytics/dashboard'),
        apiClient.get<TopProductItem[]>('/analytics/top-products').catch(() => []),
        apiClient
          .get<{ receipts: ReceiptResponse[] }>('/receipts?page=1&limit=8')
          .catch(() => ({ receipts: [] })),
      ]);

      setMetrics(metricsData);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
      setRecentReceipts(
        Array.isArray(receiptsData?.receipts) ? receiptsData.receipts : []
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics from Billbolt API');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    topProducts,
    recentReceipts,
    isLoading,
    error,
    refetch: fetchData,
  };
}
