import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import receiptsImage from '../../assets/images/receipts.png';
import { formatCurrency } from '../../lib/formatters';
import { Button } from '../Elements/Button';
import type { ReceiptResponse } from '../../types/models';

export interface ReceiptsTableProps {
  receipts: ReceiptResponse[];
  isLoading?: boolean;
  onViewReceipt?: (receipt: ReceiptResponse) => void;
}

export const ReceiptsTable: React.FC<ReceiptsTableProps> = ({
  receipts,
  isLoading = false,
  onViewReceipt,
}) => {
  return (
    <div className="rounded-2xl bg-white border border-bolt-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-bolt-surface/80 border-b border-bolt-border text-bolt-slate font-semibold uppercase tracking-wider text-2xs">
            <tr>
              <th className="py-3.5 px-5">Receipt ID</th>
              <th className="py-3.5 px-5">Customer</th>
              <th className="py-3.5 px-5">Items</th>
              <th className="py-3.5 px-5">Total Amount</th>
              <th className="py-3.5 px-5">Payment Method</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bolt-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-bolt-slate">
                  <div className="w-6 h-6 border-2 border-bolt-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-medium text-xs">Loading receipts...</p>
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-bolt-slate">
                  <img
                    src={receiptsImage}
                    alt="Receipts"
                    className="w-16 h-16 mx-auto object-contain mb-3 opacity-80"
                  />
                  <p className="font-semibold text-xs text-bolt-graphite">No receipts found</p>
                  <p className="text-2xs text-bolt-slate">Transactions issued will appear in this ledger.</p>
                </td>
              </tr>
            ) : (
              receipts.map((sale) => (
                <tr key={sale.id} className="hover:bg-bolt-surface/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-semibold text-bolt-blue">
                    {sale.receiptNumber}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-semibold text-bolt-graphite">
                      {sale.customerName || 'Walk-in Customer'}
                    </div>
                    {sale.customerPhone && (
                      <div className="text-2xs text-bolt-slate">{sale.customerPhone}</div>
                    )}
                  </td>
                  <td className="py-4 px-5 text-bolt-slate font-medium">
                    {sale.items?.length ?? 1} {(sale.items?.length ?? 1) === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-4 px-5 font-poppins font-bold text-bolt-graphite text-sm">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-bolt-surface border border-bolt-border text-bolt-graphite">
                      {sale.paymentMethod?.toLowerCase() === 'cash' && (
                        <Banknote className="w-3 h-3 text-bolt-mint" />
                      )}
                      {sale.paymentMethod?.toLowerCase() === 'transfer' && (
                        <Smartphone className="w-3 h-3 text-bolt-blue" />
                      )}
                      {sale.paymentMethod?.toLowerCase() === 'card' && (
                        <CreditCard className="w-3 h-3 text-bolt-yellow" />
                      )}
                      {sale.paymentMethod || 'Cash'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-bolt-slate text-2xs">
                    {sale.date || new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReceipt?.(sale)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
