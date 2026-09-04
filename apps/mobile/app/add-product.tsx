import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Add01Icon,
  Tick01Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  Share01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { router } from "expo-router";

import BackButton from "@/components/Elements/BackButton";
import ScreenHeader from "@/components/Elements/ScreenHeader";
import { Colors } from "@/lib/colors";
import { formatCurrency, getCurrencySymbol } from "@/lib/formatters";
import { useAppDataStore } from "@/store/AppDataStore";
import ProductQrLabel from "@/components/QR/ProductQrLabel";
import { useAddProductScreen } from "@/hooks/useAddProductScreen";
import { Shadows } from "@/lib/styles";

export default function AddProductScreen() {
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const {
    name,
    setName,
    category,
    setCategory,
    costPrice,
    setCostPrice,
    sellingPrice,
    setSellingPrice,
    openingStock,
    setOpeningStock,
    isSubmitting,
    isExporting,
    createdProduct,
    existingCategories,
    marginPreview,
    resetForm,
    handleBack,
    handleSubmit,
    handleExportPdf,
    handleSelectCategory,
  } = useAddProductScreen();

  return (
    <SafeAreaView className="flex-1 bg-bolt-surface" edges={["top", "left", "right"]}>
      {/* ── Header (Static, outside KeyboardAvoidingView) ──────────────────── */}
      <ScreenHeader
        title={createdProduct ? "Product Label" : "Add New Product"}
        subtitle={
          createdProduct
            ? "Container sticker is ready for printing"
            : "Add items to your catalog and generate stickers"
        }
        onBack={handleBack}
      />

      {/* ── Screen Body ─────────────────────────────────────────────────── */}
      {createdProduct ? (
        /* ── STATE B: Success QR Sticker View ── */
        <View className="flex-1 justify-between p-4">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingVertical: 16 }}
            className="flex-1"
          >
            {/* Clean Circular Success Indicator */}
            <View className="items-center mb-8 mt-4">
              <View className="w-16 h-16 rounded-full bg-bolt-success-bg border border-bolt-success-border items-center justify-center shadow-sm mb-3">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} color={Colors.success.text} />
              </View>
              <Text className="font-poppins-bold text-lg text-bolt-graphite text-center">
                Product Created
              </Text>
            </View>

            {/* Sticker Label Component */}
            <View className="items-center w-full max-w-sm mb-4">
              <ProductQrLabel product={createdProduct} size="standard" />
            </View>
          </ScrollView>

          {/* Bottom Fixed Action Dock */}
          <View className="pt-4 pb-2 border-t border-bolt-divider/40 bg-bolt-surface w-full">
            <View className="flex-row items-center gap-3 mb-2">
              {/* Add Another */}
              <TouchableOpacity
                onPress={resetForm}
                accessibilityRole="button"
                accessibilityLabel="Add another product"
                className="flex-1 h-[52px] bg-bolt-card border border-bolt-border/60 rounded-[16px] flex-row items-center justify-center gap-2 active:bg-bolt-divider"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} color={Colors.graphite} />
                <Text className="font-poppins-semibold text-bolt-graphite text-sm">
                  Add Another
                </Text>
              </TouchableOpacity>

              {/* Share / Print PDF */}
              <TouchableOpacity
                onPress={handleExportPdf}
                disabled={isExporting}
                accessibilityRole="button"
                accessibilityLabel="Share or Print label"
                className="flex-1 bg-bolt-blue h-[52px] rounded-[16px] flex-row items-center justify-center gap-2 active:bg-bolt-primary-dark shadow-sm"
                style={Shadows.primaryButton}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <HugeiconsIcon icon={Share01Icon} size={16} color="#FFFFFF" />
                    <Text className="font-poppins-semibold text-white text-sm">
                      Share Label
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* ── STATE A: Creation Form ── */
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          className="flex-1"
          enableOnAndroid={true}
          extraScrollHeight={20}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
              {/* Card 1: Basic Information */}
              <View
                className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5"
                style={Shadows.card}
              >
                <Text className="font-poppins-semibold text-sm text-bolt-graphite mb-3">
                  Product Details
                </Text>

                {/* Product Name */}
                <View className="mb-3.5">
                  <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                    Product Name *
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Milo Refill 500g"
                    placeholderTextColor={Colors.slate}
                    autoCapitalize="words"
                    className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-sm"
                  />
                </View>

                {/* Category */}
                <View>
                  <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                    Category
                  </Text>

                  {/* Horizontal Quick-Select Category Chips */}
                  {existingCategories.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="mb-2.5"
                      contentContainerStyle={{ gap: 6, paddingRight: 4 }}
                    >
                      {existingCategories.map((cat) => {
                        const isSelected = category.toLowerCase().trim() === cat.toLowerCase().trim();
                        return (
                          <TouchableOpacity
                            key={cat}
                            onPress={() => handleSelectCategory(cat)}
                            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-lg border ${isSelected
                                ? "bg-bolt-blue border-bolt-blue"
                                : "bg-bolt-surface border-bolt-border"
                              }`}
                          >
                            {isSelected && (
                              <HugeiconsIcon icon={Tick01Icon} size={12} color="#FFFFFF" />
                            )}
                            <Text
                              className={`font-inter-medium text-xs ${isSelected ? "text-white" : "text-bolt-graphite"
                                }`}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}

                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Or type a new category..."
                    placeholderTextColor={Colors.slate}
                    className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-sm"
                  />
                </View>
              </View>

              {/* Card 2: Financial & Pricing */}
              <View
                className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-3.5"
                style={Shadows.card}
              >
                <Text className="font-poppins-semibold text-sm text-bolt-graphite mb-3">
                  Pricing & Margin
                </Text>

                <View className="flex-row gap-3 mb-3">
                  {/* Cost Price */}
                  <View className="flex-1">
                    <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                      Cost Price ({currency}) *
                    </Text>
                    <TextInput
                      value={costPrice}
                      onChangeText={setCostPrice}
                      placeholder="0"
                      placeholderTextColor={Colors.slate}
                      keyboardType="numeric"
                      className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter-semibold text-bolt-graphite text-base"
                    />
                  </View>

                  {/* Selling Price */}
                  <View className="flex-1">
                    <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                      Selling Price ({currency}) *
                    </Text>
                    <TextInput
                      value={sellingPrice}
                      onChangeText={setSellingPrice}
                      placeholder="0"
                      placeholderTextColor={Colors.slate}
                      keyboardType="numeric"
                      className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter-semibold text-bolt-blue text-base"
                    />
                  </View>
                </View>

                {/* Real-time Margin Preview */}
                {marginPreview && (
                  <View className="bg-bolt-surface border border-bolt-border rounded-xl px-3.5 py-2.5 flex-row items-center justify-between">
                    <Text className="font-inter text-xs text-bolt-slate">Estimated Margin:</Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        className={`font-poppins-bold text-xs ${marginPreview.isPositive
                            ? "text-bolt-success-text"
                            : "text-bolt-danger-text"
                          }`}
                      >
                        {formatCurrency(marginPreview.profit)} ({marginPreview.pct}%)
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Card 3: Stock Setup */}
              <View
                className="bg-bolt-card rounded-2xl border border-bolt-border p-4 mb-5"
                style={Shadows.card}
              >
                <Text className="font-poppins-semibold text-sm text-bolt-graphite mb-1">
                  Opening Inventory
                </Text>
                <Text className="font-inter text-2xs text-bolt-slate mb-3">
                  Current units on your shelf to start tracking.
                </Text>

                <View>
                  <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                    Opening Quantity
                  </Text>
                  <TextInput
                    value={openingStock}
                    onChangeText={setOpeningStock}
                    placeholder="0"
                    placeholderTextColor={Colors.slate}
                    keyboardType="numeric"
                    className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
                  />
                </View>
              </View>

              {/* Hero Submission Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Save product and generate label"
                className={`bg-bolt-blue rounded-2xl h-14 flex-row items-center justify-center gap-2 shadow-sm ${isSubmitting ? "opacity-70" : "active:bg-bolt-primary-dark"
                  }`}
                style={Shadows.primaryButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <HugeiconsIcon icon={Add01Icon} size={18} color="#FFFFFF" />
                    <Text className="font-poppins-semibold text-white text-base">
                      Save Product
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          )}
    </SafeAreaView>
  );
}
