import { useState, useRef, useMemo } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { Receipt } from "@/types/models";
import { useAppDataStore } from "@/store/AppDataStore";
import { formatReceiptNo as formatReceiptId } from "@/services/storage/cycleUtils";

export interface UseReceiptDetailModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export function useReceiptDetailModal({ receipt, onClose }: UseReceiptDetailModalProps) {
  const { businessInfo } = useAppDataStore();
  const [isSharing, setIsSharing] = useState(false);
  const receiptTicketRef = useRef<View>(null);

  const subtotal = receipt?.subtotal || receipt?.total || 0;
  const discount = receipt?.discount || 0;

  // Clean Receipt Number (No '#' noise, Pillar 1 & 7)
  const receiptNo = useMemo(() => {
    return formatReceiptId(receipt);
  }, [receipt]);

  // Human Date & Time Formatting (Pillar 1 & 6)
  const formattedDateTime = useMemo(() => {
    if (!receipt) return "Today";
    const rawDate = receipt.createdAt || receipt.date;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return receipt.date || "Today";
    return d.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [receipt]);

  // Clean customer: null if default walk-in (Pillar 1)
  const customerName = useMemo(() => {
    if (!receipt?.customerName) return null;
    const trimmed = receipt.customerName.trim();
    if (!trimmed || trimmed.toLowerCase() === "walk-in customer") return null;
    return trimmed;
  }, [receipt?.customerName]);

  const customerPhone = useMemo(() => {
    if (!receipt?.customerPhone) return null;
    const trimmed = receipt.customerPhone.trim();
    return trimmed || null;
  }, [receipt?.customerPhone]);

  const soldBy = useMemo(() => {
    if (!receipt?.soldBy) return null;
    const trimmed = receipt.soldBy.trim();
    return trimmed || null;
  }, [receipt?.soldBy]);

  const handleShareImage = async () => {
    if (isSharing || !receiptTicketRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSharing(true);

    try {
      const uri = await captureRef(receiptTicketRef, {
        format: "png",
        quality: 1.0,
        result: "tmpfile",
      });

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Receipt ${receiptNo} - ${businessInfo?.name?.trim() || "Store Receipt"}`,
        UTI: "public.png",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not share receipt",
        text2: "Please try again",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return {
    businessName: businessInfo?.name?.trim() || "Store Receipt",
    businessInfo,
    currency: businessInfo?.currency || "₦",
    receiptNo,
    formattedDateTime,
    customerName,
    customerPhone,
    paymentMethod: receipt?.paymentMethod || "Cash",
    soldBy,
    subtotal,
    discount,
    receiptTicketRef,
    isSharing,
    handleShareImage,
    handleClose,
  };
}
