import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import type { ReceiptResponse } from '../../../types/models';

export function useReceiptsQuery(search?: string) {
  return useQuery({
    queryKey: ['admin', 'receipts', { search: search || '' }],
    queryFn: async () => {
      const data = await apiClient.get<ReceiptResponse[]>('/receipts');
      const list = Array.isArray(data) ? data : [];
      if (!search || !search.trim()) return list;

      const q = search.toLowerCase();
      return list.filter(
        (r) =>
          r.receiptNumber?.toLowerCase().includes(q) ||
          r.customerName?.toLowerCase().includes(q) ||
          (r.customerPhone && r.customerPhone.toLowerCase().includes(q))
      );
    },
    refetchInterval: 1000 * 20,
  });
}
