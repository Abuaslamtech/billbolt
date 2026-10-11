import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import type { BusinessResponse, UserResponse } from '../types/models';

export interface StoreItem {
  id: string;
  name: string;
  location?: string | null;
  isDefault: boolean;
  createdAt: string;
}

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
  ownerRole: string;
  stores: StoreItem[];
  createdAt: string;
}

export function useMerchantsScreen(searchQuery: string = '') {
  const [merchants, setMerchants] = useState<MerchantOverview[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [business, stores, user] = await Promise.all([
        apiClient.get<BusinessResponse>('/business/me'),
        apiClient.get<StoreItem[]>('/stores').catch(() => []),
        apiClient.get<UserResponse>('/users/me').catch(() => null),
      ]);

      if (business) {
        const item: MerchantOverview = {
          id: business.id,
          name: business.name,
          type: business.type,
          address: business.address,
          phone: business.phone || user?.phone,
          email: business.email || user?.email,
          currency: business.currency || '₦',
          ownerName: user?.fullName || 'Business Owner',
          ownerEmail: user?.email || '',
          ownerRole: user?.role || 'ADMIN',
          stores: Array.isArray(stores) ? stores : [],
          createdAt: business.createdAt,
        };
        setMerchants([item]);
      } else {
        setMerchants([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load merchant profile from backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const filteredMerchants = merchants.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery))
    );
  });

  return {
    merchants: filteredMerchants,
    selectedMerchant,
    setSelectedMerchant,
    isLoading,
    error,
    refetch: fetchMerchants,
  };
}
