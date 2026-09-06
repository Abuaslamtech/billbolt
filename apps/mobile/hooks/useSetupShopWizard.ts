import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

import ShoppingCart01Icon from "@hugeicons/core-free-icons/ShoppingCart01Icon";
import TShirtIcon from "@hugeicons/core-free-icons/TShirtIcon";
import SmartPhone01Icon from "@hugeicons/core-free-icons/SmartPhone01Icon";
import SparklesIcon from "@hugeicons/core-free-icons/SparklesIcon";
import Medicine02Icon from "@hugeicons/core-free-icons/Medicine02Icon";
import Restaurant01Icon from "@hugeicons/core-free-icons/Restaurant01Icon";
import Building01Icon from "@hugeicons/core-free-icons/Building01Icon";
import Car01Icon from "@hugeicons/core-free-icons/Car01Icon";
import Plant01Icon from "@hugeicons/core-free-icons/Plant01Icon";
import Package01Icon from "@hugeicons/core-free-icons/Package01Icon";
import PencilEdit02Icon from "@hugeicons/core-free-icons/PencilEdit02Icon";

import { apiClient } from "@/lib/apiClient";
import { saveRefreshToken, saveToken } from "@/services/storage/auth";
import { useAppDataStore } from "@/store/AppDataStore";
import { useAuthStore } from "@/store/authStore";
import {
  POPULAR_CURRENCIES,
  getCurrencySymbolFromCode,
  getDeviceLocale,
} from "@/lib/localization";

export interface BusinessArchetype {
  id: string;
  label: string;
  value: string;
  icon: any;
}

export const BUSINESS_ARCHETYPES: BusinessArchetype[] = [
  { id: "groceries", label: "Groceries & Supermarket", value: "Retail / Supermarket", icon: ShoppingCart01Icon },
  { id: "fashion", label: "Fashion & Apparel", value: "Fashion & Boutique", icon: TShirtIcon },
  { id: "electronics", label: "Phones & Electronics", value: "Electronics & Gadgets", icon: SmartPhone01Icon },
  { id: "beauty", label: "Beauty & Skincare", value: "Beauty & Salon", icon: SparklesIcon },
  { id: "pharmacy", label: "Pharmacy & Health", value: "Pharmacy / Health", icon: Medicine02Icon },
  { id: "food", label: "Food & Drinks", value: "Food & Restaurant", icon: Restaurant01Icon },
  { id: "building", label: "Building & Hardware", value: "Building & Hardware", icon: Building01Icon },
  { id: "auto", label: "Auto Parts & Mechanics", value: "Auto Parts & Mechanics", icon: Car01Icon },
  { id: "agro", label: "Farm Supplies & Agro", value: "Farm Supplies & Agro", icon: Plant01Icon },
  { id: "wholesale", label: "Wholesale & Distribution", value: "Wholesale", icon: Package01Icon },
  { id: "custom", label: "Something Else", value: "custom", icon: PencilEdit02Icon },
];

export function useSetupShopWizard() {
  const { user, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Shop Name
  const [shopName, setShopName] = useState("");

  // Step 2: Category
  const [selectedArchetype, setSelectedArchetype] = useState<BusinessArchetype | null>(
    BUSINESS_ARCHETYPES[0]
  );
  const [customCategory, setCustomCategory] = useState("");

  // Step 3: Phone & Currency
  const deviceLocale = getDeviceLocale();
  const [phone, setPhone] = useState(user?.phone || "");
  const [currency, setCurrency] = useState(deviceLocale.currencyCode || "USD");
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validations
  const isStep1Valid = shopName.trim().length >= 2;
  const isStep2Valid =
    selectedArchetype !== null &&
    (selectedArchetype.value !== "custom" || customCategory.trim().length >= 2);

  const handleNextStep = () => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === 1) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSelectArchetype = (archetype: BusinessArchetype) => {
    Haptics.selectionAsync();
    setSelectedArchetype(archetype);
  };

  const handleSubmit = async (skipPhone = false) => {
    if (!shopName.trim()) {
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const businessType =
      selectedArchetype?.value === "custom"
        ? customCategory.trim() || "Retail"
        : selectedArchetype?.value || "Retail";

    const formattedPhone = !skipPhone && phone.trim() ? phone.trim() : undefined;

    try {
      const res = await apiClient.post("/business", {
        name: shopName.trim(),
        type: businessType,
        phone: formattedPhone,
        currency,
      });

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

      useAppDataStore.getState().reset();
      await useAppDataStore.getState().init();

      Toast.show({
        type: "success",
        text1: "Shop setup complete",
        text2: `${shopName.trim()} is ready.`,
        position: "top",
      });

      router.replace({
        pathname: "/(auth)/ShopReadyScreen",
        params: { shopName: shopName.trim() },
      });
    } catch (err: any) {
      console.error("Shop setup failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save shop details. Please try again.";

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
    currentStep,
    shopName,
    setShopName,
    selectedArchetype,
    customCategory,
    setCustomCategory,
    phone,
    setPhone,
    currency,
    setCurrency,
    currencySymbol: getCurrencySymbolFromCode(currency),
    currencyModalVisible,
    setCurrencyModalVisible,
    submitting,
    isStep1Valid,
    isStep2Valid,
    handleNextStep,
    handlePrevStep,
    handleSelectArchetype,
    handleSubmit,
    archetypes: BUSINESS_ARCHETYPES,
    currencies: POPULAR_CURRENCIES,
  };
}
