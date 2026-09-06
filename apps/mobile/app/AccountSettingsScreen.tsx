import React from "react";
import {
ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Notification03Icon from '@hugeicons/core-free-icons/Notification03Icon';
import Mail01Icon from '@hugeicons/core-free-icons/Mail01Icon';
import LockPasswordIcon from '@hugeicons/core-free-icons/LockPasswordIcon';
import FingerPrintIcon from '@hugeicons/core-free-icons/FingerPrintIcon';
import Globe02Icon from '@hugeicons/core-free-icons/Globe02Icon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Camera01Icon from '@hugeicons/core-free-icons/Camera01Icon';
import Edit02Icon from '@hugeicons/core-free-icons/Edit02Icon';
import User03Icon from '@hugeicons/core-free-icons/User03Icon';
import Call02Icon from '@hugeicons/core-free-icons/Call02Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import ShieldCheckIcon from '@hugeicons/core-free-icons/ShieldCheckIcon';
import * as Haptics from "expo-haptics";

import { Colors } from "@/lib/colors";
import FeaturePreviewModal from "@/components/Elements/FeaturePreviewModal";
import BackButton from "@/components/Elements/BackButton";
import ScreenHeader from "@/components/Elements/ScreenHeader";
import { Button } from "@/components/Elements/Buton";
import { useAccountSettingsScreen } from "@/hooks/useAccountSettingsScreen";

import SettingRow from "@/components/Elements/SettingRow";

import { Image } from 'expo-image';
export default function AccountSettingsScreen() {
  const {
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
  } = useAccountSettingsScreen();

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      {/* Top Header */}
      <ScreenHeader title="My Account & Security" showHome={false} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── 1. OPERATOR / PERSONAL PROFILE CARD ── */}
        <View className="mx-4 mt-4 bg-bolt-card rounded-2xl border border-bolt-border p-4 shadow-2xs">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xs font-inter-semibold text-bolt-slate uppercase tracking-wider">
              Operator Account
            </Text>
            <TouchableOpacity
              onPress={openEditModal}
              className="flex-row items-center gap-1 bg-bolt-light border border-bolt-blue/20 rounded-lg px-2.5 py-1 active:scale-95"
            >
              <HugeiconsIcon icon={Edit02Icon} size={12} color={Colors.primary} />
              <Text className="text-2xs font-inter-bold text-bolt-blue">Edit Details</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3.5">
            {/* User Avatar */}
            <View className="relative">
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={isUploadingAvatar}
                className="w-16 h-16 rounded-full bg-bolt-light border-2 border-bolt-blue/20 items-center justify-center overflow-hidden active:scale-95"
                accessibilityRole="button"
                accessibilityLabel="Change profile avatar"
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <Text className="text-bolt-blue text-xl font-poppins-bold">
                    {userInitials}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Camera Badge */}
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bolt-blue items-center justify-center border border-white active:scale-90"
              >
                <HugeiconsIcon icon={Camera01Icon} size={11} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Name + Email + Role */}
            <View className="flex-1">
              <Text className="text-base font-poppins-bold text-bolt-graphite" numberOfLines={1}>
                {user?.fullName || "Account Owner"}
              </Text>
              <Text className="text-xs font-inter text-bolt-slate mt-0.5" numberOfLines={1}>
                {user?.email}
              </Text>
              {user?.phone ? (
                <Text className="text-xs font-inter text-bolt-slate mt-0.5">
                  {user.phone}
                </Text>
              ) : null}
              <View className="mt-1.5 flex-row items-center gap-1.5">
                <View className="bg-bolt-light border border-bolt-blue/20 rounded-full px-2 py-0.5">
                  <Text className="text-2xs font-inter-semibold text-bolt-blue uppercase">
                    {user?.role || "OWNER"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={13} color="#10B981" />
                  <Text className="text-2xs font-inter-medium text-emerald-600">Verified</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── 2. NOTIFICATIONS ── */}
        <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest mx-4 mt-6 mb-2">
          Notifications
        </Text>
        <View className="mx-4 bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden">
          <SettingRow
            icon={Notification03Icon}
            label="Push Notifications"
            description="Sales alerts and low-stock warnings"
            right={
              <Switch
                value={pushEnabled}
                onValueChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPushEnabled(val);
                }}
                trackColor={{ false: "#E5E7EB", true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon={Mail01Icon}
            label="Email Notifications"
            description="Weekly summaries and receipts"
            right={
              <Switch
                value={emailEnabled}
                onValueChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEmailEnabled(val);
                }}
                trackColor={{ false: "#E5E7EB", true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* ── 3. SECURITY ── */}
        <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest mx-4 mt-6 mb-2">
          Security & Access
        </Text>
        <View className="mx-4 bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden">
          <SettingRow
            icon={LockPasswordIcon}
            label="Change Password"
            description="Update your sign-in password"
            onPress={() => router.push("/(auth)/ForgotPasswordScreen")}
          />
          <SettingRow
            icon={FingerPrintIcon}
            label="App Lock"
            description="Require fingerprint or Face ID to open Billbolt"
            right={
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: "#E5E7EB", true: Colors.primary }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon={Globe02Icon}
            label="Active Sessions"
            description="Manage devices logged into your account"
            onPress={() =>
              openPreviewFeature(
                "Multi-Device Sessions",
                "View and remotely revoke active POS and mobile tablet sessions connected to your business workspace."
              )
            }
          />
        </View>

        {/* ── 4. DANGER ZONE ── */}
        <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-widest mx-4 mt-6 mb-2">
          Danger Zone
        </Text>
        <View className="mx-4 bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden">
          <SettingRow
            icon={Delete02Icon}
            label="Delete Account"
            description="Permanently remove all your data"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>
      </ScrollView>

      {/* ── EDIT PERSONAL PROFILE MODAL ── */}
      <Modal visible={isEditProfileOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 justify-end bg-black/50"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-end">
              <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[85%]">
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <View className="flex-row items-center justify-between pb-3 border-b border-bolt-divider mb-4">
                    <Text className="font-poppins-bold text-base text-bolt-graphite">
                      Edit Operator Details
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsEditProfileOpen(false)}
                      className="w-8 h-8 rounded-full bg-bolt-surface border border-bolt-border items-center justify-center"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
                    </TouchableOpacity>
                  </View>

                  {/* Full Name */}
                  <View className="mb-3.5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Full Name
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={User03Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={editFullName}
                        onChangeText={setEditFullName}
                        placeholder="Enter your name"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Personal Phone */}
                  <View className="mb-5">
                    <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider mb-1.5">
                      Personal Phone Number
                    </Text>
                    <View className="h-12 flex-row items-center border border-bolt-border rounded-xl px-3.5 bg-bolt-surface">
                      <HugeiconsIcon icon={Call02Icon} size={18} color={Colors.slate} />
                      <TextInput
                        value={editPhone}
                        onChangeText={setEditPhone}
                        placeholder="Enter personal phone"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        className="flex-1 ml-2.5 font-inter text-sm text-bolt-graphite"
                      />
                    </View>
                  </View>

                  <Button
                    label={isSavingProfile ? "Saving..." : "Save Details"}
                    onPress={handleSaveProfile}
                    loading={isSavingProfile}
                    isChecked={true}
                  />
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Feature Preview Modal */}
      <FeaturePreviewModal
        visible={previewFeature.visible}
        onClose={closePreviewFeature}
        title={previewFeature.title}
        description={previewFeature.description}
      />
    </SafeAreaView>
  );
}
