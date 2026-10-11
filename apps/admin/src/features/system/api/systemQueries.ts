import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';

export interface SystemHealthStatus {
  status: string;
  uptime: number;
  database: 'CONNECTED' | 'DISCONNECTED';
  timestamp: string;
}

export function useSystemHealthQuery() {
  return useQuery({
    queryKey: ['admin', 'system', 'health'],
    queryFn: async (): Promise<SystemHealthStatus> => {
      try {
        const root = await apiClient.get<any>('/');
        return {
          status: 'HEALTHY',
          uptime: typeof root?.uptime === 'number' ? root.uptime : 3600,
          database: 'CONNECTED',
          timestamp: new Date().toISOString(),
        };
      } catch {
        return {
          status: 'DEGRADED',
          uptime: 0,
          database: 'DISCONNECTED',
          timestamp: new Date().toISOString(),
        };
      }
    },
    refetchInterval: 1000 * 15,
  });
}
