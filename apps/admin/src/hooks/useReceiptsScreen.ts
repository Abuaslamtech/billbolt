import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import type { ReceiptResponse } from '../types/models';

export function useReceiptsScreen(searchQuery: string = '') {
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'Cash' | 'Transfer' | 'Card'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<{ receipts: ReceiptResponse[]; total: number }>(
        '/receipts?page=1&limit=50'
      );
      setReceipts(Array.isArray(data?.receipts) ? data.receipts : []);
      setTotalCount(data?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch receipts from backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod =
      methodFilter === 'ALL' ||
      receipt.paymentMethod.toLowerCase() === methodFilter.toLowerCase();

    return matchesSearch && matchesMethod;
  });

  return {
    receipts: filteredReceipts,
    rawCount: totalCount,
    methodFilter,
    setMethodFilter,
    isLoading,
    error,
    refetch: fetchReceipts,
  };
}
