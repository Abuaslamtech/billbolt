import { useState, useMemo, useEffect } from "react";
import { Keyboard } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

import { useAppDataStore } from "@/store/AppDataStore";
import { generateProductLabelPdf } from "@/lib/qr/qrPdfGenerator";
import { ProductWithStock } from "@/types/models";

export function useAddProductScreen() {
  const { products, addNewProduct } = useAppDataStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Once created, hold product for label preview
  const [createdProduct, setCreatedProduct] = useState<ProductWithStock | null>(null);

  // Extract unique categories
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim() && p.category.trim().toLowerCase() !== "all") {
        set.add(p.category.trim());
      }
    });
    if (!set.has("General")) set.add("General");
    return Array.from(set);
  }, [products]);

  // Margin calculation
  const marginPreview = useMemo(() => {
    const cost = parseFloat(costPrice);
    const sell = parseFloat(sellingPrice);
    if (!isNaN(cost) && !isNaN(sell) && sell > 0) {
      const profit = sell - cost;
      const pct = (profit / sell) * 100;
      return {
        profit,
        pct: pct.toFixed(1),
        isPositive: profit >= 0,
      };
    }
    return null;
  }, [costPrice, sellingPrice]);

  const resetForm = () => {
    setName("");
    setCategory("");
    setCostPrice("");
    setSellingPrice("");
    setOpeningStock("");
    setCreatedProduct(null);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Name",
        text2: "Please provide a name for the product",
      });
      return;
    }

    const cost = parseFloat(costPrice);
    const price = parseFloat(sellingPrice);

    if (isNaN(cost) || cost < 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Cost Price",
        text2: "Please enter a valid cost price in Naira",
      });
      return;
    }

    if (isNaN(price) || price <= 0) {
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
        openingStock: parseInt(openingStock, 10) || 0,
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

  const handleExportPdf = async () => {
    if (isExporting || !createdProduct) return;
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
        dialogTitle: `Share or Print ${createdProduct.name} Label`,
        UTI: "com.adobe.pdf",
      });
    } catch (err: any) {
      console.error("[AddProductScreen] Export error:", err);
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: "Could not export vector sticker PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectCategory = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategory(cat);
  };

  return {
    name,
    setName,
    category,
    setCategory,
    costPrice,
    setCostPrice,
    sellingPrice,
    setSellingPrice,
    openingStock,
    setOpeningStock,
    isSubmitting,
    isExporting,
    createdProduct,
    existingCategories,
    marginPreview,
    resetForm,
    handleBack,
    handleSubmit,
    handleExportPdf,
    handleSelectCategory,
  };
}
