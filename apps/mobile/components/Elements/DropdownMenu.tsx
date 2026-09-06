import useAuth from "@/hooks/useAuth";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Store01Icon from '@hugeicons/core-free-icons/Store01Icon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import InformationCircleIcon from '@hugeicons/core-free-icons/InformationCircleIcon';
import Logout01Icon from '@hugeicons/core-free-icons/Logout01Icon';
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/lib/colors";
import { Shadows } from "@/lib/styles";

interface DropdownMenuProps {
  onClose?: () => void;
}

export default function DropdownMenu({ onClose }: DropdownMenuProps) {
  const { LogOut } = useAuth();

  const navigate = (path: string) => {
    onClose?.();
    router.push(path as any);
  };

  const handleLogOutPress = async () => {
    onClose?.();
    await LogOut();
  };

  const menuItems = [
    {
      icon: Store01Icon,
      label: "Store Profile",
      onPress: () => navigate("/StoreProfileScreen"),
      color: Colors.slate,
    },
    {
      icon: UserIcon,
      label: "My Account",
      onPress: () => navigate("/AccountSettingsScreen"),
      color: Colors.slate,
    },
    {
      icon: InformationCircleIcon,
      label: "About",
      onPress: () => navigate("/AboutScreen"),
      color: Colors.slate,
    },
    {
      icon: Logout01Icon,
      label: "Log Out",
      onPress: handleLogOutPress,
      color: Colors.danger.text,
      divider: true,
    },
  ];

  return (
    <View
      className="flex flex-col w-56 bg-bolt-card rounded-2xl border border-bolt-border overflow-hidden"
      style={Shadows.modal}
    >
      {menuItems.map((item, index) => (
        <View key={index}>
          {item.divider && (
            <View className="h-px bg-bolt-border mx-3 my-1" />
          )}
          <TouchableOpacity
            onPress={item.onPress}
            className="flex-row items-center px-4 py-3 active:bg-bolt-divider"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  item.color === Colors.danger.text ? Colors.danger.bg : Colors.divider,
              }}
            >
              <HugeiconsIcon icon={item.icon} size={16} color={item.color} />
            </View>
            <Text
              className={`text-sm font-inter-medium ml-3 ${
                item.color === Colors.danger.text
                  ? "text-bolt-danger-text"
                  : "text-bolt-graphite"
              }`}
              style={{ flex: 1 }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
