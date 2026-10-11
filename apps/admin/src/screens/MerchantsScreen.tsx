import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { MerchantsTable } from '../components/Merchants/MerchantsTable';
import { MerchantDetailDrawer } from '../components/Merchants/MerchantDetailDrawer';
import { Button } from '../components/Elements/Button';
import { useMerchantsScreen } from '../hooks/useMerchantsScreen';

export interface MerchantsScreenProps {
  searchQuery?: string;
}

export const MerchantsScreen: React.FC<MerchantsScreenProps> = ({
  searchQuery = '',
}) => {
  const {
    merchants,
    selectedMerchant,
    setSelectedMerchant,
    isLoading,
    error,
    refetch,
  } = useMerchantsScreen(searchQuery);

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

      {/* Header controls */}
      <div className="flex justify-between items-center p-4 rounded-2xl bg-white border border-bolt-border">
        <div>
          <h2 className="font-poppins font-bold text-sm text-bolt-graphite">
            Merchant Accounts & Stores
          </h2>
          <p className="text-xs text-bolt-slate">
            Verified merchant and store profiles
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 text-bolt-slate ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={refetch}
        >
          Refresh Merchants
        </Button>
      </div>

      {/* Directory Table */}
      <MerchantsTable
        merchants={merchants}
        isLoading={isLoading}
        onSelectMerchant={setSelectedMerchant}
      />

      {/* Slide-over Inspector */}
      <MerchantDetailDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </div>
  );
};
