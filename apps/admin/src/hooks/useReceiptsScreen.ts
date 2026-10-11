import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { ReceiptResponse } from '../types/models';

export function useReceiptsScreen(searchQuery: string = '') {
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'Cash' | 'Transfer' | 'Card'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptResponse | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'receipts', { search: searchQuery }],
    queryFn: async () => {
      // 1. Try dedicated Admin Module endpoint
      try {
        const adminRes = await apiClient.get<any>(
          `/admin/receipts?search=${encodeURIComponent(searchQuery)}`
        );
        if (adminRes && Array.isArray(adminRes.items)) {
          return {
            receipts: adminRes.items as ReceiptResponse[],
            total: adminRes.total ?? adminRes.items.length,
          };
        }
      } catch {
        // Fallback for pre-deployment
      }

      // 2. Fallback to /receipts
      try {
        const res = await apiClient.get<any>('/receipts?page=1&limit=50');
        const list = Array.isArray(res?.receipts)
          ? res.receipts
          : Array.isArray(res)
          ? res
          : [];
        return {
          receipts: list as ReceiptResponse[],
          total: res?.total ?? list.length,
        };
      } catch {
        return { receipts: [], total: 0 };
      }
    },
    refetchInterval: 1000 * 20,
  });

  const rawReceipts = data?.receipts || [];
  const filteredReceipts = rawReceipts.filter((receipt) => {
    const matchesSearch =
      receipt.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.customerPhone && receipt.customerPhone.includes(searchQuery));

    const matchesMethod =
      methodFilter === 'ALL' ||
      receipt.paymentMethod?.toLowerCase() === methodFilter.toLowerCase();

    return matchesSearch && matchesMethod;
  });

  return {
    receipts: filteredReceipts,
    rawCount: data?.total || rawReceipts.length,
    methodFilter,
    setMethodFilter,
    selectedReceipt,
    setSelectedReceipt,
    isLoading,
    error: error ? (error as any).message : null,
    refetch: () => {
      refetch();
    },
  };
}
