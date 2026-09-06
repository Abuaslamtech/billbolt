import React from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Checkbox from "expo-checkbox";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";

import { AuthFooter } from "@/components/Auth/AuthFooter";
import { ProgressIndicator } from "@/components/Auth/ProgressIndicator";
import { Button } from "@/components/Elements/Buton";
import { InputField } from "@/components/Elements/InputField";
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
    isChecked,
    setIsChecked,
    errors,
    isFormValid,
    handleBlur,
    handleGoogleSignUp,
    handleSubmit,
  } = useSignUpScreen();

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={false}
        extraScrollHeight={20}
      >
        <View className="flex gap-4 p-6">
          <ProgressIndicator
            title="Create Account"
            subtitle="Enter your personal details to get started"
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
              handleRoute={() => router.push("/(auth)")}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
