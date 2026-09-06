import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowLeft02Icon from "@hugeicons/core-free-icons/ArrowLeft02Icon";
import { Colors } from "@/lib/colors";

interface ProgressIndicatorProps {
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

export function ProgressIndicator({
  step = 1,
  totalSteps,
  onBack,
  title,
  subtitle,
}: ProgressIndicatorProps) {
  return (
    <View className="w-full mb-6">
      {/* Step dots or progress bar if multi-step */}
      {totalSteps && totalSteps > 1 ? (
        <View className="flex-row items-center justify-center mb-6 gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const current = index + 1;
            const isCompleted = step >= current;
            return (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "w-8 bg-bolt-blue"
                    : "w-4 bg-bolt-disabled"
                }`}
              />
            );
          })}
        </View>
      ) : null}

      {/* Header text */}
      <View className="items-center relative px-8">
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            className="absolute left-0 top-1 p-2 active:opacity-70"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={Colors.graphite} />
          </TouchableOpacity>
        ) : null}
        {title ? (
          <Text className="text-2xl font-poppins-bold text-center text-bolt-graphite">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="text-bolt-slate font-inter text-xs text-center mt-1 leading-5">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
