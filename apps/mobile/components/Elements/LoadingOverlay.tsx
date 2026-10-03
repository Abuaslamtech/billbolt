import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '@/lib/colors';
import { Shadows } from '@/lib/styles';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  submessage?: string;
}

/**
 * Screen-blocking modal overlay that intercepts all touch events, gesture inputs,
 * and hardware back-presses during asynchronous form submissions and transactions.
 */
export function LoadingOverlay({
  visible,
  message = "Processing...",
  submessage,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Suppress Android hardware back-button during active operations
      }}
    >
      <View className="flex-1 bg-black/45 items-center justify-center px-6">
        <View
          className="w-full max-w-[280px] bg-bolt-card rounded-3xl p-6 items-center border border-bolt-border/80"
          style={Shadows.modal}
        >
          {/* Spinner Badge */}
          <View className="w-14 h-14 rounded-2xl bg-bolt-light items-center justify-center mb-3.5 border border-bolt-blue/20">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>

          {/* Primary Heading */}
          <Text
            numberOfLines={2}
            className="font-poppins-semibold text-base text-bolt-graphite text-center leading-snug"
          >
            {message}
          </Text>

          {/* Subtitle / Context */}
          {submessage && (
            <Text
              numberOfLines={2}
              className="font-inter text-xs text-bolt-slate text-center mt-1.5 leading-normal"
            >
              {submessage}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default LoadingOverlay;
