import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/lib/colors";

interface stepType {
  step?: number;
  setStep: React.Dispatch<React.SetStateAction<1 | 2>>;
}

export function ProgressIndicator({ step = 1, setStep }: stepType) {
  return (
    <>
      {/* steps indicator */}
      <View className="w-full flex-row items-center justify-center mb-6">
        <View className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step >= 1 ? "bg-bolt-blue" : "bg-bolt-disabled"
            }`}
          >
            <Text className="text-white font-semibold text-sm">1</Text>
          </View>
          <View
            className={`w-16 h-1 ${
              step >= 2 ? "bg-bolt-blue" : "bg-bolt-disabled"
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step >= 2 ? "bg-bolt-blue" : "bg-bolt-disabled"
            }`}
          >
            <Text className="text-white font-semibold text-sm">2</Text>
          </View>
        </View>
      </View>

      {/* header */}
      <View className="items-center">
        {step === 2 && (
          <TouchableOpacity
            onPress={() => setStep(1)}
            className="absolute left-0 top-0 p-2"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <Text className="text-3xl font-poppins-bold text-center text-bolt-graphite">
          {step === 1 ? "Create Account" : "Business Info"}
        </Text>
        <Text className="text-bolt-slate font-inter-medium text-center mt-2">
          {step === 1
            ? "Enter your personal details"
            : "Tell us about your business"}
        </Text>
      </View>
    </>
  );
}
