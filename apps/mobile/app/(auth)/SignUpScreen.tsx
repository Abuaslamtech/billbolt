import React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Checkbox from "expo-checkbox";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";

import { AuthFooter } from "@/components/Auth/AuthFooter";
import AuthHeader from "@/components/Auth/AuthHeader";
import { Button } from "@/components/Elements/Buton";
import { InputField } from "@/components/Elements/InputField";
import LoadingOverlay from "@/components/Elements/LoadingOverlay";
import { Colors } from "@/lib/colors";
import { useSignUpScreen } from "@/hooks/useSignUpScreen";

export default function SignUpScreen() {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePassword,
    loading,
    isGoogleLoading,
    isChecked,
    setIsChecked,
    errors,
    isFormValid,
    handleBlur,
    handleGoogleSignUp,
    handleSubmit,
  } = useSignUpScreen();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={false}
        extraScrollHeight={20}
      >
        <View className="p-6">
          <AuthHeader
            title="Create Account"
            label="Enter your personal details to get started"
          />

          <View className="gap-4">
            {/* Full Name */}
            <View className="flex flex-col w-full gap-1.5">
              <InputField
                icon="person"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                autoCapitalize="words"
                autoComplete="name"
                onBlur={() => handleBlur("fullName", fullName)}
              />
              {errors.fullName ? (
                <Text className="ml-2 text-xs text-bolt-danger-text font-inter">
                  * {errors.fullName}
                </Text>
              ) : null}
            </View>

            {/* Email Address */}
            <View className="flex flex-col w-full gap-1.5">
              <InputField
                icon="email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onBlur={() => handleBlur("email", email)}
              />
              {errors.email ? (
                <Text className="ml-2 text-xs text-bolt-danger-text font-inter">
                  * {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Password */}
            <View className="flex flex-col w-full gap-1.5">
              <InputField
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="Password (6+ characters)"
                isPassword={true}
                showPassword={showPassword}
                togglePassword={togglePassword}
                autoComplete="password-new"
                onBlur={() => handleBlur("password", password)}
              />
              {errors.password ? (
                <Text className="ml-2 text-xs text-bolt-danger-text font-inter">
                  * {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Terms and Conditions */}
            <View className="w-full flex-row items-center gap-3 my-1">
              <Checkbox
                value={isChecked}
                onValueChange={setIsChecked}
                color={isChecked ? Colors.primary : undefined}
                style={{ borderRadius: 6 }}
              />
              <Text className="flex-1 text-bolt-slate font-inter text-xs leading-4">
                I agree to the{" "}
                <Text className="text-bolt-blue font-inter-medium">
                  Terms and Conditions
                </Text>{" "}
                and{" "}
                <Text className="text-bolt-blue font-inter-medium">
                  Privacy Policy
                </Text>
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              label={loading ? "Creating Account..." : "Continue"}
              onPress={handleSubmit}
              iconName={ArrowRight01Icon}
              isChecked={isFormValid}
              disabled={!isFormValid || loading}
              loading={loading}
            />

            {/* Auth Footer */}
            <AuthFooter
              label="Sign up with Google"
              switchPage="Already have an account? "
              action="Sign In"
              onPress={handleGoogleSignUp}
              handleRoute={() => router.replace("/(auth)")}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Screen-locking loader during account creation */}
      <LoadingOverlay
        visible={loading || isGoogleLoading}
        message={isGoogleLoading ? "Connecting with Google..." : "Creating Account..."}
        submessage="Preparing your store profile"
      />
    </SafeAreaView>
  );
}
