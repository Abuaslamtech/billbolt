import React from 'react';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { ReceiptsTable } from '../components/Receipts/ReceiptsTable';
import { Button } from '../components/Elements/Button';
import { useReceiptsScreen } from '../hooks/useReceiptsScreen';

export interface ReceiptsScreenProps {
  searchQuery?: string;
}

export const ReceiptsScreen: React.FC<ReceiptsScreenProps> = ({
  searchQuery = '',
}) => {
  const {
    receipts,
    methodFilter,
    setMethodFilter,
    isLoading,
    error,
    refetch,
  } = useReceiptsScreen(searchQuery);

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-bolt-danger-bg border border-bolt-danger-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-bolt-danger-text flex-shrink-0" />
            <p className="text-xs font-semibold text-bolt-danger-text">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-bolt-border">
        <div className="flex items-center gap-2">
          {(['ALL', 'Cash', 'Transfer', 'Card'] as const).map((method) => (
            <Button
              key={method}
              variant={methodFilter === method ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setMethodFilter(method)}
            >
              {method}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-bolt-slate ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={refetch}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Download className="w-3.5 h-3.5 text-bolt-slate" />}
            onClick={() => alert('Generating reconciliation report...')}
          >
            Export Receipts
          </Button>
        </div>
      </div>

      {/* Receipts Table */}
      <ReceiptsTable
        receipts={receipts}
        isLoading={isLoading}
        onViewReceipt={(receipt) =>
          alert(`Viewing receipt #${receipt.receiptNumber} (${receipt.customerName})`)
        }
      />
    </div>
  );
};
