import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useAppDataStore } from "@/store/AppDataStore";
import { useAuthStore } from "@/store/authStore";
import { saveBusinessInfo } from "@/services/storage/localStorage";
import { uploadStoreLogo } from "@/services/storage/uploadService";

export function useStoreProfileScreen() {
  const { businessInfo, refresh } = useAppDataStore();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState(businessInfo?.name || "");
  const [type, setType] = useState(businessInfo?.type || "");
  const [phone, setPhone] = useState(businessInfo?.phone || "");
  const [email, setEmail] = useState(businessInfo?.email || "");
  const [address, setAddress] = useState(businessInfo?.address || "");
  const [currency, setCurrency] = useState(businessInfo?.currency || "NGN");
  const [logoUrl, setLogoUrl] = useState<string | null>(
    businessInfo?.logoUrl || user?.business?.logoUrl || null
  );

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal State for editing
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);

  const openEditModal = () => {
    // Reset to current saved data before opening
    if (businessInfo) {
      setName(businessInfo.name || "");
      setType(businessInfo.type || "");
      setPhone(businessInfo.phone || "");
      setEmail(businessInfo.email || "");
      setAddress(businessInfo.address || "");
      setCurrency(businessInfo.currency || "NGN");
    }
    setIsEditStoreOpen(true);
  };

  const handlePickLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "warning",
          text1: "Permission Required",
          text2: "Allow photo access in Settings to upload your store logo.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      const localUri = result.assets[0].uri;
      setLogoUrl(localUri);
      setIsUploadingLogo(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await uploadStoreLogo(localUri);
      if (res.success && res.logoUrl) {
        setLogoUrl(res.logoUrl);

        // Instantly update Zustand AppDataStore so Header and all screens reflect the new logo
        await useAppDataStore.getState().updateBusiness({ logoUrl: res.logoUrl });

        setUser({
          business: {
            ...(user?.business || {}),
            logoUrl: res.logoUrl,
          } as any,
        });

        await refresh();

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Store Logo Updated",
          text2: "Your logo is now live on all customer receipts.",
        });
      }
    } catch (err: any) {
      console.error("Logo upload error:", err);
      const msg = err?.message || "Could not update store logo. Please try again.";
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Store Name Required",
        text2: "Please enter your business or store name.",
      });
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const updated = await saveBusinessInfo({
        name: name.trim(),
        type: type.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        currency,
        logoUrl,
      });

      if (user?.business) {
        setUser({
          business: {
            ...user.business,
            name: updated.name,
            type: updated.type,
            phone: updated.phone,
            email: updated.email,
            address: updated.address,
            currency: updated.currency,
            logoUrl: updated.logoUrl ?? null,
          },
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Store Profile Saved",
        text2: "Your changes have been saved successfully.",
      });
      await refresh();
    } catch {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Could not save store details.",
      });
    } finally {
      setIsSaving(false);
      setIsEditStoreOpen(false);
    }
  };

  const initials =
    name
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "B";

  return {
    name,
    setName,
    type,
    setType,
    phone,
    setPhone,
    email,
    setEmail,
    address,
    setAddress,
    currency,
    logoUrl,
    initials,
    isUploadingLogo,
    isSaving,
    isEditStoreOpen,
    setIsEditStoreOpen,
    openEditModal,
    handlePickLogo,
    handleSave,
  };
}
