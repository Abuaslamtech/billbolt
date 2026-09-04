import { useState, useEffect, useMemo } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAppDataStore } from "@/store/AppDataStore";
import { formatCurrency } from "@/lib/formatters";

import { ProductWithStock } from "@/types/models";

export const PAGE_SIZE = 15;

export type StockStatusFilter = "ALL" | "LOW_STOCK" | "OUT_OF_STOCK";

export function useInventoryScreen() {
  const { products, refresh } = useAppDataStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      refresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.category || "General")))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === "LOW_STOCK" && p.status !== "Low Stock") return false;
      if (statusFilter === "OUT_OF_STOCK" && p.status !== "Out of Stock") return false;

      if (selectedCategory !== "All" && (p.category || "General") !== selectedCategory) {
        return false;
      }

      if (!query) return true;
      const matchesName = p.name.toLowerCase().includes(query);
      const matchesCat = (p.category || "").toLowerCase().includes(query);
      return matchesName || matchesCat;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = filteredProducts.length > visibleCount;
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length;

  const handleRestockProduct = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/restock", params: { productId: id } });
  };

  const handleStatusFilterChange = (filter: StockStatusFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatusFilter((prev) => (prev === filter ? "ALL" : filter));
    setVisibleCount(PAGE_SIZE);
  };

  const handleSelectCategory = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  const loadMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const openAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/add-product");
  };

  const openRestockModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/restock");
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    handleSelectCategory,
    statusFilter,
    setStatusFilter,
    handleStatusFilterChange,
    visibleCount,
    loadMore,
    hasMore,
    categories,
    filteredProducts,
    displayedProducts,
    totalProductsCount,
    lowStockCount,
    outOfStockCount,
    refreshing,
    handleRefresh,
    fmt: formatCurrency,
    // Modals & Navigation
    isAddModalVisible,
    setIsAddModalVisible,
    openAddModal,
    openRestockModal,
    handleRestockProduct,
  };
}
