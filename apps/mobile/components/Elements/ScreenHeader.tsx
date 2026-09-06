import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import Home01Icon from '@hugeicons/core-free-icons/Home01Icon';
import { router } from 'expo-router';
import BackButton from './BackButton';
import { Colors } from '@/lib/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showHome?: boolean;
  onHome?: () => void;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  showHome = true,
  onHome,
}: ScreenHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push('/(main)');
    }
  };

  return (
    <View className="flex-row justify-between items-center px-4 py-3 border-b border-bolt-border bg-bolt-card">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <BackButton onPress={handleBack} accessibilityLabel="Back" />
        )}
        <View className={`flex-1 ${showBack ? 'pr-2' : ''}`}>
          <Text
            numberOfLines={1}
            className="font-poppins-bold text-lg text-bolt-graphite leading-tight"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              numberOfLines={1}
              className="font-inter text-2xs text-bolt-slate mt-0.5"
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {showHome && (
        <TouchableOpacity
          onPress={handleHome}
          accessibilityRole="button"
          accessibilityLabel="Go to Home dashboard"
          className="flex-row items-center gap-1.5 bg-bolt-surface px-3 py-2 rounded-xl border border-bolt-border active:bg-bolt-divider shrink-0"
        >
          <HugeiconsIcon icon={Home01Icon} size={15} color={Colors.graphite} />
          <Text className="font-inter-semibold text-xs text-bolt-graphite">
            Home
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
