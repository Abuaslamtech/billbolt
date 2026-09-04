import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useBiometric } from "./useBiometric";
import { useAuthStore } from "@/store/authStore";
import { uploadUserAvatar } from "@/services/storage/uploadService";

export interface PreviewFeatureState {
  visible: boolean;
  title: string;
  description?: string;
}

export function useAccountSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const { biometricEnabled, handleBiometricToggle } = useBiometric();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [previewFeature, setPreviewFeature] = useState<PreviewFeatureState>({
    visible: false,
    title: "",
  });

  const closePreviewFeature = () => {
    setPreviewFeature((prev) => ({ ...prev, visible: false }));
  };

  const openPreviewFeature = (title: string, description?: string) => {
    setPreviewFeature({
      visible: true,
      title,
      description,
    });
  };

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "warning",
          text1: "Permission Required",
          text2: "Allow photo access in Settings to upload your personal avatar.",
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
      setIsUploadingAvatar(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await uploadUserAvatar(localUri);
      if (res.success && res.avatarUrl) {
        setUser({ avatarUrl: res.avatarUrl });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Profile Photo Updated",
          text2: "Your personal avatar has been saved.",
        });
      }
    } catch (err: any) {
      console.error("User avatar upload error:", err);
      const msg = err?.message || "Could not upload profile photo. Please try again.";
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const openEditModal = () => {
    setEditFullName(user?.fullName || "");
    setEditPhone(user?.phone || "");
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Toast.show({
        type: "error",
        text1: "Name Required",
        text2: "Please enter your full name.",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      setUser({
        fullName: editFullName.trim(),
        phone: editPhone.trim() || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your personal account info has been saved.",
      });
      setIsEditProfileOpen(false);
    } catch {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not save profile changes.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently remove your account and all associated sales, inventory, and receipt records. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Deletion",
          style: "destructive",
          onPress: () =>
            openPreviewFeature(
              "Account Deletion Request",
              "To protect against accidental data loss, account deletion requests require confirmation from your registered email address."
            ),
        },
      ]
    );
  };

  const userInitials =
    user?.fullName
      ?.trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "U";

  return {
    user,
    userInitials,
    pushEnabled,
    setPushEnabled,
    emailEnabled,
    setEmailEnabled,
    biometricEnabled,
    handleBiometricToggle,
    isUploadingAvatar,
    isEditProfileOpen,
    setIsEditProfileOpen,
    editFullName,
    setEditFullName,
    editPhone,
    setEditPhone,
    isSavingProfile,
    openEditModal,
    handleSaveProfile,
    handlePickAvatar,
    previewFeature,
    openPreviewFeature,
    closePreviewFeature,
    handleDeleteAccount,
  };
}
