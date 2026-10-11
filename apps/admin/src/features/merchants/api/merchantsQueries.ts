import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import type { BusinessResponse } from '../../../types/models';

export interface MerchantOverviewItem {
  id: string;
  name: string;
  ownerEmail: string;
  phone: string;
  country: string;
  tier: 'VERIFIED' | 'UNVERIFIED';
  status: 'ACTIVE' | 'SUSPENDED';
  totalRevenue: number;
  receiptCount: number;
  storesCount: number;
  createdAt: string;
}

export function useMerchantsQuery(search?: string) {
  return useQuery({
    queryKey: ['admin', 'merchants', { search: search || '' }],
    queryFn: async () => {
      try {
        const business = await apiClient.get<BusinessResponse>('/business/me');
        let stores: any[] = [];
        try {
          stores = await apiClient.get<any[]>('/stores');
        } catch {
          // No separate stores
        }

        if (business && business.id) {
          const merchant: MerchantOverviewItem = {
            id: business.id,
            name: business.name || 'Main Merchant Entity',
            ownerEmail: business.email || 'Registered Merchant',
            phone: business.phone || 'N/A',
            country: business.currency || 'NGN',
            tier: 'VERIFIED',
            status: 'ACTIVE',
            totalRevenue: 0,
            receiptCount: 0,
            storesCount: Array.isArray(stores) ? stores.length : 1,
            createdAt: business.createdAt || new Date().toISOString(),
          };
          const list = [merchant];
          if (!search || !search.trim()) return list;
          const q = search.toLowerCase();
          return list.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.ownerEmail.toLowerCase().includes(q)
          );
        }
      } catch {
        // empty
      }
      return [] as MerchantOverviewItem[];
    },
    refetchInterval: 1000 * 60,
  });
}
