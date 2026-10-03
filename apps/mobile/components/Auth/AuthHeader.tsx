import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import logo from "@/assets/images/icon.png";

interface AuthHeaderProps {
  title: string;
  label: string;
}

export default function AuthHeader({ title, label }: AuthHeaderProps) {
  return (
    <View className="w-full items-center mb-6">
      {/* Brand Icon */}
      <View className="mb-4">
        <Image
          source={logo}
          className="w-16 h-16 rounded-2xl"
          contentFit="contain"
        />
      </View>

      {/* Proportional Heading Hierarchy */}
      <View className="w-full items-center px-2">
        <Text className="text-2xl font-poppins-bold text-bolt-graphite text-center tracking-tight">
          {title}
        </Text>
        <Text className="text-sm font-inter text-bolt-slate text-center mt-1.5 leading-5 max-w-[320px]">
          {label}
        </Text>
      </View>
    </View>
  );
}