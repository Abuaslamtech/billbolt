import { create } from "zustand";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { ProductWithStock, Receipt } from "@/types/models";
import { useAppDataStore } from "@/store/AppDataStore";
import { getCurrencySymbol } from "@/lib/formatters";

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  maxStock: number;
}

export interface QuantityPickerTarget {
  productId: string;
  productName: string;
  currentQty: number;
  maxStock: number;
  unitPrice: number;
}

export function formatCurrency(n: number | null | undefined): string {
  const currencyCode = useAppDataStore.getState().businessInfo?.currency;
  const currencySymbol = getCurrencySymbol(currencyCode);
  if (n == null || isNaN(Number(n))) return `${currencySymbol}0`;
  return `${currencySymbol}${Number(n).toLocaleString("en-NG")}`;
}

interface SaleState {
  // Cart & Catalog
  cart: CartItem[];
  searchQuery: string;
  selectedCategory: string;

  // Customer & Payment
  customerName: string;
  customerPhone: string;
  soldBy: string;
  paymentMethod: "Cash" | "Transfer" | "Card";
  isSubmitting: boolean;

  // Discount
  isDiscountOpen: boolean;
  discountType: "fixed" | "percent";
  discountValue: string;

  // Transaction Date
  isHistoricalOpen: boolean;
  isHistorical: boolean;
  datePreset: "today" | "yesterday" | "custom";
  customDateInput: string;

  // Post-Sale
  completedReceipt: Receipt | null;

  // Modals & Dialogs
  isDiscardDialogOpen: boolean;
  isClearCartDialogOpen: boolean;
  isScannerOpen: boolean;
  quantityPickerTarget: QuantityPickerTarget | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setPaymentMethod: (method: "Cash" | "Transfer" | "Card") => void;
  setIsDiscountOpen: (open: boolean) => void;
  setDiscountType: (type: "fixed" | "percent") => void;
  setDiscountValue: (val: string) => void;
  setIsHistoricalOpen: (open: boolean) => void;
  setIsHistorical: (hist: boolean) => void;
  setDatePreset: (preset: "today" | "yesterday" | "custom") => void;
  setCustomDateInput: (date: string) => void;
  setIsScannerOpen: (open: boolean) => void;
  setIsDiscardDialogOpen: (open: boolean) => void;
  setIsClearCartDialogOpen: (open: boolean) => void;
  setQuantityPickerTarget: (target: QuantityPickerTarget | null) => void;

  // Cart Operations
  addToCart: (product: ProductWithStock) => void;
  updateQty: (productId: string, delta: number) => void;
  setDirectQty: (productId: string, newQty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  resetSale: () => void;

  // Checkout Action
  recordSale: () => Promise<Receipt | null>;

  // Computed Getters
  getCartSubtotal: () => number;
  getDiscountAmount: () => number;
  getCartTotal: () => number;
  getTotalItemsCount: () => number;
}

export const useSaleStore = create<SaleState>((set, get) => ({
  cart: [],
  searchQuery: "",
  selectedCategory: "All",

  customerName: "",
  customerPhone: "",
  soldBy: "Staff",
  paymentMethod: "Transfer",
  isSubmitting: false,

  isDiscountOpen: false,
  discountType: "fixed",
  discountValue: "",

  isHistoricalOpen: false,
  isHistorical: false,
  datePreset: "today",
  customDateInput: new Date().toISOString().split("T")[0],

  completedReceipt: null,

  isDiscardDialogOpen: false,
  isClearCartDialogOpen: false,
  isScannerOpen: false,
  quantityPickerTarget: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setCustomerName: (customerName) => set({ customerName }),
  setCustomerPhone: (customerPhone) => set({ customerPhone }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setIsDiscountOpen: (isDiscountOpen) => set({ isDiscountOpen }),
  setDiscountType: (discountType) => set({ discountType }),
  setDiscountValue: (discountValue) => set({ discountValue }),
  setIsHistoricalOpen: (isHistoricalOpen) => set({ isHistoricalOpen }),
  setIsHistorical: (isHistorical) => set({ isHistorical }),
  setDatePreset: (datePreset) => set({ datePreset, isHistorical: datePreset !== "today" }),
  setCustomDateInput: (customDateInput) => set({ customDateInput }),
  setIsScannerOpen: (isScannerOpen) => set({ isScannerOpen }),
  setIsDiscardDialogOpen: (isDiscardDialogOpen) => set({ isDiscardDialogOpen }),
  setIsClearCartDialogOpen: (isClearCartDialogOpen) => set({ isClearCartDialogOpen }),
  setQuantityPickerTarget: (quantityPickerTarget) => set({ quantityPickerTarget }),

  addToCart: (product: ProductWithStock) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { isHistorical, datePreset, cart } = get();
    const isPastEntry = isHistorical || datePreset !== "today";

    if (!isPastEntry && product.currentStock <= 0) {
      Toast.show({
        type: "error",
        text1: "Out of stock",
        text2: `${product.name} has no available stock`,
      });
      return;
    }

    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      if (!isPastEntry && existing.qty >= product.currentStock) {
        Toast.show({
          type: "error",
          text1: "Max stock reached",
          text2: `Only ${product.currentStock} units available`,
        });
        return;
      }
      set({
        cart: cart.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            productId: product.id,
            productName: product.name,
            unitPrice: product.sellingPrice,
            qty: 1,
            maxStock: isPastEntry ? 99999 : product.currentStock,
          },
        ],
      });
    }
  },

  updateQty: (productId: string, delta: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { isHistorical, datePreset, cart } = get();
    const isPastEntry = isHistorical || datePreset !== "today";

    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (!isPastEntry && newQty > item.maxStock) {
            Toast.show({
              type: "error",
              text1: "Max stock reached",
              text2: `Only ${item.maxStock} available`,
            });
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    set({ cart: updated });
  },

  setDirectQty: (productId: string, newQty: number) => {
    const { cart } = get();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.productId === productId ? { ...item, qty: newQty } : item
        ),
      });
    }
  },

  removeFromCart: (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { cart } = get();
    set({ cart: cart.filter((item) => item.productId !== productId) });
  },

  clearCart: () => {
    set({
      cart: [],
      isClearCartDialogOpen: false,
    });
  },

  resetSale: () => {
    set({
      cart: [],
      searchQuery: "",
      selectedCategory: "All",
      customerName: "",
      customerPhone: "",
      soldBy: "Staff",
      paymentMethod: "Transfer",
      isSubmitting: false,
      isDiscountOpen: false,
      discountType: "fixed",
      discountValue: "",
      isHistoricalOpen: false,
      isHistorical: false,
      datePreset: "today",
      customDateInput: new Date().toISOString().split("T")[0],
      completedReceipt: null,
      isDiscardDialogOpen: false,
      isClearCartDialogOpen: false,
      isScannerOpen: false,
      quantityPickerTarget: null,
    });
  },

  getCartSubtotal: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  },

  getDiscountAmount: () => {
    const { discountValue, discountType } = get();
    const subtotal = get().getCartSubtotal();
    const val = parseFloat(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === "percent") {
      const pct = Math.min(val, 100);
      return Math.round((subtotal * pct) / 100);
    }
    return Math.min(val, subtotal);
  },

  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal - discount);
  },

  getTotalItemsCount: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.qty, 0);
  },

  recordSale: async () => {
    const state = get();
    const { cart, isSubmitting } = state;
    if (cart.length === 0 || isSubmitting) return null;

    set({ isSubmitting: true });

    try {
      let effectiveDate: string | undefined;
      if (state.datePreset === "yesterday") {
        effectiveDate = new Date(Date.now() - 86400000).toISOString();
      } else if (state.datePreset === "custom") {
        const parsed = new Date(state.customDateInput);
        effectiveDate = isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
      }

      const discountAmount = state.getDiscountAmount();

      const receipt = await useAppDataStore.getState().createNewReceipt({
        items: cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        customerName: state.customerName.trim() || "Walk-in Customer",
        customerPhone: state.customerPhone.trim() || undefined,
        paymentMethod: state.paymentMethod,
        soldBy: state.soldBy,
        date: effectiveDate,
        discount: discountAmount > 0 ? discountAmount : undefined,
        notes: state.isHistorical ? "Historical record" : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      set({ completedReceipt: receipt, isSubmitting: false });
      return receipt;
    } catch (error: any) {
      console.error("Failed to record sale:", error);
      Toast.show({
        type: "error",
        text1: "Failed to record sale",
        text2: error.message || "Please try again",
      });
      set({ isSubmitting: false });
      return null;
    }
  },
}));
