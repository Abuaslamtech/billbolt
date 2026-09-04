import { Shadows } from "@/lib/styles";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Home01Icon,
  Invoice01Icon,
  Package01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/lib/colors";

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 0) + (Platform.OS === "android" ? 24 : 16);
  const tabHeight = 40 + bottomPadding;

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
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          ...Shadows.header,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11.5,
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
