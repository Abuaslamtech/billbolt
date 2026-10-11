import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useAppDataStore } from "@/store/AppDataStore";
import { useSyncStore } from "@/store/syncStore";
import { processSyncQueue } from "@/services/sync/syncEngine";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Settings02Icon from '@hugeicons/core-free-icons/Settings02Icon';
import CloudOffIcon from '@hugeicons/core-free-icons/CloudOffIcon';
import CloudUploadIcon from '@hugeicons/core-free-icons/CloudUploadIcon';
import React, { useState, useCallback, useMemo } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import DropdownMenu from "./Elements/DropdownMenu";
import Toast from "react-native-toast-message";
import { Colors } from "@/lib/colors";
import { Image } from 'expo-image';

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getFormattedDate() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const Header = () => {
  const insets = useSafeAreaInsets();
  const [showGearMenu, setShowGearMenu] = useState(false);

  // Atomic Zustand selectors to prevent unnecessary re-render storms
  const userData = useAuthStore((state) => state.user);
  const businessInfo = useAppDataStore((state) => state.businessInfo);
  const isOnline = useSyncStore((state) => state.isOnline);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const pendingCount = useSyncStore((state) => state.pendingCount);

  const businessName =
    userData?.business?.name ||
    businessInfo?.name ||
    "My Business";

  const storeLogo = businessInfo?.logoUrl || userData?.business?.logoUrl;
  const formattedDate = useMemo(() => getFormattedDate(), []);

  const initials = useMemo(() => {
    return (
      businessName
        .trim()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") || "B"
    );
  }, [businessName]);

  const handleProfilePress = useCallback(() => {
    Haptics.selectionAsync();
    router.push("/StoreProfileScreen");
  }, []);

  const handleGearPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowGearMenu((prev) => !prev);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowGearMenu(false);
  }, []);

  const handleSyncPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isOnline) {
      Toast.show({
        type: "info",
        text1: "Working Offline",
        text2: `${pendingCount} sale${pendingCount === 1 ? "" : "s"} will automatically back up when reconnected.`,
      });
      return;
    }

    if (isSyncing) return;

    if (pendingCount === 0) {
      Toast.show({
        type: "success",
        text1: "All Data Backed Up",
        text2: "Your local sales are fully up to date with the cloud.",
      });
      return;
    }

    Toast.show({
      type: "info",
      text1: "Backing up...",
      text2: `Saving ${pendingCount} sale${pendingCount === 1 ? "" : "s"} to the cloud.`,
    });
    await processSyncQueue();
  }, [isOnline, isSyncing, pendingCount]);

  return (
    <View className="bg-bolt-card border-b border-bolt-border px-4 pt-3 pb-3">
      {/* Top Profile & Actions Row */}
      <View className="flex-row items-center justify-between">
        {/* Unified Store Logo & Business Identity Hit Target */}
        <TouchableOpacity
          onPress={handleProfilePress}
          activeOpacity={0.7}
          className="flex-row items-center flex-1 mr-3"
          accessibilityRole="button"
          accessibilityLabel={`Store Profile: ${businessName}`}
          accessibilityHint="Navigates to store settings and profile"
        >
          {storeLogo ? (
            <Image
              source={{ uri: storeLogo }}
              className="w-10 h-10 rounded-xl bg-white border border-bolt-border"
              contentFit="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-xl bg-bolt-blue items-center justify-center shadow-2xs">
              <Text className="text-white text-sm font-inter-bold">{initials}</Text>
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text
              className="text-bolt-graphite text-lg font-poppins-bold"
              numberOfLines={1}
            >
              {businessName}
            </Text>
            <Text className="text-bolt-slate text-xs font-inter mt-0.5">
              {formattedDate}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Settings gear trigger with generous accessible touch target */}
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-bolt-divider items-center justify-center active:bg-bolt-border"
          onPress={handleGearPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Settings and account menu"
        >
          <HugeiconsIcon icon={Settings02Icon} size={18} color={Colors.slate} />
        </TouchableOpacity>
      </View>

      {/* Prominent Offline / Sync Status Banner */}
      {!isOnline ? (
        <TouchableOpacity
          onPress={handleSyncPress}
          activeOpacity={0.85}
          className="mt-2.5 bg-bolt-warning-bg border border-bolt-warning-border rounded-xl px-3.5 py-2 flex-row items-center justify-between"
          accessibilityRole="button"
          accessibilityLabel="Offline mode info"
        >
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <HugeiconsIcon icon={CloudOffIcon} size={16} color={Colors.warning.text} />
            <Text className="text-xs font-inter-semibold text-bolt-warning-text flex-1" numberOfLines={1}>
              {pendingCount > 0
                ? `Working offline • ${pendingCount} sale${pendingCount === 1 ? "" : "s"} saved on device`
                : "Working offline • Sales are safely saved on this device"}
            </Text>
          </View>
          <View className="bg-bolt-warning-border px-2 py-0.5 rounded-md">
            <Text className="text-2xs font-inter-bold text-bolt-warning-text uppercase tracking-wider">
              Offline
            </Text>
          </View>
        </TouchableOpacity>
      ) : isSyncing ? (
        <View className="mt-2.5 bg-bolt-light border border-bolt-blue/20 rounded-xl px-3.5 py-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <ActivityIndicator size={14} color={Colors.primary} />
            <Text className="text-xs font-inter-semibold text-bolt-blue flex-1" numberOfLines={1}>
              {`Backing up ${pendingCount} sale${pendingCount === 1 ? "" : "s"} to cloud...`}
            </Text>
          </View>
          <View className="bg-bolt-light px-2 py-0.5 rounded-md border border-bolt-blue/20">
            <Text className="text-2xs font-inter-bold text-bolt-blue uppercase tracking-wider">
              Backing Up
            </Text>
          </View>
        </View>
      ) : pendingCount > 0 ? (
        <TouchableOpacity
          onPress={handleSyncPress}
          activeOpacity={0.85}
          className="mt-2.5 bg-bolt-warning-bg border border-bolt-warning-border rounded-xl px-3.5 py-2 flex-row items-center justify-between"
          accessibilityRole="button"
          accessibilityLabel="Back up sales"
        >
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <HugeiconsIcon icon={CloudUploadIcon} size={16} color={Colors.warning.text} />
            <Text className="text-xs font-inter-semibold text-bolt-warning-text flex-1" numberOfLines={1}>
              {`${pendingCount} sale${pendingCount === 1 ? "" : "s"} ready to back up`}
            </Text>
          </View>
          <View className="bg-bolt-blue px-2.5 py-1 rounded-lg">
            <Text className="text-2xs font-inter-bold text-white uppercase tracking-wider">
              Back Up Now
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Settings dropdown anchored dynamically via safe area insets */}
      <Modal
        visible={showGearMenu}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        {/* Full-screen dismiss backdrop */}
        <Pressable
          style={{ flex: 1 }}
          onPress={handleCloseMenu}
        >
          {/* Dropdown pinned top-right under the gear button */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 52,
              right: 16,
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <DropdownMenu onClose={handleCloseMenu} />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default React.memo(Header);
