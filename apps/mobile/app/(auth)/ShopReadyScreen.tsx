import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";

import { Colors } from "@/lib/colors";
import { Button } from "@/components/Elements/Buton";

export default function ShopReadyScreen() {
  const { shopName } = useLocalSearchParams<{ shopName?: string }>();
  const displayName = shopName ? decodeURIComponent(shopName) : "Your Shop";

  const handleAddProduct = () => {
    router.replace("/add-product");
  };

  const handleGoDashboard = () => {
    router.replace("/(main)");
  };

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface justify-between p-6">
      <View className="flex-1 items-center justify-center px-4">
        {/* Success Icon Badge */}
        <View className="w-24 h-24 rounded-full bg-bolt-light border-2 border-bolt-blue/20 items-center justify-center mb-6">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={48}
            color={Colors.primary}
          />
        </View>

        {/* Heading */}
        <Text className="text-3xl font-poppins-bold text-bolt-graphite text-center mb-2">
          {displayName} is Ready
        </Text>

        <Text className="text-sm font-inter text-bolt-slate text-center leading-6 max-w-xs">
          Your shop is set up and configured. You can now add inventory products or begin recording sales immediately.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="w-full gap-3 pb-4">
        <Button
          label="Add First Product"
          onPress={handleAddProduct}
          iconName={Add01Icon}
          isChecked={true}
        />

        <TouchableOpacity
          onPress={handleGoDashboard}
          className="w-full h-12 flex-row items-center justify-center gap-2 rounded-xl active:bg-bolt-card"
          activeOpacity={0.7}
        >
          <Text className="text-bolt-slate font-inter-medium text-sm">
            Go to Dashboard
          </Text>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            color={Colors.slate}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
