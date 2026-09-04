import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  Add01Icon,
  Delete02Icon,
  Invoice02Icon,
  Tick01Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';
import Toast from 'react-native-toast-message';
import { useAppDataStore } from '@/store/AppDataStore';
import { getCurrencySymbol } from '@/lib/formatters';
import { formatReceiptNo } from '@/services/storage/cycleUtils';
import { Colors } from '@/lib/colors';

interface CreateReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  onReceiptCreated?: (receiptId: string) => void;
}

interface CartItem {
  productId: string;
  qty: number;
}

export default function CreateReceiptModal({
  visible,
  onClose,
  onReceiptCreated,
}: CreateReceiptModalProps) {
  const currencyCode = useAppDataStore((state) => state.businessInfo?.currency);
  const currency = getCurrencySymbol(currencyCode);
  const { products, createNewReceipt, businessInfo } = useAppDataStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [soldBy, setSoldBy] = useState('Staff');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'Card'>('Transfer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState('1');
  const [discountInput, setDiscountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Historical / Backdated Sales State
  const [isHistorical, setIsHistorical] = useState(false);
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDateInput, setCustomDateInput] = useState(new Date().toISOString().split('T')[0]);

  // When historical or custom date is active, allow all products even if stock is 0
  const availableProducts = isHistorical || datePreset !== 'today'
    ? products
    : products.filter((p) => p.currentStock > 0);

  const getEffectiveDate = (): string | undefined => {
    if (datePreset === 'today') return undefined;
    if (datePreset === 'yesterday') {
      return new Date(Date.now() - 86400000).toISOString();
    }
    if (datePreset === 'custom') {
      const parsed = new Date(customDateInput);
      return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    }
    return undefined;
  };

  const handleAddToCart = () => {
    if (!selectedProductId) {
      Toast.show({ type: 'error', text1: 'Pick a product to add' });
      return;
    }
    const qty = parseInt(qtyInput, 10);
    if (isNaN(qty) || qty <= 0) {
      Toast.show({ type: 'error', text1: 'Enter valid quantity' });
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    // Only enforce live stock limits for live current sales
    if (!isHistorical && datePreset === 'today' && qty > prod.currentStock) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient stock',
        text2: `Only ${prod.currentStock} units available on hand`,
      });
      return;
    }

    // Check if already in cart
    const existingIndex = cart.findIndex((i) => i.productId === selectedProductId);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].qty += qty;
      setCart(updated);
    } else {
      setCart([...cart, { productId: selectedProductId, qty }]);
    }

    setSelectedProductId('');
    setQtyInput('1');
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((i) => i.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod ? prod.sellingPrice * item.qty : 0);
  }, 0);

  const handleCreateReceipt = async () => {
    if (cart.length === 0) {
      Toast.show({ type: 'error', text1: 'Add at least one item to receipt' });
      return;
    }
    if (!customerName.trim()) {
      Toast.show({ type: 'error', text1: 'Enter customer name' });
      return;
    }

    try {
      setIsSubmitting(true);
      const effectiveDate = getEffectiveDate();

      const parsedDiscount = Math.max(0, parseFloat(discountInput.trim()) || 0);

      const receipt = await createNewReceipt({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        paymentMethod,
        soldBy: soldBy.trim() || 'Staff',
        items: cart,
        date: effectiveDate,
        discount: parsedDiscount > 0 ? parsedDiscount : undefined,
        notes: isHistorical ? 'Historical paper record' : undefined,
      });

      Toast.show({
        type: 'success',
        text1: isHistorical ? 'Historical Sale Recorded' : 'Receipt Issued',
        text2: `Receipt ${formatReceiptNo(receipt)} logged for ${currency}${receipt.total.toLocaleString()}`,
      });

      // Reset
      setCustomerName('');
      setCustomerPhone('');
      setDiscountInput('');
      setCart([]);
      setIsHistorical(false);
      setDatePreset('today');
      onClose();

      if (onReceiptCreated) {
        onReceiptCreated(receipt.id);
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to create receipt', text2: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-[90%] border-t border-bolt-light">
          {/* Header */}
          <View className="flex-row justify-between items-center pb-4 border-b border-bolt-divider">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-full bg-bolt-light items-center justify-center">
                <HugeiconsIcon icon={Invoice02Icon} size={22} color={Colors.primary} />
              </View>
              <View>
                <Text className="font-poppins-bold text-xl text-bolt-graphite">Create Receipt</Text>
                <Text className="font-inter text-xs text-bolt-slate">Record sale and issue bill</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-bolt-divider items-center justify-center"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="py-4">
            {/* Customer Info */}
            <View className="mb-4">
              <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">Customer Name *</Text>
              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="e.g. Maryam Sani"
                placeholderTextColor={Colors.slate}
                className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">Customer Phone</Text>
                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="e.g. 0803..."
                  placeholderTextColor={Colors.slate}
                  keyboardType="phone-pad"
                  className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
                />
              </View>

              <View className="flex-1">
                <Text className="font-inter-medium text-bolt-graphite text-sm mb-1.5">Sold By</Text>
                <TextInput
                  value={soldBy}
                  onChangeText={setSoldBy}
                  placeholder="Staff name"
                  placeholderTextColor={Colors.slate}
                  className="bg-bolt-surface border border-bolt-border rounded-xl px-4 py-3 font-inter text-bolt-graphite text-base"
                />
              </View>
            </View>

            {/* Transaction Date & Historical Entry */}
            <View className="mb-4 bg-bolt-surface p-3.5 rounded-2xl border border-bolt-border">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar03Icon} size={16} color={Colors.primary} />
                  <Text className="font-inter-semibold text-bolt-graphite text-xs">
                    Sale Date
                  </Text>
                </View>
                {datePreset !== 'today' && (
                  <View className="bg-bolt-warning-bg border border-bolt-warning-border px-2 py-0.5 rounded-md">
                    <Text className="font-inter-medium text-[10px] text-bolt-warning-text">
                      Historical Entry
                    </Text>
                  </View>
                )}
              </View>

              {/* Date Presets */}
              <View className="flex-row gap-2 mb-2">
                <TouchableOpacity
                  onPress={() => {
                    setDatePreset('today');
                    setIsHistorical(false);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl border items-center justify-center ${
                    datePreset === 'today'
                      ? 'bg-bolt-blue border-bolt-blue'
                      : 'bg-bolt-card border-bolt-border'
                  }`}
                >
                  <Text
                    className={`font-inter-medium text-xs ${
                      datePreset === 'today' ? 'text-white' : 'text-bolt-graphite'
                    }`}
                  >
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setDatePreset('yesterday');
                    setIsHistorical(true);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl border items-center justify-center ${
                    datePreset === 'yesterday'
                      ? 'bg-bolt-blue border-bolt-blue'
                      : 'bg-bolt-card border-bolt-border'
                  }`}
                >
                  <Text
                    className={`font-inter-medium text-xs ${
                      datePreset === 'yesterday' ? 'text-white' : 'text-bolt-graphite'
                    }`}
                  >
                    Yesterday
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setDatePreset('custom');
                    setIsHistorical(true);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl border items-center justify-center ${
                    datePreset === 'custom'
                      ? 'bg-bolt-blue border-bolt-blue'
                      : 'bg-bolt-card border-bolt-border'
                  }`}
                >
                  <Text
                    className={`font-inter-medium text-xs ${
                      datePreset === 'custom' ? 'text-white' : 'text-bolt-graphite'
                    }`}
                  >
                    Custom Date
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Date Input */}
              {datePreset === 'custom' && (
                <View className="mt-2 pt-2 border-t border-bolt-border">
                  <Text className="font-inter text-xs text-bolt-slate mb-1">
                    Enter Date (YYYY-MM-DD):
                  </Text>
                  <TextInput
                    value={customDateInput}
                    onChangeText={setCustomDateInput}
                    placeholder="YYYY-MM-DD (e.g. 2024-05-18)"
                    placeholderTextColor={Colors.slate}
                    className="bg-bolt-card border border-bolt-border rounded-xl px-3 py-2 font-inter text-bolt-graphite text-sm mb-1"
                  />
                  <Text className="font-inter text-[11px] text-bolt-warning-text">
                    Will be attributed to its historical cycle and reports without stock limits.
                  </Text>
                </View>
              )}
            </View>

            {/* Add Items to Receipt Section */}
            <View className="bg-bolt-light/40 p-4 rounded-2xl border border-bolt-light mb-4">
              <Text className="font-poppins-semibold text-bolt-graphite text-sm mb-2">Add Item to Bill</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
                {availableProducts.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelectedProductId(p.id)}
                      className={`px-3 py-2 rounded-xl border mr-2 ${
                        isSelected
                          ? 'bg-bolt-blue border-bolt-blue'
                          : 'bg-bolt-card border-bolt-border'
                      }`}
                    >
                      <Text
                        className={`font-inter-medium text-xs ${
                          isSelected ? 'text-white' : 'text-bolt-graphite'
                        }`}
                      >
                        {p.name} ({currency}{(p.sellingPrice ?? 0).toLocaleString()})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View className="flex-row gap-3 items-center">
                <View className="w-24">
                  <TextInput
                    value={qtyInput}
                    onChangeText={setQtyInput}
                    keyboardType="numeric"
                    placeholder="Qty"
                    className="bg-bolt-card border border-bolt-border rounded-xl px-3 py-2.5 font-inter text-center text-bolt-graphite text-sm"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleAddToCart}
                  className="flex-1 bg-bolt-blue py-2.5 rounded-xl flex-row items-center justify-center gap-1"
                >
                  <HugeiconsIcon icon={Add01Icon} size={16} color="#FFFFFF" />
                  <Text className="font-inter-semibold text-white text-sm">Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cart Itemized List */}
            <View className="mb-4">
              <Text className="font-inter-medium text-bolt-graphite text-sm mb-2">
                Receipt Items ({cart.length})
              </Text>
              {cart.length === 0 ? (
                <View className="p-4 bg-bolt-surface rounded-xl items-center justify-center border border-bolt-border">
                  <Text className="font-inter text-xs text-bolt-slate">No items added yet</Text>
                </View>
              ) : (
                cart.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  const lineTotal = prod.sellingPrice * item.qty;

                  return (
                    <View
                      key={item.productId}
                      className="flex-row items-center justify-between bg-bolt-surface p-3 rounded-xl mb-2 border border-bolt-divider"
                    >
                      <View className="flex-1">
                        <Text className="font-inter-medium text-bolt-graphite text-sm">
                          {prod.name}
                        </Text>
                        <Text className="font-inter text-xs text-bolt-slate">
                          {item.qty} × {currency}{(prod.sellingPrice ?? 0).toLocaleString()}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-3">
                        <Text className="font-poppins-semibold text-bolt-blue text-sm">
                          {currency}{(lineTotal ?? 0).toLocaleString()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveFromCart(item.productId)}
                          className="p-1"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} color={Colors.danger.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Discount Field */}
            <View className="mb-4 bg-bolt-surface p-3.5 rounded-2xl border border-bolt-border">
              <Text className="font-inter-medium text-bolt-graphite text-xs mb-1.5">
                Discount (Optional - {currency})
              </Text>
              <TextInput
                value={discountInput}
                onChangeText={setDiscountInput}
                placeholder="e.g. 500"
                placeholderTextColor={Colors.slate}
                keyboardType="numeric"
                className="bg-bolt-card border border-bolt-border rounded-xl px-3.5 py-2.5 font-inter text-bolt-graphite text-sm"
              />
            </View>

            {/* Total Summary */}
            <View className="bg-bolt-graphite p-4 rounded-2xl mb-6 flex-row justify-between items-center">
              <View>
                <Text className="font-inter text-xs text-bolt-slate">Total Payable</Text>
                <Text className="font-inter-medium text-white text-xs">
                  {cart.reduce((sum, i) => sum + i.qty, 0)} units total
                </Text>
                {parseFloat(discountInput) > 0 && (
                  <Text className="font-inter text-[11px] text-bolt-mint mt-0.5">
                    - {currency}{(parseFloat(discountInput) || 0).toLocaleString()} discount
                  </Text>
                )}
              </View>
              <Text className="font-poppins-bold text-white text-2xl">
                {currency}{Math.max(0, totalAmount - (parseFloat(discountInput) || 0)).toLocaleString()}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreateReceipt}
              disabled={isSubmitting || cart.length === 0}
              className={`bg-bolt-blue rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-sm ${
                isSubmitting || cart.length === 0 ? 'opacity-50' : 'active:scale-98'
              }`}
            >
              <HugeiconsIcon icon={Tick01Icon} size={20} color="#FFFFFF" />
              <Text className="font-poppins-semibold text-white text-base">
                {isSubmitting ? 'Generating...' : 'Issue Receipt & Log Sale'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
