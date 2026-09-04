import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { apiClient } from "@/lib/apiClient";
import { saveRefreshToken, saveToken } from "@/services/storage/auth";
import { useAppDataStore } from "@/store/AppDataStore";
import { useAuthStore } from "@/store/authStore";

export const BUSINESS_CATEGORIES = [
  "Retail / Supermarket",
  "Fashion & Boutique",
  "Pharmacy / Health",
  "Food & Restaurant",
  "Electronics & Gadgets",
  "Beauty & Salon",
  "General Services",
  "Wholesale",
];

export const BUSINESS_CURRENCIES = [
  { code: "NGN", symbol: "₦", label: "Naira (₦)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
];

export function useSetupBusinessScreen() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Store Name Required",
        text2: "Please enter your store or business name to continue.",
        position: "top",
      });
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await apiClient.post("/business", {
        name: name.trim(),
        type: selectedCategory,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        currency,
      });

      // Save updated tokens with the new businessId
      if (res.data?.accessToken) {
        await saveToken(res.data.accessToken);
        useAuthStore.getState().setToken(res.data.accessToken);
      }
      if (res.data?.refreshToken) {
        await saveRefreshToken(res.data.refreshToken);
      }

      if (res.data?.user) {
        setUser(res.data.user);
      } else if (res.data?.business && user) {
        setUser({ ...user, business: res.data.business });
      }

      await useAppDataStore.getState().init();

      Toast.show({
        type: "success",
        text1: "Store Setup Complete",
        text2: `Welcome to ${name.trim()}!`,
        position: "top",
      });

      router.replace("/(main)");
    } catch (err: any) {
      console.error("Business setup failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save business details. Please try again.";

      Toast.show({
        type: "error",
        text1: "Setup Failed",
        text2: typeof msg === "string" ? msg : JSON.stringify(msg),
        position: "top",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    selectedCategory,
    setSelectedCategory,
    phone,
    setPhone,
    address,
    setAddress,
    currency,
    setCurrency,
    submitting,
    handleSubmit,
    categories: BUSINESS_CATEGORIES,
    currencies: BUSINESS_CURRENCIES,
  };
}
