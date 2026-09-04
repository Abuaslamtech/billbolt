import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowLeft02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import { InputField } from "@/components/Elements/InputField";
import { Button } from "@/components/Elements/Buton";
import { Colors } from "@/lib/colors";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordScreen() {
  const {
    email,
    setEmail,
    loading,
    isSubmitted,
    handleResetPassword,
  } = useForgotPassword();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "space-between" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-bolt-surface border border-bolt-border items-center justify-center mb-6"
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={20} color={Colors.graphite} />
            </TouchableOpacity>

            {!isSubmitted ? (
              <>
                {/* Header Text */}
                <Text className="text-2xl font-poppins-bold text-bolt-graphite mb-2">
                  Forgot Password?
                </Text>
                <Text className="text-sm font-inter text-bolt-slate leading-5 mb-8">
                  Enter your registered email address and we will send you a link to reset your password.
                </Text>

                {/* Email Input */}
                <InputField
                  icon="email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Business or Personal Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                {/* Submit Button */}
                <Button
                  label={loading ? "Sending..." : "Send Reset Link"}
                  onPress={handleResetPassword}
                  loading={loading}
                  isChecked={true}
                  disabled={loading}
                />
              </>
            ) : (
              /* Success State */
              <View className="items-center py-8">
                <View className="w-16 h-16 rounded-full bg-bolt-success-bg border border-bolt-success-border items-center justify-center mb-4">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} color={Colors.mint} />
                </View>

                <Text className="text-xl font-poppins-bold text-bolt-graphite text-center mb-2">
                  Check Your Email
                </Text>

                <Text className="text-sm font-inter text-bolt-slate text-center leading-5 mb-6 px-4">
                  We've sent password reset instructions to{" "}
                  <Text className="font-inter-semibold text-bolt-graphite">{email}</Text>.
                </Text>

                <Button
                  label="Back to Sign In"
                  onPress={() => router.replace("/(auth)")}
                  isChecked={true}
                />
              </View>
            )}
          </View>

          {/* Footer Back Link */}
          {!isSubmitted && (
            <View className="items-center mt-6">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="py-2"
              >
                <Text className="text-sm font-inter text-bolt-slate">
                  Remember password?{" "}
                  <Text className="text-bolt-blue font-inter-semibold">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
