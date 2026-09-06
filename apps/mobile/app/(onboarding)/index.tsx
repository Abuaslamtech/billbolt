import React, { useRef, useState } from "react";
import {
Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Rocket01Icon from '@hugeicons/core-free-icons/Rocket01Icon';
import * as Haptics from "expo-haptics";
import ReanimatedAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { persistOnboarded } from "@/services/storage/auth";
import { Colors } from "@/lib/colors";
import NotificationPrimerModal from "@/components/Elements/NotificationPrimerModal";

import { Image } from 'expo-image';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SlideData {
  id: string;
  title: string;
  description: string;
  image: any;
}

const SLIDES: SlideData[] = [
  {
    id: "1",
    title: "Sell in Seconds,\nEven When Offline",
    description:
      "Log cash, transfer, or card sales at your counter with zero delay. Records save locally and sync automatically when internet returns.",
    image: require("@/assets/images/sales.png"),
  },
  {
    id: "2",
    title: "Automate Stock &\nPrevent Stockouts",
    description:
      "Inventory updates instantly with every checkout. Receive smart restock alerts before your best-selling items run out.",
    image: require("@/assets/images/inventory.png"),
  },
  {
    id: "3",
    title: "Branded Receipts &\nReal-Time Insights",
    description:
      "Issue professional WhatsApp or PDF receipts to build customer trust, and track daily revenue and top sellers in real time.",
    image: require("@/assets/images/access.png"),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(false);
  const flatListRef = useRef<FlatList<SlideData>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Spring button animation
  const buttonScale = useSharedValue(1);
  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleFinishOnboarding = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await persistOnboarded();
      router.replace("/(auth)");
    } catch (e) {
      console.error("Failed to complete onboarding:", e);
      router.replace("/(auth)");
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsNotificationPromptOpen(true);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Prompt clean notification primer on last slide
      setIsNotificationPromptOpen(true);
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-bolt-card">
      {/* ── Top Bar: Step indicator & Skip ───────────────────────────────── */}
      <View className="flex-row justify-between items-center px-6 pt-3.5 pb-2">
        <View className="bg-bolt-surface px-3 py-1 rounded-full border border-bolt-border">
          <Text className="text-xs text-bolt-slate font-inter-semibold">
            Step {currentIndex + 1} of {SLIDES.length}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="flex-row items-center gap-1 py-1 px-2"
          activeOpacity={0.7}
        >
          <Text className="text-xs font-inter-semibold text-bolt-slate">Skip</Text>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} color={Colors.slate} />
        </TouchableOpacity>
      </View>

      {/* ── Slides Carousel ─────────────────────────────────────────────── */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => {
          return (
            <View
              style={{ width: SCREEN_WIDTH }}
              className="px-6 items-center justify-between pt-2 pb-6"
            >
              {/* Natural Illustration Artwork — Borderless & Spacious */}
              <View
                style={{ width: SCREEN_WIDTH * 0.82, height: SCREEN_HEIGHT * 0.38 }}
                className="items-center justify-center mt-2"
              >
                <Image
                  source={item.image}
                  className="w-full h-full"
                  contentFit="contain"
                />
              </View>

              {/* Text & Content Section — Centered Editorial Balance */}
              <View className="w-full items-center px-3 mb-2">
                <Text className="text-2xl text-bolt-graphite font-poppins-bold text-center mb-2.5 leading-8">
                  {item.title}
                </Text>

                <Text className="text-sm text-bolt-slate font-inter text-center leading-6">
                  {item.description}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* ── Bottom Controls: Animated Dots & Action Button ─────────────────── */}
      <View className="px-6 pb-6 pt-3 bg-bolt-card gap-4">
        {/* Animated Progress Indicators */}
        <View className="flex-row items-center justify-center gap-1.5 h-3">
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: "clamp",
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: "clamp",
            });

            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#CBD5E1", Colors.primary, "#CBD5E1"],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  {
                    height: 6,
                    borderRadius: 3,
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: dotColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Tactile Action Button */}
        <ReanimatedAnimated.View
          style={[
            {
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            },
            animatedButton,
          ]}
          className="w-full rounded-2xl bg-bolt-blue overflow-hidden"
        >
          <Pressable
            onPress={handleNext}
            onPressIn={() => {
              buttonScale.value = withSpring(0.97, { stiffness: 400, damping: 15 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { stiffness: 400, damping: 15 });
            }}
            className="flex-row items-center justify-center h-14 px-6 gap-2.5"
          >
            <Text className="text-white text-base font-inter-bold">
              {isLastSlide ? "Get Started" : "Continue"}
            </Text>
            <View className="bg-white/20 w-6.5 h-6.5 rounded-full items-center justify-center">
              <HugeiconsIcon
                icon={isLastSlide ? Rocket01Icon : ArrowRight01Icon}
                size={16}
                color="#FFFFFF"
              />
            </View>
          </Pressable>
        </ReanimatedAnimated.View>
      </View>

      {/* ── Notification Primer Modal ── */}
      <NotificationPrimerModal
        visible={isNotificationPromptOpen}
        onComplete={handleFinishOnboarding}
      />
    </SafeAreaView>
  );
}
