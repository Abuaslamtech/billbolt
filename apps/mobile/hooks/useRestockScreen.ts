import { useState, useMemo, useCallback, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

import { useAppDataStore } from "@/store/AppDataStore";
import { ProductWithStock } from "@/types/models";

export interface RestockItem {
  productId: string;
  name: string;
  category: string;
  currentStock: number;
  qty: number;
  costPerUnit: number;
}

export function useRestockScreen() {
  const { products, logNewRestock } = useAppDataStore();
  const { initialProductId } = useLocalSearchParams<{ initialProductId?: string }>();

  // High-level steps:
  // 1. SELECT_PRODUCTS: Pick items from the inventory.
  // 2. ADJUST_QUANTITIES: Enter precise quantities & cost prices for the selected batch.
  // 3. SUCCESS: Show success state.
  const [step, setStep] = useState<"SELECT_PRODUCTS" | "ADJUST_QUANTITIES" | "SUCCESS">("SELECT_PRODUCTS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The batch of items being restocked
  const [batch, setBatch] = useState<RestockItem[]>([]);

  // Track the summary of the last completed restock for the success screen
  const [lastRestockedSummary, setLastRestockedSummary] = useState<{
    itemsCount: number;
    unitsCount: number;
    totalSpend: number;
  } | null>(null);

  // Picker State
  const [quantityPickerTarget, setQuantityPickerTarget] = useState<{
    productId: string;
    productName: string;
    currentQty: number;
    cost: number;
  } | null>(null);

  // Auto-add product if launched from quick action
  useEffect(() => {
    if (initialProductId && products.length > 0 && batch.length === 0) {
      const match = products.find((p) => p.id === initialProductId);
      if (match) {
        setBatch([
          {
            productId: match.id,
            name: match.name,
            category: match.category || "General",
            currentStock: match.currentStock,
            qty: 1,
            costPerUnit: match.costPrice || 0,
          },
        ]);
        setStep("ADJUST_QUANTITIES");
      }
    }
  }, [initialProductId, products]);

  // Categories & Filters for Step 1
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add("All");
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Batch calculations
  const totalUnits = useMemo(() => batch.reduce((sum, item) => sum + item.qty, 0), [batch]);
  const totalSpend = useMemo(() => batch.reduce((sum, item) => sum + item.qty * item.costPerUnit, 0), [batch]);

  const batchMap = useMemo(() => {
    const map = new Map<string, RestockItem>();
    for (const item of batch) {
      map.set(item.productId, item);
    }
    return map;
  }, [batch]);

  const handleToggleSelect = useCallback(
    (product: ProductWithStock, isSelected: boolean) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isSelected) {
        setBatch((prev) => prev.filter((item) => item.productId !== product.id));
      } else {
        setBatch((prev) => [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            category: product.category || "General",
            currentStock: product.currentStock,
            qty: 1,
            costPerUnit: product.costPrice || 0,
          },
        ]);
      }
    },
    []
  );

  const handleUpdateQty = useCallback((productId: string, delta: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBatch((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, qty: Math.max(1, item.qty + delta) };
        }
        return item;
      })
    );
  }, []);

  const handleSetDirectQty = useCallback((productId: string, newQty: number, newCost?: number) => {
    setBatch((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            qty: Math.max(1, newQty),
            costPerUnit: newCost !== undefined ? newCost : item.costPerUnit,
          };
        }
        return item;
      })
    );
  }, []);

  const handleUpdateCost = useCallback((productId: string, costStr: string) => {
    const parsed = parseFloat(costStr);
    setBatch((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, costPerUnit: isNaN(parsed) ? 0 : parsed };
        }
        return item;
      })
    );
  }, []);

  const handleRemove = useCallback((productId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBatch((prev) => {
      const filtered = prev.filter((item) => item.productId !== productId);
      if (filtered.length === 0) setStep("SELECT_PRODUCTS");
      return filtered;
    });
  }, []);

  const handleOpenPicker = useCallback(
    (product: ProductWithStock, currentQty: number, cost: number) => {
      setQuantityPickerTarget({
        productId: product.id,
        productName: product.name,
        currentQty,
        cost,
      });
    },
    []
  );

  const handleProductScanned = (product: ProductWithStock) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBatch((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          category: product.category || "General",
          currentStock: product.currentStock,
          qty: 1,
          costPerUnit: product.costPrice || 0,
        },
      ];
    });
    Toast.show({
      type: "success",
      text1: "Added to Restock Batch",
      text2: `${product.name} scanned`,
    });
  };

  const handleSubmitRestock = async () => {
    const validBatch = batch.filter((item) => item.qty > 0);
    if (validBatch.length === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show({ type: "error", text1: "No valid items to restock" });
      return;
    }

    try {
      setIsSubmitting(true);
      for (const item of validBatch) {
        await logNewRestock({
          productId: item.productId,
          qty: item.qty,
          costPerUnit: item.costPerUnit,
        });
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLastRestockedSummary({
        itemsCount: validBatch.length,
        unitsCount: totalUnits,
        totalSpend,
      });
      setStep("SUCCESS");
      setBatch([]); // clear batch
    } catch (err: any) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Restock Failed",
        text2: err?.message || "Could not save restock batch",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isScannerOpen,
    setIsScannerOpen,
    isSubmitting,
    batch,
    batchMap,
    lastRestockedSummary,
    quantityPickerTarget,
    setQuantityPickerTarget,
    categories,
    filteredProducts,
    totalUnits,
    totalSpend,
    products,
    handleToggleSelect,
    handleUpdateQty,
    handleSetDirectQty,
    handleUpdateCost,
    handleRemove,
    handleOpenPicker,
    handleProductScanned,
    handleSubmitRestock,
    router,
  };
}
