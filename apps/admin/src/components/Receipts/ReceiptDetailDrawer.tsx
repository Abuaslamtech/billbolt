import React, { useState } from 'react';
import { Copy, Check, Calendar, Phone, CreditCard, ShoppingBag, Store } from 'lucide-react';
import { Drawer } from '../Elements/Drawer';
import { Button } from '../Elements/Button';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import type { ReceiptResponse } from '../../types/models';

export interface ReceiptDetailDrawerProps {
  receipt: ReceiptResponse | null;
  onClose: () => void;
}

export const ReceiptDetailDrawer: React.FC<ReceiptDetailDrawerProps> = ({
  receipt,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer
      isOpen={!!receipt}
      onClose={onClose}
      title={receipt.receiptNumber}
      subtitle={`Issued to ${receipt.customerName || 'Walk-in Customer'}`}
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            size="md"
            onClick={() => copyToClipboard(receipt.receiptNumber)}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            className="flex-1"
          >
            {copied ? 'Copied ID' : 'Copy Receipt ID'}
          </Button>
          <Button variant="primary" size="md" onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Total Banner */}
        <div className="p-5 rounded-2xl bg-bolt-surface border border-bolt-border flex items-center justify-between">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
              Transaction Total
            </p>
            <p className="text-2xl font-black font-poppins text-bolt-graphite tracking-tight mt-0.5">
              {formatCurrency(receipt.total)}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {receipt.paymentMethod || 'Cash'}
          </span>
        </div>

        {/* Transaction Metadata */}
        <div className="p-4 rounded-2xl bg-white border border-bolt-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-bolt-slate flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Date &amp; Time
            </span>
            <span className="font-semibold text-bolt-graphite font-mono">
              {formatDateTime(receipt.createdAt || receipt.date)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-bolt-slate flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5" /> Customer Phone
            </span>
            <span className="font-semibold text-bolt-graphite font-mono">
              {receipt.customerPhone || 'Not provided'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-bolt-slate flex items-center gap-1.5 font-medium">
              <Store className="w-3.5 h-3.5" /> Merchant Entity
            </span>
            <span className="font-semibold text-bolt-graphite">
              {(receipt as any).business?.name || 'Main Merchant'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-bolt-slate flex items-center gap-1.5 font-medium">
              <CreditCard className="w-3.5 h-3.5" /> Amount Paid
            </span>
            <span className="font-bold text-bolt-graphite font-poppins">
              {formatCurrency(receipt.amountPaid || receipt.total)}
            </span>
          </div>
        </div>

        {/* Itemized Products */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-bolt-slate flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Itemized Products ({receipt.items?.length ?? 1})
            </h4>
          </div>

          <div className="rounded-2xl border border-bolt-border overflow-hidden bg-white divide-y divide-bolt-border">
            {(receipt.items || []).map((item, idx) => (
              <div key={item.id || idx} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-bolt-graphite">
                    {(item as any).productName || item.product?.name || `Product Item #${idx + 1}`}
                  </p>
                  <p className="text-2xs text-bolt-slate font-medium">
                    {item.qty || (item as any).quantity || 1} × {formatCurrency(item.price || (item as any).unitPrice || 0)}
                  </p>
                </div>
                <span className="font-black font-poppins text-bolt-graphite">
                  {formatCurrency(item.total || (item.price || (item as any).unitPrice || 0) * (item.qty || (item as any).quantity || 1))}
                </span>
              </div>
            ))}
            {(!receipt.items || receipt.items.length === 0) && (
              <div className="p-4 text-center text-xs text-bolt-slate">
                1 item · {formatCurrency(receipt.total)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
