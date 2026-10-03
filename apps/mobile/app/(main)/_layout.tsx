import { Shadows } from "@/lib/styles";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Home01Icon from '@hugeicons/core-free-icons/Home01Icon';
import Invoice01Icon from '@hugeicons/core-free-icons/Invoice01Icon';
import Coins01Icon from '@hugeicons/core-free-icons/Coins01Icon';
import Package01Icon from '@hugeicons/core-free-icons/Package01Icon';
import Analytics01Icon from '@hugeicons/core-free-icons/Analytics01Icon';
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";
import { useAuthStore } from "@/store/authStore";
import { useAppDataStore } from "@/store/AppDataStore";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const overdueDebtorsCount = useAppDataStore(
    (state) => state.metrics?.overdueDebtorsCount || 0
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
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F3F4F6",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          ...Shadows.header,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          marginTop: 3,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
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
          title: "Sales",
        }}
      />
      <Tabs.Screen
        name="CreditScreen"
        options={{
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Coins01Icon} size={22} color={color} />
          ),
          title: "Credit",
          tabBarBadge: overdueDebtorsCount > 0 ? overdueDebtorsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.danger.text,
          },
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
        name="ReportScreen"
        options={{
          tabBarIcon: ({ color }) => (
            <HugeiconsIcon icon={Analytics01Icon} size={22} color={color} />
          ),
          title: "Reports",
        }}
      />
    </Tabs>
  );
}

