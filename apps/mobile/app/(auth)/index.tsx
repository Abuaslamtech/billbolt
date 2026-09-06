import React from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import FingerPrintIcon from '@hugeicons/core-free-icons/FingerPrintIcon';

import { AuthFooter } from "@/components/Auth/AuthFooter";
import AuthHeader from "@/components/Auth/AuthHeader";
import LinkModal from "@/components/Auth/LinkModal";
import { Button } from "@/components/Elements/Buton";
import { InputField } from "@/components/Elements/InputField";
import { Colors } from "@/lib/colors";
import { useLoginScreen } from "@/hooks/useLoginScreen";

export default function Index() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePassword,
    isLoading,
    isGoogleLoading,
    hasBiometric,
    handleBiometricSignIn,
    handleSignIn,
    handleGoogleSignIn,
    isModalVisible,
    isLinking,
    handleLinking,
  } = useLoginScreen();

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={false}
        extraScrollHeight={20}
      >
        <View className="p-6">
          {/* Header section */}
          <AuthHeader
            title="Welcome Back"
            label="Sign in to manage your inventory and record sales"
          />

          {/* Form Section */}
          <View className="flex flex-col gap-4 mt-6">
            <InputField
              icon="email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
            <InputField
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              isPassword={true}
              showPassword={showPassword}
              togglePassword={togglePassword}
              autoComplete="password"
              returnKeyType="done"
            />

            <View className="w-full flex items-end">
              <Text
                className="font-inter-medium text-bolt-blue text-sm"
                onPress={() => router.push("/(auth)/ForgotPasswordScreen")}
              >
                Forgot Password?
              </Text>
            </View>

            {/* Sign In Button */}
            <Button
              label={isLoading ? "Signing In..." : "Sign In"}
              onPress={handleSignIn}
              iconName={isLoading ? "hourglass-empty" : "login"}
              disabled={false}
              isChecked={true}
            />

            {/* Quick Biometric Sign In option if previously enabled */}
            {hasBiometric && (
              <TouchableOpacity
                onPress={handleBiometricSignIn}
                className="w-full h-14 bg-bolt-light border border-bolt-blue/20 rounded-2xl flex-row items-center justify-center gap-2 mt-1"
                activeOpacity={0.8}
              >
                <HugeiconsIcon icon={FingerPrintIcon} size={20} color={Colors.primary} />
                <Text className="text-bolt-blue font-inter-semibold text-sm">
                  Sign In with Biometrics
                </Text>
              </TouchableOpacity>
            )}

            {/* Auth Footer */}
            <AuthFooter
              label={isGoogleLoading ? "Signing in..." : "Sign In with Google"}
              switchPage="Don't have an account yet? "
              action="Sign Up"
              onPress={handleGoogleSignIn}
              handleRoute={() => router.push("/(auth)/SignUpScreen")}
              disabled={isGoogleLoading}
            />
          </View>
        </View>

        {/* Account Linking Modal */}
        <LinkModal
          password={password}
          setPassword={setPassword}
          isLinking={isLinking}
          handleLinking={handleLinking}
          visible={isModalVisible}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
