import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface ProductStockItem {
  id: string;
  name: string;
  category?: string | null;
  sellingPrice: number;
  costPrice: number;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  qrCode?: string | null;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  businessName?: string;
}

export function useInventoryScreen(searchQuery: string = '') {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('ALL');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'inventory', { search: searchQuery }],
    queryFn: async () => {
      // 1. Try dedicated Admin Module endpoint
      try {
        const adminRes = await apiClient.get<any>(
          `/admin/inventory?search=${encodeURIComponent(searchQuery)}`
        );
        if (adminRes && Array.isArray(adminRes.items)) {
          return adminRes.items.map((p: any) => {
            const currentStock = p.openingStock ?? 0;
            const reorderLevel = p.reorderLevel ?? 5;
            let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
            if (currentStock <= 0) status = 'Out of Stock';
            else if (currentStock <= reorderLevel) status = 'Low Stock';

            return {
              id: p.id,
              name: p.name,
              category: p.category,
              sellingPrice: p.sellingPrice ?? 0,
              costPrice: p.costPrice ?? 0,
              openingStock: p.openingStock ?? 0,
              currentStock,
              reorderLevel,
              qrCode: p.qrCode,
              status,
              businessName: p.business?.name || 'Main Merchant',
            };
          });
        }
      } catch {
        // Fallback for pre-deployment
      }

      // 2. Fallback to /inventory/products
      try {
        const res = await apiClient.get<any[]>('/inventory/products');
        const list = Array.isArray(res) ? res : [];
        return list.map((p) => {
          const current = p.currentStock ?? p.openingStock ?? 0;
          const reorder = p.reorderLevel ?? 5;
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (current <= 0) status = 'Out of Stock';
          else if (current <= reorder) status = 'Low Stock';

          return {
            ...p,
            status,
          };
        });
      } catch {
        return [];
      }
    },
    refetchInterval: 1000 * 30,
  });

  const products: ProductStockItem[] = data || [];

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.qrCode && item.qrCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;
  const inStockCount = products.filter((p) => p.status === 'In Stock').length;

  return {
    products: filteredProducts,
    totalCount: products.length,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    statusFilter,
    setStatusFilter,
    isLoading,
    error: error ? (error as any).message : null,
    refetch: () => {
      refetch();
    },
  };
}
