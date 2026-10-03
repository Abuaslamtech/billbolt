import { useState, useMemo } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import Toast from "react-native-toast-message";

import { useAppDataStore } from "@/store/AppDataStore";
import { generateProductLabelPdf } from "@/lib/qr/qrPdfGenerator";
import { formatNumberInput, parseNumberInput } from "@/lib/formatters";
import { ProductWithStock } from "@/types/models";

export function useAddProductScreen() {
  const { products, addNewProduct } = useAppDataStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Once created, hold product for label preview
  const [createdProduct, setCreatedProduct] = useState<ProductWithStock | null>(null);

  // Extract unique categories (General first, then catalog, then newly added)
  const categoryList = useMemo(() => {
    const set = new Set<string>();
    set.add("General");
    products.forEach((p) => {
      if (p.category && p.category.trim() && p.category.trim().toLowerCase() !== "all") {
        set.add(p.category.trim());
      }
    });
    customCategories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    return Array.from(set);
  }, [products, customCategories]);

  const handleCostPriceChange = (text: string) => {
    setCostPrice(formatNumberInput(text));
  };

  const handleSellingPriceChange = (text: string) => {
    setSellingPrice(formatNumberInput(text));
  };

  const handleOpeningStockChange = (text: string) => {
    setOpeningStock(formatNumberInput(text, false));
  };

  // Profit & Margin calculation
  const marginPreview = useMemo(() => {
    const cost = parseNumberInput(costPrice);
    const sell = parseNumberInput(sellingPrice);
    if (!isNaN(cost) && !isNaN(sell) && sell > 0) {
      const profit = sell - cost;
      const pct = (profit / sell) * 100;
      return {
        profit,
        pct: Math.abs(pct).toFixed(1),
        isPositive: profit > 0,
        isLoss: profit < 0,
        isBreakEven: profit === 0,
        status: (profit > 0 ? "profit" : profit < 0 ? "loss" : "breakeven") as
          | "profit"
          | "loss"
          | "breakeven",
      };
    }
    return null;
  }, [costPrice, sellingPrice]);

  const isValid = useMemo(() => {
    const cost = parseNumberInput(costPrice);
    const sell = parseNumberInput(sellingPrice);
    return Boolean(
      name.trim().length > 0 &&
        costPrice.trim().length > 0 &&
        !isNaN(cost) &&
        cost >= 0 &&
        sellingPrice.trim().length > 0 &&
        !isNaN(sell) &&
        sell > 0
    );
  }, [name, costPrice, sellingPrice]);

  const resetForm = () => {
    setName("");
    setCategory("General");
    setCostPrice("");
    setSellingPrice("");
    setOpeningStock("");
    setCreatedProduct(null);
    setIsAddingCategory(false);
    setNewCategoryInput("");
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Name",
        text2: "Please provide a name for the product",
      });
      return;
    }

    const cost = parseNumberInput(costPrice);
    const price = parseNumberInput(sellingPrice);
    const stock = parseNumberInput(openingStock);

    if (isNaN(cost) || cost < 0 || !costPrice.trim()) {
      Toast.show({
        type: "error",
        text1: "Invalid Cost Price",
        text2: "Please enter a valid cost price",
      });
      return;
    }

    if (isNaN(price) || price <= 0 || !sellingPrice.trim()) {
      Toast.show({
        type: "error",
        text1: "Invalid Selling Price",
        text2: "Please enter a valid selling price greater than 0",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newProd = await addNewProduct({
        name: name.trim(),
        category: category.trim() || "General",
        costPrice: cost,
        sellingPrice: price,
        openingStock: Math.floor(stock) || 0,
        reorderLevel: 5,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Product Added",
        text2: `${name.trim()} added to your inventory`,
      });

      if (newProd) {
        setCreatedProduct(newProd);
      } else {
        router.back();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Add Product",
        text2: err?.message || "Please check details and try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPdf = async () => {
    if (isPrinting || isExporting || !createdProduct) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPrinting(true);

    try {
      const pdfUri = await generateProductLabelPdf(createdProduct);
      await Print.printAsync({ uri: pdfUri });
    } catch (err: any) {
      console.error("[AddProductScreen] Print error:", err);
      Toast.show({
        type: "error",
        text1: "Print Failed",
        text2: err?.message || "Could not connect to printer",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPdf = async () => {
    if (isExporting || isPrinting || !createdProduct) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExporting(true);

    try {
      const pdfUri = await generateProductLabelPdf(createdProduct);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: "info",
          text1: "Sharing Unavailable",
          text2: "Sharing is not supported on this device.",
        });
        return;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${createdProduct.name} QR Sticker PDF`,
        UTI: "com.adobe.pdf",
      });
    } catch (err: any) {
      console.error("[AddProductScreen] Export error:", err);
      Toast.show({
        type: "error",
        text1: "Share Failed",
        text2: "Could not export QR sticker PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectCategory = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategory(cat);
    if (isAddingCategory) {
      setIsAddingCategory(false);
      setNewCategoryInput("");
    }
  };

  const handleStartAddCategory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAddingCategory(true);
    setNewCategoryInput("");
  };

  const handleCancelAddCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryInput("");
  };

  const handleConfirmAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      setIsAddingCategory(false);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!categoryList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomCategories((prev) => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setIsAddingCategory(false);
    setNewCategoryInput("");
  };

  return {
    name,
    setName,
    category,
    setCategory,
    costPrice,
    setCostPrice: handleCostPriceChange,
    sellingPrice,
    setSellingPrice: handleSellingPriceChange,
    openingStock,
    setOpeningStock: handleOpeningStockChange,
    isSubmitting,
    isExporting,
    isPrinting,
    createdProduct,
    categoryList,
    existingCategories: categoryList,
    isAddingCategory,
    newCategoryInput,
    setNewCategoryInput,
    marginPreview,
    isValid,
    resetForm,
    handleBack,
    handleSubmit,
    handlePrintPdf,
    handleExportPdf,
    handleSelectCategory,
    handleStartAddCategory,
    handleCancelAddCategory,
    handleConfirmAddCategory,
  };
}
