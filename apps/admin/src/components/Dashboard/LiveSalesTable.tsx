import { Banknote, CreditCard, Clock } from 'lucide-react';
import salesImage from '../../assets/images/sales.png';
import { formatCurrency } from '../../lib/formatters';
import type { ReceiptResponse } from '../../types/models';

export interface LiveSalesTableProps {
  receipts: ReceiptResponse[];
  isLoading?: boolean;
}

export const LiveSalesTable: React.FC<LiveSalesTableProps> = ({
  receipts,
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl bg-white border border-bolt-border overflow-hidden">
      <div className="p-5 border-b border-bolt-border flex items-center justify-between">
        <div>
          <h2 className="font-poppins font-bold text-sm text-bolt-graphite">
            Recent Sales Activity
          </h2>
          <p className="text-xs text-bolt-slate">
            Real-time receipts logged across merchant terminals
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-2xs font-semibold bg-bolt-light text-bolt-blue">
          Live Feed
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-bolt-slate">
          <div className="w-6 h-6 border-2 border-bolt-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Fetching real-time receipts...</p>
        </div>
      ) : receipts.length === 0 ? (
        <div className="p-12 text-center text-bolt-slate">
          <img
            src={salesImage}
            alt="Sales"
            className="w-16 h-16 mx-auto object-contain mb-3 opacity-80"
          />
          <p className="font-semibold text-xs text-bolt-graphite">No sales recorded yet</p>
          <p className="text-2xs text-bolt-slate mt-0.5">
            Log sales on the mobile terminal to see live transactions stream here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-bolt-border">
          {receipts.map((sale) => (
            <div
              key={sale.id}
              className="p-4 hover:bg-bolt-surface/80 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-bolt-surface border border-bolt-border flex items-center justify-center flex-shrink-0">
                  {sale.paymentMethod?.toLowerCase() === 'cash' ? (
                    <Banknote className="w-5 h-5 text-bolt-mint" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-bolt-blue" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-bolt-graphite truncate">
                      {sale.customerName || 'Walk-in Customer'}
                    </span>
                    <span className="text-2xs font-mono text-bolt-slate px-1.5 py-0.5 rounded bg-bolt-surface border border-bolt-border">
                      {sale.receiptNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-2xs text-bolt-slate mt-0.5">
                    <span>
                      {sale.items?.length ?? 1} {(sale.items?.length ?? 1) === 1 ? 'item' : 'items'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sale.date || new Date(sale.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-poppins font-bold text-sm text-bolt-graphite">
                  {formatCurrency(sale.total)}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-medium bg-bolt-success-bg text-bolt-success-text border border-bolt-success-border">
                  {sale.paymentMethod || 'Cash'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
