import { useState, useEffect, useCallback } from 'react';
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
}

export function useInventoryScreen(searchQuery: string = '') {
  const [products, setProducts] = useState<ProductStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ProductStockItem[]>('/inventory/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch inventory products from backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.qrCode && item.qrCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;

  return {
    products: filteredProducts,
    totalCount: products.length,
    lowStockCount,
    outOfStockCount,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
