import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { CatalogTable } from '../components/Inventory/CatalogTable';
import { Button } from '../components/Elements/Button';
import { useInventoryScreen } from '../hooks/useInventoryScreen';
import { formatNumber } from '../lib/formatters';

export interface InventoryScreenProps {
  searchQuery?: string;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  searchQuery = '',
}) => {
  const {
    products,
    totalCount,
    lowStockCount,
    outOfStockCount,
    isLoading,
    error,
    refetch,
  } = useInventoryScreen(searchQuery);

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

      {/* Overview Cards with Real Backend Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-bolt-border">
          <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
            Total Monitored SKUs
          </span>
          <div className="font-poppins font-bold text-2xl text-bolt-graphite mt-1">
            {formatNumber(totalCount)}
          </div>
          <p className="text-xs text-bolt-slate mt-1">Active products in catalog</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bolt-border">
          <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
            Low Stock Warnings
          </span>
          <div className="font-poppins font-bold text-2xl text-bolt-warning-text mt-1">
            {formatNumber(lowStockCount)}
          </div>
          <p className="text-xs text-bolt-slate mt-1">Items at or below reorder level</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bolt-border">
          <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
            Out of Stock Items
          </span>
          <div className="font-poppins font-bold text-2xl text-bolt-danger-text mt-1">
            {formatNumber(outOfStockCount)}
          </div>
          <p className="text-xs text-bolt-slate mt-1">Items with zero remaining inventory</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 text-bolt-slate ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={refetch}
        >
          Refresh Products
        </Button>
      </div>

      {/* Catalog Table */}
      <CatalogTable products={products} isLoading={isLoading} />
    </div>
  );
};
