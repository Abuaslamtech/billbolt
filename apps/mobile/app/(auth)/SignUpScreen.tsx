import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Checkbox from "expo-checkbox";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Camera01Icon, Grid02Icon } from "@hugeicons/core-free-icons";

import { AuthFooter } from "@/components/Auth/AuthFooter";
import { ProgressIndicator } from "@/components/Auth/ProgressIndicator";
import { Button } from "@/components/Elements/Buton";
import { InputField } from "@/components/Elements/InputField";
import { Colors } from "@/lib/colors";
import { useSignUpScreen } from "@/hooks/useSignUpScreen";

export default function SignUpScreen() {
  const {
    step,
    setStep,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    businessName,
    setBusinessName,
    businessType,
    setBusinessType,
    phone,
    setPhone,
    avatar,
    showPassword,
    togglePassword,
    showConfirmPassword,
    toggleConfirmPassword,
    loading,
    avatarLoading,
    focusedField,
    setFocusedField,
    isChecked,
    setIsChecked,
    errors,
    hasErrors,
    handleBlur,
    handleNextStep,
    avatarPicker,
    handleGoogleSignUp,
    handleSubmit,
  } = useSignUpScreen();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex gap-6 p-6">
            <ProgressIndicator step={step} setStep={setStep} />

            <View className="gap-4">
              {step === 1 ? (
                <View className="flex gap-4 items-center justify-center">
                  {/* full Name */}
                  <View className="flex flex-col w-full gap-2">
                    <InputField
                      icon="person"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Full Name"
                      autoCapitalize="words"
                      autoComplete="name"
                      onBlur={() => handleBlur("fullName", fullName)}
                    />
                    {errors.fullName && (
                      <Text className="ml-2 text-xs text-red-700">
                        * {errors.fullName}
                      </Text>
                    )}
                  </View>

                  {/* email */}
                  <View className="flex flex-col w-full gap-2">
                    <InputField
                      icon="email"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email Address"
                      keyboardType="email-address"
                      autoComplete="email"
                      onBlur={() => handleBlur("email", email)}
                    />
                    {errors.email && (
                      <Text className="ml-2 text-xs text-red-700">
                        * {errors.email}
                      </Text>
                    )}
                  </View>

                  {/* password */}
                  <View className="flex flex-col w-full gap-2">
                    <InputField
                      icon="lock"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password (8+ characters)"
                      isPassword={true}
                      showPassword={showPassword}
                      togglePassword={togglePassword}
                      autoComplete="new-password"
                      onBlur={() => handleBlur("password", password)}
                    />
                    {errors.password && (
                      <Text className="ml-2 text-xs text-red-700">
                        * {errors.password}
                      </Text>
                    )}
                  </View>

                  {/* confirm password */}
                  <View className="flex flex-col w-full gap-2">
                    <InputField
                      icon="lock-outline"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm Password"
                      isPassword={true}
                      showPassword={showConfirmPassword}
                      togglePassword={toggleConfirmPassword}
                      autoComplete="new-password"
                      onBlur={() =>
                        handleBlur("confirmPassword", confirmPassword, password)
                      }
                    />
                    {errors.confirmPassword && (
                      <Text className="ml-2 text-xs text-red-700">
                        * {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  {/* Terms and Conditions */}
                  <View className="w-full flex flex-row gap-2">
                    <Checkbox
                      value={isChecked}
                      onValueChange={setIsChecked}
                      color={isChecked ? Colors.primary : undefined}
                    />

                    <Text className="flex-1 text-bolt-slate font-inter-medium text-sm">
                      I agree to the{" "}
                      <Text className="text-bolt-blue underline">
                        Terms and Conditions
                      </Text>{" "}
                      and{" "}
                      <Text className="text-bolt-blue underline">
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>

                  {/* Next Button */}
                  <Button
                    label="Next Step"
                    onPress={handleNextStep}
                    iconName="arrow-forward"
                    isChecked={isChecked && !hasErrors}
                    disabled={!isChecked || hasErrors}
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
              ) : (
                <View className="flex gap-4 items-center justify-center">
                  {/* Store Logo Upload */}
                  <View className="items-center">
                    <TouchableOpacity
                      onPress={avatarPicker}
                      disabled={avatarLoading || loading}
                      className="w-24 h-24 rounded-2xl border-2 border-dashed items-center justify-center overflow-hidden border-bolt-border bg-bolt-light/40"
                    >
                      {avatarLoading ? (
                        <ActivityIndicator size="large" color="#0066CC" />
                      ) : avatar ? (
                        <Image
                          source={{ uri: avatar }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={Camera01Icon}
                          size={28}
                          color={Colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                    <Text className="text-bolt-graphite font-inter-semibold text-sm mt-2">
                      Add Store Logo (Optional)
                    </Text>
                    <Text className="text-bolt-slate text-xs mt-0.5">
                      Will appear on customer receipts
                    </Text>
                  </View>

                  <InputField
                    icon="business"
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="Business Name"
                    autoCapitalize="words"
                  />

                  <InputField
                    icon="phone"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />

                  <View className="w-full">
                    <View
                      className={`h-14 flex-row items-center px-4 rounded-2xl border-2 ${
                        focusedField === "businessType"
                          ? "border-bolt-blue"
                          : "border-bolt-border"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={Grid02Icon}
                        size={20}
                        color={
                          focusedField === "businessType" ? Colors.primary : Colors.slate
                        }
                      />
                      <TextInput
                        value={businessType}
                        onChangeText={setBusinessType}
                        onFocus={() => setFocusedField("businessType")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Business Type (Optional)"
                        placeholderTextColor={Colors.slate}
                        className="flex-1 ml-3 font-inter text-bolt-graphite text-base"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Submit Button */}
                  <Button
                    label={loading ? "Creating Account..." : "Finish Setup"}
                    onPress={handleSubmit}
                    iconName="check-circle"
                    isChecked={isChecked}
                    loading={loading}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
