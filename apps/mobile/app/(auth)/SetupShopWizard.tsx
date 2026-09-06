import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HugeiconsIcon } from "@hugeicons/react-native";
import ArrowLeft02Icon from "@hugeicons/core-free-icons/ArrowLeft02Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import Store01Icon from "@hugeicons/core-free-icons/Store01Icon";
import Globe02Icon from "@hugeicons/core-free-icons/Globe02Icon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import CheckmarkCircle02Icon from "@hugeicons/core-free-icons/CheckmarkCircle02Icon";

import { Colors } from "@/lib/colors";
import { Button } from "@/components/Elements/Buton";
import { InputField } from "@/components/Elements/InputField";
import { useSetupShopWizard } from "@/hooks/useSetupShopWizard";

export default function SetupShopWizard() {
  const {
    currentStep,
    shopName,
    setShopName,
    selectedArchetype,
    customCategory,
    setCustomCategory,
    phone,
    setPhone,
    currency,
    setCurrency,
    currencySymbol,
    currencyModalVisible,
    setCurrencyModalVisible,
    submitting,
    isStep1Valid,
    isStep2Valid,
    handleNextStep,
    handlePrevStep,
    handleSelectArchetype,
    handleSubmit,
    archetypes,
    currencies,
  } = useSetupShopWizard();

  const [currencySearch, setCurrencySearch] = useState("");

  const filteredCurrencies = currencies.filter(
    (item) =>
      item.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      item.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      item.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const activeCurrencyInfo = currencies.find((c) => c.code === currency);

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface">
      {/* Top Navigation & Step Indicator */}
      <View className="px-6 pt-3 pb-4">
        <View className="flex-row items-center justify-between h-10 mb-3">
          {currentStep > 1 ? (
            <TouchableOpacity
              onPress={handlePrevStep}
              className="w-10 h-10 rounded-full bg-bolt-card border border-bolt-border items-center justify-center active:opacity-70"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={20}
                color={Colors.graphite}
              />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}

          <Text className="text-xs font-inter-semibold text-bolt-slate uppercase tracking-wider">
            Step {currentStep} of 3
          </Text>

          <View className="w-10" />
        </View>

        {/* Multi-step progress bar */}
        <View className="flex-row items-center justify-center gap-2">
          {[1, 2, 3].map((stepNum) => (
            <View
              key={stepNum}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                currentStep >= stepNum ? "bg-bolt-blue" : "bg-bolt-border"
              }`}
            />
          ))}
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={false}
        extraScrollHeight={20}
      >
        {/* CARD 1: Shop Name */}
        {currentStep === 1 ? (
          <View className="flex-1 justify-between pt-4">
            <View>
              <View className="w-14 h-14 rounded-2xl bg-bolt-light border border-bolt-blue/20 items-center justify-center mb-4">
                <HugeiconsIcon
                  icon={Store01Icon}
                  size={26}
                  color={Colors.primary}
                />
              </View>

              <Text className="text-2xl font-poppins-bold text-bolt-graphite mb-2">
                What is your shop called?
              </Text>
              <Text className="text-sm font-inter text-bolt-slate mb-6 leading-5">
                This name will appear at the top of your digital and printed customer receipts.
              </Text>

              <InputField
                icon="store"
                value={shopName}
                onChangeText={setShopName}
                placeholder="e.g. Metro Mart, Bloom Fashion"
                autoCapitalize="words"
                autoFocus={true}
                returnKeyType="next"
                onSubmitEditing={handleNextStep}
              />
            </View>

            <View className="mt-8">
              <Button
                label="Continue"
                onPress={handleNextStep}
                iconName={ArrowRight01Icon}
                isChecked={isStep1Valid}
                disabled={!isStep1Valid}
              />
            </View>
          </View>
        ) : null}

        {/* CARD 2: Business Category */}
        {currentStep === 2 ? (
          <View className="flex-1 justify-between pt-4">
            <View>
              <Text className="text-2xl font-poppins-bold text-bolt-graphite mb-2">
                What do you sell mostly?
              </Text>
              <Text className="text-sm font-inter text-bolt-slate mb-5 leading-5">
                Select your primary category to customize your store layout and receipt formats.
              </Text>

              {/* Grid of archetypes */}
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {archetypes.map((archetype) => {
                  const isSelected = selectedArchetype?.id === archetype.id;
                  return (
                    <TouchableOpacity
                      key={archetype.id}
                      onPress={() => handleSelectArchetype(archetype)}
                      className={`w-[48%] rounded-2xl p-3.5 border flex-col items-center justify-center min-h-[96px] ${
                        isSelected
                          ? "bg-bolt-light border-bolt-blue"
                          : "bg-bolt-card border-bolt-border active:bg-bolt-surface"
                      }`}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center mb-2 ${
                          isSelected ? "bg-white" : "bg-bolt-surface"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={archetype.icon}
                          size={20}
                          color={isSelected ? Colors.primary : Colors.graphite}
                        />
                      </View>
                      <Text
                        className={`text-xs text-center font-inter-medium leading-4 ${
                          isSelected ? "text-bolt-blue font-inter-semibold" : "text-bolt-graphite"
                        }`}
                        numberOfLines={2}
                      >
                        {archetype.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* If "Something Else" is selected */}
              {selectedArchetype?.value === "custom" ? (
                <View className="mt-4">
                  <InputField
                    icon="category"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="Describe what you sell"
                    autoCapitalize="words"
                    autoFocus={true}
                    returnKeyType="next"
                    onSubmitEditing={handleNextStep}
                  />
                </View>
              ) : null}
            </View>

            <View className="mt-6">
              <Button
                label="Continue"
                onPress={handleNextStep}
                iconName={ArrowRight01Icon}
                isChecked={isStep2Valid}
                disabled={!isStep2Valid}
              />
            </View>
          </View>
        ) : null}

        {/* CARD 3: Contact Phone & Currency */}
        {currentStep === 3 ? (
          <View className="flex-1 justify-between pt-4">
            <View>
              <Text className="text-2xl font-poppins-bold text-bolt-graphite mb-2">
                Contact & Currency
              </Text>
              <Text className="text-sm font-inter text-bolt-slate mb-6 leading-5">
                Add your shop phone for receipts and confirm your pricing currency.
              </Text>

              {/* Natural Phone Input */}
              <View className="mb-5">
                <Text className="text-xs font-inter-semibold text-bolt-graphite mb-2">
                  Shop Phone (Optional for Receipts)
                </Text>
                <InputField
                  icon="phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 0801 234 5678"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>

              {/* Currency Selector Tile */}
              <View className="mb-6">
                <Text className="text-xs font-inter-semibold text-bolt-graphite mb-2">
                  Store Currency
                </Text>
                <TouchableOpacity
                  onPress={() => setCurrencyModalVisible(true)}
                  className="flex-row items-center justify-between bg-bolt-card border border-bolt-border rounded-2xl p-4 shadow-sm active:bg-bolt-surface"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-bolt-light items-center justify-center">
                      <HugeiconsIcon
                        icon={Globe02Icon}
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <View>
                      <Text className="text-sm font-inter-semibold text-bolt-graphite">
                        {currency} ({currencySymbol})
                      </Text>
                      <Text className="text-xs font-inter text-bolt-slate">
                        {activeCurrencyInfo?.name || "Store Currency"}
                      </Text>
                    </View>
                  </View>

                  <View className="px-3 py-1 bg-bolt-surface border border-bolt-border rounded-full">
                    <Text className="text-xs font-inter-semibold text-bolt-blue">
                      Change
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text className="text-2xs font-inter text-bolt-slate mt-2 ml-1 leading-4">
                  Auto-detected from your phone. You can customize this now before setup completes.
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              <Button
                label={submitting ? "Setting up Shop..." : "Complete Shop Setup"}
                onPress={() => handleSubmit(false)}
                iconName={CheckmarkCircle02Icon}
                isChecked={true}
                disabled={submitting}
                loading={submitting}
              />

              <TouchableOpacity
                onPress={() => handleSubmit(true)}
                disabled={submitting}
                className="items-center py-2 active:opacity-70"
              >
                <Text className="text-xs font-inter-medium text-bolt-slate">
                  I will add contact phone later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      {/* MODAL: Currency Selector */}
      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-bolt-surface">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-bolt-border bg-bolt-card">
            <Text className="text-base font-poppins-bold text-bolt-graphite">
              Select Store Currency
            </Text>
            <TouchableOpacity
              onPress={() => setCurrencyModalVisible(false)}
              className="p-1"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={20}
                color={Colors.graphite}
              />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View className="p-4 bg-bolt-card border-b border-bolt-border">
            <View className="flex-row items-center bg-bolt-surface border border-bolt-border rounded-xl px-3 h-11">
              <HugeiconsIcon icon={Search01Icon} size={18} color={Colors.slate} />
              <TextInput
                value={currencySearch}
                onChangeText={setCurrencySearch}
                placeholder="Search currency name or code..."
                placeholderTextColor={Colors.slate}
                className="flex-1 ml-2 text-sm font-inter text-bolt-graphite"
              />
            </View>
          </View>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => {
              const isSelected = item.code === currency;
              return (
                <TouchableOpacity
                  onPress={() => {
                    setCurrency(item.code);
                    setCurrencyModalVisible(false);
                  }}
                  className={`flex-row items-center justify-between p-3.5 mb-2 rounded-xl border ${
                    isSelected
                      ? "bg-bolt-light border-bolt-blue"
                      : "bg-bolt-card border-bolt-border"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-bolt-surface items-center justify-center">
                      <Text className="text-xs font-inter-bold text-bolt-graphite">
                        {item.symbol}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm font-inter-semibold text-bolt-graphite">
                        {item.code}
                      </Text>
                      <Text className="text-xs font-inter text-bolt-slate">
                        {item.name}
                      </Text>
                    </View>
                  </View>
                  {isSelected ? (
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={20}
                      color={Colors.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
