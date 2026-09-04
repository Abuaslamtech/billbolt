import { useMemo, useEffect, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useAppDataStore } from "@/store/AppDataStore";
import { useSaleStore, formatCurrency } from "@/store/saleStore";
import { ProductWithStock } from "@/types/models";

export function useSaleCatalog() {
  const { products } = useAppDataStore();
  const { initialProductId } = useLocalSearchParams<{ initialProductId?: string }>();

  const cart = useSaleStore((s) => s.cart);
  const searchQuery = useSaleStore((s) => s.searchQuery);
  const setSearchQuery = useSaleStore((s) => s.setSearchQuery);
  const selectedCategory = useSaleStore((s) => s.selectedCategory);
  const setSelectedCategory = useSaleStore((s) => s.setSelectedCategory);
  const isScannerOpen = useSaleStore((s) => s.isScannerOpen);
  const setIsScannerOpen = useSaleStore((s) => s.setIsScannerOpen);
  const isDiscardDialogOpen = useSaleStore((s) => s.isDiscardDialogOpen);
  const setIsDiscardDialogOpen = useSaleStore((s) => s.setIsDiscardDialogOpen);
  const quantityPickerTarget = useSaleStore((s) => s.quantityPickerTarget);
  const setQuantityPickerTarget = useSaleStore((s) => s.setQuantityPickerTarget);

  const addToCart = useSaleStore((s) => s.addToCart);
  const updateQty = useSaleStore((s) => s.updateQty);
  const setDirectQty = useSaleStore((s) => s.setDirectQty);
  const clearCart = useSaleStore((s) => s.clearCart);
  const getCartSubtotal = useSaleStore((s) => s.getCartSubtotal);
  const getTotalItemsCount = useSaleStore((s) => s.getTotalItemsCount);

  // Auto-add product when scanned from an external screen (e.g. Dashboard)
  useEffect(() => {
    if (initialProductId) {
      const match = products.find((p) => p.id === initialProductId);
      if (match) {
        addToCart(match);
      }
    }
  }, [initialProductId, products, addToCart]);

  // Extract unique categories from catalog
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("All");
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered and sorted product catalog
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // UX Fix: Bubble up products in the cart to the top, sorting by most recently added
    const cartMap = new Map<string, number>();
    cart.forEach((item, index) => {
      cartMap.set(item.productId, index);
    });

    return filtered.sort((a, b) => {
      const aIndex = cartMap.has(a.id) ? cartMap.get(a.id)! : -1;
      const bIndex = cartMap.has(b.id) ? cartMap.get(b.id)! : -1;
      return bIndex - aIndex;
    });
  }, [products, selectedCategory, searchQuery, cart]);

  const totalItemsCount = getTotalItemsCount();
  const cartSubtotal = getCartSubtotal();

  const handleExitToDashboard = useCallback(() => {
    if (cart.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsDiscardDialogOpen(true);
    } else {
      router.back();
    }
  }, [cart.length, setIsDiscardDialogOpen]);

  const handleConfirmDiscard = useCallback(() => {
    setIsDiscardDialogOpen(false);
    clearCart();
    router.back();
  }, [clearCart, setIsDiscardDialogOpen]);

  const handleReviewSale = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(sale)/checkout");
  }, []);

  const handleProductScanned = useCallback(
    (product: ProductWithStock) => {
      addToCart(product);
      Toast.show({
        type: "success",
        text1: "Item Added to Sale",
        text2: `${product.name} (${formatCurrency(product.sellingPrice)})`,
      });
    },
    [addToCart]
  );

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart) {
      map.set(item.productId, item.qty);
    }
    return map;
  }, [cart]);

  const handleAddToCart = useCallback(
    (product: ProductWithStock) => {
      addToCart(product);
    },
    [addToCart]
  );

  const handleMinusQty = useCallback(
    (productId: string) => {
      updateQty(productId, -1);
    },
    [updateQty]
  );

  const handleOpenPicker = useCallback(
    (product: ProductWithStock, qty: number) => {
      setQuantityPickerTarget({
        productId: product.id,
        productName: product.name,
        currentQty: qty,
        maxStock: product.currentStock,
        unitPrice: product.sellingPrice,
      });
    },
    [setQuantityPickerTarget]
  );

  return {
    cart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredProducts,
    totalItemsCount,
    cartSubtotal,
    isScannerOpen,
    setIsScannerOpen,
    isDiscardDialogOpen,
    setIsDiscardDialogOpen,
    quantityPickerTarget,
    setQuantityPickerTarget,
    addToCart,
    updateQty,
    setDirectQty,
    handleExitToDashboard,
    handleConfirmDiscard,
    handleReviewSale,
    handleProductScanned,
    cartQtyMap,
    handleAddToCart,
    handleMinusQty,
    handleOpenPicker,
  };
}
