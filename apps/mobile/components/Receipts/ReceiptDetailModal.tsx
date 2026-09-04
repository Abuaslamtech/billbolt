import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Cancel01Icon,
  Store01Icon,
  Location01Icon,
  Call02Icon,
  Mail02Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { Receipt } from "@/types/models";
import { Colors } from "@/lib/colors";
import { useReceiptDetailModal } from "@/hooks/useReceiptDetailModal";
import stampPaid from "@/assets/images/stamp_paid.png";
import billboltLogo from "@/assets/images/icon.png";
import billboltQr from "@/assets/images/billbolt_qr.png";

interface ReceiptDetailModalProps {
  receipt: Receipt | null;
  visible: boolean;
  onClose: () => void;
}

export default function ReceiptDetailModal({
  receipt,
  visible,
  onClose,
}: ReceiptDetailModalProps) {
  const {
    businessName,
    businessInfo,
    currency,
    receiptNo,
    formattedDateTime,
    customerName,
    customerPhone,
    paymentMethod,
    soldBy,
    subtotal,
    discount,
    receiptTicketRef,
    isSharing,
    handleShareImage,
    handleClose,
  } = useReceiptDetailModal({ receipt, onClose });

  if (!visible || !receipt) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        {/* Modal Sheet Container */}
        <View className="bg-bolt-surface w-full h-[85%] rounded-t-3xl shadow-2xl flex-col justify-between overflow-hidden">
          {/* Top Sheet Drag Handle & Navigation */}
          <View className="px-5 pt-3 pb-2 bg-bolt-card border-b border-bolt-border">
            <View className="items-center mb-2.5">
              <View className="w-10 h-1 rounded-full bg-bolt-border" />
            </View>

            <View className="flex-row justify-between items-center pb-1">
              {/* Receipt Status Badge */}
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1.5 bg-bolt-surface px-3 py-1.5 rounded-full border border-bolt-border">
                  <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Text className="font-inter-bold text-xs text-bolt-graphite">
                    {receiptNo}
                  </Text>
                </View>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Text className="font-inter-bold text-[10px] text-emerald-700 tracking-wider uppercase">
                    Paid
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close receipt details"
                className="w-9 h-9 rounded-full bg-bolt-surface border border-bolt-border items-center justify-center active:scale-95"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color={Colors.slate} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Receipt Area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* ─── Thermal Paper Receipt Ticket Canvas (Exported on Share) ─── */}
            <View
              ref={receiptTicketRef}
              collapsable={false}
              className="bg-white rounded-2xl p-5 border border-bolt-border/80 shadow-sm relative overflow-hidden mb-2"
            >
              {/* Subtle Top Thermal Header Accent Strip */}
              <View className="h-1 bg-bolt-blue/25 -mx-5 -mt-5 mb-4" />

              {/* ── 1. PROUD MERCHANT BRANDING HEADER (Thermal-Friendly) ── */}
              <View className="items-center pb-4 border-b-2 border-dashed border-bolt-border">
                {/* Store Avatar Badge / Logo */}
                {businessInfo?.logoUrl ? (
                  <Image
                    source={{ uri: businessInfo.logoUrl }}
                    className="w-16 h-16 rounded-xl mb-2.5 bg-white border border-bolt-border"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-2xl bg-bolt-light border border-bolt-blue/20 items-center justify-center mb-2.5 shadow-2xs">
                    <HugeiconsIcon icon={Store01Icon} size={22} color={Colors.primary} />
                  </View>
                )}

                {/* Prominent Merchant Store Name */}
                <Text className="font-poppins-bold text-xl text-bolt-graphite text-center tracking-tight leading-tight uppercase">
                  {businessName}
                </Text>

                {/* Business Type / Tagline */}
                <Text className="font-inter-semibold text-[11px] text-bolt-slate uppercase tracking-wider text-center mt-0.5">
                  {businessInfo?.type?.trim() || "Official Sales Receipt"}
                </Text>

                {/* Merchant Contact Details */}
                {(businessInfo?.address || businessInfo?.phone || businessInfo?.email) && (
                  <View className="items-center mt-2 gap-1 px-2">
                    {businessInfo?.address ? (
                      <View className="flex-row items-center gap-1.5">
                        <HugeiconsIcon icon={Location01Icon} size={12} color={Colors.slate} />
                        <Text className="font-inter-medium text-xs text-bolt-graphite/80 text-center leading-snug">
                          {businessInfo.address}
                        </Text>
                      </View>
                    ) : null}

                    <View className="flex-row items-center flex-wrap justify-center gap-x-3 gap-y-1 mt-0.5">
                      {businessInfo?.phone ? (
                        <View className="flex-row items-center gap-1">
                          <HugeiconsIcon icon={Call02Icon} size={11} color={Colors.slate} />
                          <Text className="font-inter-medium text-xs text-bolt-graphite/80">
                            {businessInfo.phone}
                          </Text>
                        </View>
                      ) : null}

                      {businessInfo?.email ? (
                        <View className="flex-row items-center gap-1">
                          <HugeiconsIcon icon={Mail02Icon} size={11} color={Colors.slate} />
                          <Text className="font-inter-medium text-xs text-bolt-graphite/80">
                            {businessInfo.email}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}
              </View>

              {/* ── 2. STRUCTURED TRANSACTION LEDGER ── */}
              <View className="py-3 border-b-2 border-dashed border-bolt-border gap-1.5">
                <View className="flex-row justify-between items-center">
                  <Text className="font-inter-bold text-[11px] text-bolt-slate uppercase tracking-wider">
                    Receipt No:
                  </Text>
                  <Text className="font-inter-bold text-xs text-bolt-graphite">
                    {receiptNo}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="font-inter text-xs text-bolt-slate">Date & Time:</Text>
                  <Text className="font-inter-medium text-xs text-bolt-graphite">
                    {formattedDateTime}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="font-inter text-xs text-bolt-slate">Payment Mode:</Text>
                  <Text className="font-inter-semibold text-xs text-bolt-graphite">
                    {paymentMethod}
                  </Text>
                </View>

                {customerName ? (
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-bolt-slate">Customer:</Text>
                    <Text className="font-inter-semibold text-xs text-bolt-graphite">
                      {customerName} {customerPhone ? `(${customerPhone})` : ""}
                    </Text>
                  </View>
                ) : null}

                {soldBy ? (
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-bolt-slate">Served By:</Text>
                    <Text className="font-inter-medium text-xs text-bolt-graphite">
                      {soldBy}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ── 3. ITEMS TABLE ── */}
              <View className="pt-3">
                <Text className="font-poppins-bold text-bolt-graphite text-[11px] uppercase tracking-wider mb-2">
                  Items Purchased
                </Text>

                {/* Column Headers */}
                <View className="flex-row py-1.5 border-b border-bolt-border">
                  <Text className="flex-1 font-inter-bold text-[11px] text-bolt-slate uppercase">
                    Description
                  </Text>
                  <Text className="w-12 font-inter-bold text-[11px] text-bolt-slate uppercase text-center">
                    Qty
                  </Text>
                  <Text className="w-20 font-inter-bold text-[11px] text-bolt-slate uppercase text-right">
                    Amount
                  </Text>
                </View>

                {/* Items List */}
                {(receipt.items || []).map((item, index) => {
                  const qty = item.qty || 1;
                  return (
                    <View
                      key={index}
                      className="flex-row py-2.5 items-center border-b border-bolt-border/50"
                    >
                      <View className="flex-1 pr-2">
                        <Text
                          className="font-inter-semibold text-xs text-bolt-graphite"
                          numberOfLines={2}
                        >
                          {item.productName}
                        </Text>
                        <Text className="font-inter text-[11px] text-bolt-slate mt-0.5">
                          {currency}{(item.unitPrice ?? 0).toLocaleString()} each
                        </Text>
                      </View>
                      <Text className="w-12 font-inter-bold text-xs text-bolt-graphite text-center">
                        x{qty}
                      </Text>
                      <Text className="w-20 font-poppins-bold text-xs text-bolt-graphite text-right">
                        {currency}{(item.total ?? 0).toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* ── 4. SUBTOTAL & DISCOUNT (IF APPLICABLE) ── */}
              {discount > 0 && (
                <View className="py-2.5 border-b border-bolt-border gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-bolt-slate">Subtotal</Text>
                    <Text className="font-inter-semibold text-xs text-bolt-graphite">
                      {currency}{subtotal.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter-medium text-xs text-bolt-success-text">Discount</Text>
                    <Text className="font-inter-bold text-xs text-bolt-success-text">
                      - {currency}{discount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* ── 5. GRAND TOTAL & CASHIER RUBBER STAMP BAY (ZERO OVERLAP) ── */}
              <View className="pt-3.5 pb-2.5 border-t-2 border-dashed border-bolt-border my-2">
                <View className="flex-row items-center justify-between">
                  {/* Financial Total Column */}
                  <View className="flex-1 pr-2 justify-center">
                    <Text className="font-poppins-bold text-[11px] text-bolt-slate uppercase tracking-wider">
                      Grand Total
                    </Text>
                    <Text className="font-poppins-bold text-2xl text-bolt-graphite leading-tight mt-0.5">
                      {currency}{(receipt.total ?? 0).toLocaleString()}
                    </Text>
                  </View>

                  {/* Dedicated Cashier Rubber Stamp Bay — Inked & Realistic */}
                  <View className="w-28 h-16 items-center justify-center">
                    <Image
                      source={stampPaid}
                      style={{ width: 105, height: 65, transform: [{ rotate: "-7deg" }] }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>

              {/* ── 6. RETAIL COURTESY ── */}
              <View className="items-center pt-3 border-t-2 border-dashed border-bolt-border">
                <Text className="font-inter-semibold text-xs text-bolt-graphite text-center">
                  Thank you for your patronage!
                </Text>

              </View>

              {/* ── 7. BILLBOLT PROMOTION & SCANNABLE QR BADGE ── */}
              <View className="mt-3.5 pt-3 border-t border-bolt-border/60">
                <View className="bg-bolt-surface rounded-xl p-3 border border-bolt-border flex-row items-center gap-3">
                  {/* Scannable Website QR Code */}
                  <View className="bg-white p-1 rounded-lg border border-bolt-border items-center justify-center shadow-2xs">
                    <Image
                      source={billboltQr}
                      style={{ width: 54, height: 54 }}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Brand Attribution & Call-to-Action */}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Image
                        source={billboltLogo}
                        style={{ width: 14, height: 14, borderRadius: 3 }}
                        resizeMode="contain"
                      />
                      <Text className="font-poppins-bold text-xs text-bolt-graphite tracking-wide uppercase">
                        Powered by <Text className="text-bolt-blue">Billbolt</Text>
                      </Text>
                    </View>
                    <Text className="font-inter text-2xs text-bolt-slate leading-tight">
                      Smart Point of Sale & Inventory Management
                    </Text>
                    <Text className="font-inter-medium text-2xs text-bolt-blue mt-1">
                      Scan QR or visit billbolt.atlabx.com
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ── 8. STICKY MODAL BOTTOM ACTION BAR ── */}
          <View className="px-5 pt-3 pb-6 border-t border-bolt-border/60 bg-bolt-card">
            <TouchableOpacity
              onPress={handleShareImage}
              disabled={isSharing}
              accessibilityRole="button"
              accessibilityLabel="Share Receipt"
              className="w-full bg-bolt-blue rounded-2xl h-14 flex-row items-center justify-center gap-2 shadow-sm active:scale-[0.98] active:bg-bolt-primary-dark"
            >
              {isSharing ? (
                <ActivityIndicator size="small" color={Colors.card} />
              ) : (
                <HugeiconsIcon icon={Share01Icon} size={19} color={Colors.card} />
              )}
              <Text className="font-poppins-semibold text-bolt-card text-base">
                {isSharing ? "Generating Receipt..." : "Share Receipt"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

