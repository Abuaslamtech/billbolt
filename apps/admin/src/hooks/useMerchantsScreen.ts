import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface MerchantOverview {
  id: string;
  name: string;
  type?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  ownerRole: string;
  storesCount: number;
  productsCount: number;
  receiptsCount: number;
  totalRevenue: number;
  createdAt: string;
  status: 'ACTIVE' | 'PENDING';
  stores?: { id: string; name: string; location?: string | null; isDefault?: boolean }[];
}

export function useMerchantsScreen(searchQuery: string = '') {
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantOverview | null>(null);
  const [tierFilter, setTierFilter] = useState<'ALL' | 'ACTIVE' | 'VERIFIED'>('ALL');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'merchants', { search: searchQuery }],
    queryFn: async () => {
      // 1. Try dedicated Admin Module endpoint
      try {
        const adminRes = await apiClient.get<any>(
          `/admin/merchants?search=${encodeURIComponent(searchQuery)}`
        );
        if (adminRes && Array.isArray(adminRes.items)) {
          return adminRes.items.map((b: any) => ({
            id: b.id,
            name: b.name,
            type: b.type,
            address: b.address,
            phone: b.phone || b.owner?.phone,
            email: b.email || b.owner?.email,
            currency: b.currency || '₦',
            ownerName: b.owner?.fullName || 'Business Owner',
            ownerEmail: b.owner?.email || '',
            ownerPhone: b.owner?.phone || '',
            ownerRole: b.owner?.role || 'USER',
            storesCount: b._count?.stores ?? 1,
            productsCount: b._count?.products ?? 0,
            receiptsCount: b._count?.receipts ?? 0,
            totalRevenue: b.totalRevenue ?? 0,
            createdAt: b.createdAt,
            status: 'ACTIVE' as const,
          }));
        }
      } catch {
        // Fallback for pre-deployment
      }

      // 2. Fallback to /business/me
      try {
        const business = await apiClient.get<any>('/business/me');
        if (business && business.id) {
          return [
            {
              id: business.id,
              name: business.name,
              type: business.type,
              address: business.address,
              phone: business.phone,
              email: business.email,
              currency: business.currency || '₦',
              ownerName: 'Current Account',
              ownerEmail: business.email || '',
              ownerPhone: business.phone || '',
              ownerRole: 'ADMIN',
              storesCount: 1,
              productsCount: 0,
              receiptsCount: 0,
              totalRevenue: 0,
              createdAt: business.createdAt,
              status: 'ACTIVE' as const,
            },
          ];
        }
      } catch {
        // empty
      }

      return [] as MerchantOverview[];
    },
    refetchInterval: 1000 * 30,
  });

  const merchants = data || [];

  return {
    merchants,
    selectedMerchant,
    setSelectedMerchant,
    tierFilter,
    setTierFilter,
    isLoading,
    error: error ? (error as any).message : null,
    refetch: () => {
      refetch();
    },
  };
}
