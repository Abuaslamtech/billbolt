import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import type { InventoryProductResponse } from '../../../types/models';

export function useInventoryQuery(search?: string) {
  return useQuery({
    queryKey: ['admin', 'inventory', { search: search || '' }],
    queryFn: async () => {
      const data = await apiClient.get<InventoryProductResponse[]>('/inventory/products');
      const list = Array.isArray(data) ? data : [];
      if (!search || !search.trim()) return list;

      const q = search.toLowerCase();
      return list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    },
    refetchInterval: 1000 * 30,
  });
}
