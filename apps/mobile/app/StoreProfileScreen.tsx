import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Store01Icon from '@hugeicons/core-free-icons/Store01Icon';
import Camera01Icon from '@hugeicons/core-free-icons/Camera01Icon';
import Location01Icon from '@hugeicons/core-free-icons/Location01Icon';
import Call02Icon from '@hugeicons/core-free-icons/Call02Icon';
import Mail01Icon from '@hugeicons/core-free-icons/Mail01Icon';
import MoneyExchange01Icon from '@hugeicons/core-free-icons/MoneyExchange01Icon';
import SquareLock02Icon from '@hugeicons/core-free-icons/SquareLock02Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Edit02Icon from '@hugeicons/core-free-icons/Edit02Icon';
import { Button } from "@/components/Elements/Buton";
import SettingRow from "@/components/Elements/SettingRow";
import ScreenHeader from "@/components/Elements/ScreenHeader";
import { Colors } from "@/lib/colors";
import { getCurrencySymbol } from "@/lib/formatters";
import { useStoreProfileScreen } from "@/hooks/useStoreProfileScreen";
import { useAppDataStore } from "@/store/AppDataStore";

import { Image } from 'expo-image';
export default function StoreProfileScreen() {
  const { businessInfo } = useAppDataStore();
  const {
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
    logoUrl,
    initials,
    isUploadingLogo,
    isSaving,
    isEditStoreOpen,
    setIsEditStoreOpen,
    openEditModal,
    handlePickLogo,
    handleSave,
  } = useStoreProfileScreen();

  const savedName = businessInfo?.name || "Your Store Name";
  const savedType = businessInfo?.type || "Retail & Commerce";
  const savedPhone = businessInfo?.phone || "No phone added";
  const savedEmail = businessInfo?.email || "No email added";
  const savedAddress = businessInfo?.address || "No address added";
  const savedCurrency = businessInfo?.currency || "NGN";

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      {/* Top Header */}
      <ScreenHeader title="Store Profile" showHome={false} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── 1. STORE HERO CARD (Read-Only) ── */}
        <View className="mx-4 mt-4 bg-bolt-card rounded-2xl border border-bolt-border p-4 shadow-2xs">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xs font-inter-semibold text-bolt-slate uppercase tracking-wider">
              Store Identity
            </Text>
            <TouchableOpacity
              onPress={openEditModal}
              className="flex-row items-center gap-1 bg-bolt-light border border-bolt-blue/20 rounded-lg px-2.5 py-1 active:scale-95"
              accessibilityRole="button"
              accessibilityLabel="Edit store details"
            >
              <HugeiconsIcon icon={Edit02Icon} size={12} color={Colors.primary} />
              <Text className="text-2xs font-inter-bold text-bolt-blue">Edit Details</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3.5">
            {/* Store Logo */}
            <View className="relative">
              <TouchableOpacity
                onPress={handlePickLogo}
                disabled={isUploadingLogo}
                className="w-16 h-16 rounded-2xl bg-bolt-light border-2 border-bolt-blue/20 items-center justify-center overflow-hidden active:scale-95"
                accessibilityRole="button"
                accessibilityLabel="Upload or change store logo"
              >
                {isUploadingLogo ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <Text className="text-bolt-blue text-xl font-poppins-bold">
                    {initials}
                  </Text>
                )}
              </TouchableOpacity>
              {/* Camera Badge */}
              <TouchableOpacity
                onPress={handlePickLogo}
                disabled={isUploadingLogo}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bolt-blue items-center justify-center border border-white active:scale-90"
              >
                <HugeiconsIcon icon={Camera01Icon} size={11} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Name + Type */}
            <View className="flex-1">
              <Text className="text-base font-poppins-bold text-bolt-graphite" numberOfLines={1}>
                {savedName}
              </Text>
              <View className="mt-1.5 flex-row items-start">
                <View className="bg-bolt-light border border-bolt-blue/20 rounded-full px-2 py-0.5">
                  <Text className="text-2xs font-inter-semibold text-bolt-blue uppercase tracking-wider">
                    {savedType}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── 2. STORE CONTACT & INFORMATION (Read-Only) ── */}
        <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest mx-4 mt-6 mb-2">
          Contact Information
        </Text>
        <View className="mx-4 bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden">
          <SettingRow
            icon={Call02Icon}
            label="Business Phone"
            description={savedPhone}
            onPress={openEditModal}
          />
          <SettingRow
            icon={Mail01Icon}
            label="Business Email"
            description={savedEmail}
            onPress={openEditModal}
          />
          <SettingRow
            icon={Location01Icon}
            label="Business Address"
            description={savedAddress}
            onPress={openEditModal}
          />
        </View>

        {/* ── 3. FINANCIAL SETTINGS ── */}
        <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest mx-4 mt-6 mb-2">
          Financial Settings
        </Text>
        <View className="mx-4 bg-bolt-card rounded-2xl border border-bolt-border p-4 shadow-2xs">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-bolt-light items-center justify-center">
                <HugeiconsIcon icon={MoneyExchange01Icon} size={20} color={Colors.primary} />
              </View>
              <View>
                <Text className="text-sm font-inter-semibold text-bolt-graphite">
                  Store Currency
                </Text>
                <Text className="text-xs font-inter text-bolt-slate">
                  {savedCurrency} ({getCurrencySymbol(savedCurrency)})
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 bg-bolt-surface border border-bolt-border rounded-lg px-2.5 py-1">
              <HugeiconsIcon icon={SquareLock02Icon} size={12} color={Colors.slate} />
              <Text className="text-2xs font-inter-medium text-bolt-slate">Locked</Text>
            </View>
          </View>
          <Text className="text-2xs font-inter text-bolt-slate mt-2.5 leading-4">
            Currency is permanently locked to protect product pricing and historical sales reporting.
          </Text>
        </View>
      </ScrollView>

      {/* ── EDIT STORE DETAILS MODAL (Bottom Sheet) ── */}
      <Modal visible={isEditStoreOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 justify-end bg-black/50"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-end">
              <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[90%]">
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <View className="flex-row items-center justify-between pb-3 border-b border-bolt-divider mb-4">
                    <Text className="font-poppins-bold text-base text-bolt-graphite">
                      Edit Store Details
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsEditStoreOpen(false)}
                      className="w-8 h-8 rounded-full bg-bolt-surface border border-bolt-border items-center justify-center"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
                    </TouchableOpacity>
                  </View>

                  {/* Business Name */}
                  <View className="mb-3.5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Business / Store Name *
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={Store01Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Al-Barakah Supermarket"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Business Category / Type */}
                  <View className="mb-3.5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Business Type / Tagline
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={Store01Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={type}
                        onChangeText={setType}
                        placeholder="e.g. Boutique, Pharmacy, Provisions"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Business Phone */}
                  <View className="mb-3.5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Receipt Contact Phone
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={Call02Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="e.g. 08012345678"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                      />
                    </View>
                  </View>

                  {/* Business Email */}
                  <View className="mb-3.5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Business Email
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={Mail01Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="e.g. store@example.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                      />
                    </View>
                  </View>

                  {/* Address */}
                  <View className="mb-5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Physical Store Address
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={Location01Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Suite 4, Plaza B, Main Market"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                        autoCapitalize="sentences"
                      />
                    </View>
                  </View>

                  <Button
                    label={isSaving ? "Saving..." : "Save Details"}
                    onPress={() => handleSave()}
                    loading={isSaving}
                    isChecked={true}
                  />
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
