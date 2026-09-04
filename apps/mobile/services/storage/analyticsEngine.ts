import { apiClient } from '@/lib/apiClient';
import {
  CycleSummary,
  DashboardMetrics,
  GroupedCycleSummary,
  ProductPerformance,
} from '@/types/models';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await apiClient.get('/analytics/dashboard');
  return data;
}

export async function getProductPerformanceList(): Promise<ProductPerformance[]> {
  const { data } = await apiClient.get('/analytics/top-products');
  return data;
}

export async function getMonthlyCycleSummaries(): Promise<CycleSummary[]> {
  const { data } = await apiClient.get('/analytics/cycles');
  return data;
}

export async function getGroupedCycleSummaries(months?: number): Promise<GroupedCycleSummary[]> {
  // ponytail: grouped view derived client-side from flat cycle data
  const summaries = await getMonthlyCycleSummaries();
  if (months && typeof months === 'number') {
    return summaries.slice(0, months) as any;
  }
  return summaries as any;
}
