import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Store01Icon from "@hugeicons/core-free-icons/Store01Icon";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import Location01Icon from "@hugeicons/core-free-icons/Location01Icon";
import Edit02Icon from "@hugeicons/core-free-icons/Edit02Icon";
import Delete02Icon from "@hugeicons/core-free-icons/Delete02Icon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Alert02Icon from "@hugeicons/core-free-icons/Alert02Icon";
import Package01Icon from "@hugeicons/core-free-icons/Package01Icon";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

import ScreenHeader from "@/components/Elements/ScreenHeader";
import { Button } from "@/components/Elements/Button";
import { Colors } from "@/lib/colors";
import { useAppDataStore } from "@/store/AppDataStore";
import { Store } from "@/types/models";

export default function StoresScreen() {
  const stores = useAppDataStore((state) => state.stores);
  const addNewStore = useAppDataStore((state) => state.addNewStore);
  const editStore = useAppDataStore((state) => state.editStore);
  const removeStore = useAppDataStore((state) => state.removeStore);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingStore(null);
    setStoreName("");
    setStoreLocation("");
    setIsDefault(stores.length === 0);
    setIsModalOpen(true);
  }, [stores.length]);

  const handleOpenEdit = useCallback((store: Store) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingStore(store);
    setStoreName(store.name);
    setStoreLocation(store.location || "");
    setIsDefault(store.isDefault);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingStore(null);
    setStoreName("");
    setStoreLocation("");
    setIsDefault(false);
  }, []);

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      Toast.show({
        type: "error",
        text1: "Store Name Required",
        text2: "Please enter a name for this store or warehouse.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (editingStore) {
        await editStore(editingStore.id, {
          name: storeName.trim(),
          location: storeLocation.trim() || undefined,
          isDefault,
        });
        Toast.show({
          type: "success",
          text1: "Store Updated",
          text2: `Saved changes to ${storeName.trim()}.`,
        });
      } else {
        await addNewStore({
          name: storeName.trim(),
          location: storeLocation.trim() || undefined,
          isDefault,
        });
        Toast.show({
          type: "success",
          text1: "Store Added",
          text2: `Created new location ${storeName.trim()}.`,
        });
      }

      handleCloseModal();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Save",
        text2: err?.message || "Could not save store details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = (store: Store) => {
    if (store.isDefault) {
      Toast.show({
        type: "error",
        text1: "Cannot Delete Primary",
        text2: "Set another store as primary before deleting this one.",
      });
      return;
    }

    Alert.alert(
      "Delete Store",
      `Are you sure you want to remove "${store.name}"? Only empty stores with no sales can be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await removeStore(store.id);
              Toast.show({
                type: "success",
                text1: "Store Removed",
                text2: `Deleted ${store.name}.`,
              });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Cannot Delete",
                text2: err?.response?.data?.message || err?.message || "Store has recorded sales.",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      <ScreenHeader title="Stores & Warehouses" />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Intro banner */}
        <View className="bg-bolt-card border border-bolt-border rounded-2xl p-4 mb-4 shadow-2xs">
          <View className="flex-row items-center gap-2.5 mb-1.5">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
              <HugeiconsIcon icon={Store01Icon} size={18} color={Colors.primary} />
            </View>
            <Text className="text-sm font-poppins-semibold text-bolt-graphite">
              Multi-Location Inventory
            </Text>
          </View>
          <Text className="text-xs font-inter text-bolt-slate leading-relaxed">
            Manage your physical shops, depot warehouses, and backrooms. Each store tracks its own stock count and low-stock alerts.
          </Text>
        </View>

        {/* Store List Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xs font-inter-semibold text-bolt-slate uppercase tracking-wider">
            Active Locations ({stores.length})
          </Text>
          <TouchableOpacity
            onPress={handleOpenAdd}
            className="flex-row items-center gap-1.5 bg-bolt-blue rounded-xl px-3 py-1.5 active:opacity-90"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} color="#FFFFFF" />
            <Text className="text-xs font-inter-semibold text-white">Add Store</Text>
          </TouchableOpacity>
        </View>

        {/* Store Cards */}
        {stores.map((store) => {
          return (
            <View
              key={store.id}
              className="bg-bolt-card border border-bolt-border rounded-2xl p-4 mb-3 shadow-2xs"
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2 flex-wrap mb-1">
                    <Text className="text-base font-poppins-semibold text-bolt-graphite">
                      {store.name}
                    </Text>
                    {store.isDefault && (
                      <View className="bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5">
                        <Text className="text-2xs font-inter-bold text-bolt-blue uppercase tracking-wider">
                          Primary
                        </Text>
                      </View>
                    )}
                  </View>

                  {store.location ? (
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <HugeiconsIcon icon={Location01Icon} size={13} color={Colors.slate} />
                      <Text className="text-xs font-inter text-bolt-slate" numberOfLines={1}>
                        {store.location}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Edit & Delete Action Buttons */}
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(store)}
                    className="w-8 h-8 rounded-lg bg-bolt-surface border border-bolt-border items-center justify-center active:bg-bolt-divider"
                  >
                    <HugeiconsIcon icon={Edit02Icon} size={15} color={Colors.slate} />
                  </TouchableOpacity>
                  {!store.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleDeleteStore(store)}
                      className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 items-center justify-center active:bg-red-100"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={15} color={Colors.danger.text} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Store Metrics Strip */}
              <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-bolt-divider">
                <View className="flex-row items-center gap-1.5">
                  <HugeiconsIcon icon={Package01Icon} size={14} color={Colors.slate} />
                  <Text className="text-xs font-inter-medium text-bolt-slate">
                    {store.productCount ?? 0} Products
                  </Text>
                </View>

                {(store.lowStockCount ?? 0) > 0 ? (
                  <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <HugeiconsIcon icon={Alert02Icon} size={12} color="#D97706" />
                    <Text className="text-2xs font-inter-semibold text-amber-700">
                      {store.lowStockCount} Low Stock
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color="#059669" />
                    <Text className="text-2xs font-inter-semibold text-emerald-700">
                      Stock Healthy
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add / Edit Store Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center bg-black/50 px-5"
        >
          <View className="bg-bolt-card rounded-3xl p-5 border border-bolt-border shadow-xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-bolt-border mb-4">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                  <HugeiconsIcon icon={Store01Icon} size={18} color={Colors.primary} />
                </View>
                <Text className="text-base font-poppins-semibold text-bolt-graphite">
                  {editingStore ? "Edit Store Location" : "New Store / Warehouse"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                className="w-8 h-8 rounded-full bg-bolt-surface items-center justify-center"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="gap-3.5 mb-5">
              <View>
                <Text className="text-xs font-inter-semibold text-bolt-graphite mb-1.5">
                  Store / Location Name *
                </Text>
                <TextInput
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="e.g. Main Shop, Alaba Warehouse, Backroom"
                  placeholderTextColor={Colors.slate}
                  className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 py-3 text-sm font-inter text-bolt-graphite"
                  autoFocus
                />
              </View>

              <View>
                <Text className="text-xs font-inter-semibold text-bolt-graphite mb-1.5">
                  Physical Address / Note (Optional)
                </Text>
                <TextInput
                  value={storeLocation}
                  onChangeText={setStoreLocation}
                  placeholder="e.g. Block 4, Shop 12, Alaba Int'l Market"
                  placeholderTextColor={Colors.slate}
                  className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 py-3 text-sm font-inter text-bolt-graphite"
                />
              </View>

              {/* Set as Default Switch */}
              <TouchableOpacity
                onPress={() => setIsDefault(!isDefault)}
                activeOpacity={0.8}
                className="flex-row items-center justify-between bg-bolt-surface border border-bolt-border rounded-xl px-3.5 py-3 mt-1"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-xs font-inter-semibold text-bolt-graphite">
                    Primary Store
                  </Text>
                  <Text className="text-2xs font-inter text-bolt-slate mt-0.5">
                    Default fulfillment location for new sales and restocks.
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border ${
                    isDefault ? "bg-bolt-blue border-bolt-blue" : "border-bolt-border bg-white"
                  }`}
                >
                  {isDefault && (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="md"
                  fullWidth
                  onPress={handleCloseModal}
                />
              </View>
              <View className="flex-1">
                <Button
                  label={isSubmitting ? "Saving..." : editingStore ? "Save Changes" : "Create Store"}
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={isSubmitting}
                  onPress={handleSaveStore}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
