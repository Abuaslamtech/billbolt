import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Store01Icon,
  Call02Icon,
  Location01Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/lib/colors";
import { useSetupBusinessScreen } from "@/hooks/useSetupBusinessScreen";
import { Shadows } from "@/lib/styles";

export default function SetupBusinessScreen() {
  const user = useAuthStore((state) => state.user);
  const {
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
    categories,
    currencies,
  } = useSetupBusinessScreen();

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner */}
          <View className="items-center mb-6 mt-2">
            <View className="w-15 h-15 rounded-full bg-bolt-light border border-bolt-blue/20 items-center justify-center mb-3">
              <HugeiconsIcon icon={Store01Icon} size={28} color={Colors.primary} />
            </View>
            <Text className="text-2xl font-poppins-bold text-bolt-graphite mb-1.5 text-center">
              Set Up Your Store
            </Text>
            <Text className="text-xs text-bolt-slate text-center font-inter leading-5 px-2.5">
              Welcome{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
              Enter your store details to customize your receipts and manage sales.
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-bolt-card rounded-2xl p-5 border border-bolt-border mb-6 gap-4 shadow-sm">
            {/* Store Name */}
            <View className="gap-1.5">
              <Text className="text-xs font-inter-semibold text-bolt-graphite">
                Store / Business Name <Text className="text-bolt-danger-text">*</Text>
              </Text>
              <View className="flex-row items-center bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-12">
                <HugeiconsIcon
                  icon={Store01Icon}
                  size={20}
                  color={Colors.slate}
                />
                <TextInput
                  className="flex-1 ml-2.5 text-sm text-bolt-graphite font-inter-medium py-0"
                  placeholder="e.g. Al-Barakah Mart, Apex Global"
                  placeholderTextColor={Colors.slate}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Business Category Pills */}
            <View className="gap-1.5">
              <Text className="text-xs font-inter-semibold text-bolt-graphite">Business Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-2 py-1"
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedCategory(cat);
                      }}
                      className={`px-3.5 py-2 rounded-full border mr-2 ${
                        isSelected
                          ? "bg-bolt-light border-bolt-blue"
                          : "bg-bolt-surface border-bolt-border"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-xs ${
                          isSelected
                            ? "text-bolt-blue font-inter-bold"
                            : "text-bolt-slate font-inter-medium"
                        }`}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Phone Number */}
            <View className="gap-1.5">
              <Text className="text-xs font-inter-semibold text-bolt-graphite">Phone / WhatsApp (for Receipts)</Text>
              <View className="flex-row items-center bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-12">
                <HugeiconsIcon
                  icon={Call02Icon}
                  size={20}
                  color={Colors.slate}
                />
                <TextInput
                  className="flex-1 ml-2.5 text-sm text-bolt-graphite font-inter-medium py-0"
                  placeholder="e.g. +234 801 234 5678"
                  placeholderTextColor={Colors.slate}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Store Address */}
            <View className="gap-1.5">
              <Text className="text-xs font-inter-semibold text-bolt-graphite">Store Address (Optional)</Text>
              <View className="flex-row items-center bg-bolt-surface border border-bolt-border rounded-xl px-3.5 h-12">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={20}
                  color={Colors.slate}
                />
                <TextInput
                  className="flex-1 ml-2.5 text-sm text-bolt-graphite font-inter-medium py-0"
                  placeholder="e.g. 14 Marina Road, Lagos"
                  placeholderTextColor={Colors.slate}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Currency Selector */}
            <View className="gap-1.5">
              <Text className="text-xs font-inter-semibold text-bolt-graphite">Default Currency</Text>
              <View className="flex-row gap-2.5">
                {currencies.map((curr) => {
                  const isSelected = currency === curr.code;
                  return (
                    <TouchableOpacity
                      key={curr.code}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setCurrency(curr.code);
                      }}
                      className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border gap-1 ${
                        isSelected
                          ? "bg-bolt-light border-bolt-blue"
                          : "bg-bolt-surface border-bolt-border"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-inter-bold ${
                          isSelected ? "text-bolt-blue" : "text-bolt-slate"
                        }`}
                      >
                        {curr.symbol}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isSelected
                            ? "text-bolt-blue font-inter-bold"
                            : "text-bolt-slate font-inter-semibold"
                        }`}
                      >
                        {curr.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
            className="rounded-2xl overflow-hidden shadow-sm active:scale-98"
            style={Shadows.primaryButton}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-14 flex-row items-center justify-center gap-2.5 px-5"
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-base font-inter-bold text-white">
                    Complete Setup & Launch
                  </Text>
                  <HugeiconsIcon icon={ArrowRight02Icon} size={18} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
