import React from "react";
import { Shadows } from "@/lib/styles";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Home01Icon from "@hugeicons/core-free-icons/Home01Icon";
import Invoice01Icon from "@hugeicons/core-free-icons/Invoice01Icon";
import Coins01Icon from "@hugeicons/core-free-icons/Coins01Icon";
import Package01Icon from "@hugeicons/core-free-icons/Package01Icon";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { useAuthStore } from "@/store/authStore";
import { useAppDataStore } from "@/store/AppDataStore";
import { View, Text, TouchableOpacity } from "react-native";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const overdueDebtorsCount = useAppDataStore(
    (state) => state.metrics?.overdueDebtorsCount || 0,
  );

  // Defensive guard: user without a business must complete shop setup
  if (user && !user.business) {
    return <Redirect href="/(auth)/SetupShopWizard" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.slate,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          overflow: "visible",
          ...Shadows.header,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          marginTop: 3,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          overflow: "visible",
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Home01Icon} size={22} color={color} />
          ),
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="ReceiptScreen"
        options={{
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Invoice01Icon} size={22} color={color} />
          ),
          title: "Receipts",
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarStyle: { display: "none" },
          tabBarButton: ({ onPress }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPress?.(e);
              }}
              accessibilityRole="button"
              accessibilityLabel="Record a sale"
              accessibilityHint="Opens the sales catalog to start a new sale transaction"
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible",
              }}
            >
              <View
                style={[
                  Shadows.heroButton,
                  {
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: Colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#FFFFFF",
                    position: "absolute",
                    bottom: Math.max(insets.bottom, 8) + 8,
                  },
                ]}
              >
                <HugeiconsIcon icon={Add01Icon} size={26} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Inter_600SemiBold",
                  color: Colors.primary,
                  lineHeight: 13,
                  marginTop: 18,
                }}
              >
                Sell
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="InventoryScreen"
        options={{
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Package01Icon} size={22} color={color} />
          ),
          title: "Inventory",
        }}
      />
      <Tabs.Screen
        name="CreditScreen"
        options={{
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Coins01Icon} size={22} color={color} />
          ),
          title: "Debts",
          tabBarBadge:
            overdueDebtorsCount > 0 ? overdueDebtorsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.danger.text,
          },
        }}
      />
    </Tabs>
  );
}
