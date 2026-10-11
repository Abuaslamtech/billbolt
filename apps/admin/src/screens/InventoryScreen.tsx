import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { TableToolbar } from '../components/ui/TableToolbar';
import { TablePagination } from '../components/ui/TablePagination';
import { CatalogTable } from '../components/Inventory/CatalogTable';
import { Button } from '../components/Elements/Button';
import { useInventoryScreen } from '../hooks/useInventoryScreen';
import { formatNumber } from '../lib/formatters';

export interface InventoryScreenProps {
  searchQuery?: string;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  searchQuery: initialSearch = '',
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const {
    products,
    totalCount,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    refetch,
  } = useInventoryScreen(search);

  // Pagination slice
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Inventory &amp; SKU Catalog"
        subtitle="Network inventory health, product SKUs, stock levels, reorder thresholds, and pricing consistency."
        badge={`${totalCount} SKUs`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={refetch}
          >
            Refresh Catalog
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-bolt-danger-bg border border-bolt-danger-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-bolt-danger-text shrink-0" />
            <p className="text-xs font-semibold text-bolt-danger-text">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* 4-Card Responsive KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total SKUs"
          value={formatNumber(totalCount)}
          subtext="Indexed product catalog items"
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-bolt-blue"
          borderColor="border-blue-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="In Stock"
          value={formatNumber(inStockCount)}
          subtext="Adequate stock on merchant shelves"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          borderColor="border-emerald-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Low Stock"
          value={formatNumber(lowStockCount)}
          subtext="Items below reorder thresholds"
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          borderColor="border-amber-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Depleted Units"
          value={formatNumber(outOfStockCount)}
          subtext="Items requiring restock"
          icon={XCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          borderColor="border-rose-200/80"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product name, category, or barcode..."
        tabs={[
          { label: 'All SKUs', value: 'ALL', count: totalCount },
          { label: 'In Stock', value: 'In Stock' },
          { label: 'Low Stock', value: 'Low Stock' },
          { label: 'Out of Stock', value: 'Out of Stock' },
        ]}
        activeTab={statusFilter}
        onTabChange={(tab) => setStatusFilter(tab as any)}
      />

      {/* Inventory Catalog Table */}
      <div className="bg-white rounded-3xl border border-bolt-border shadow-2xs overflow-hidden">
        <CatalogTable
          products={paginatedProducts}
          isLoading={isLoading}
        />

        {/* Table Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={products.length}
          pageSize={pageSize}
          onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => p + 1)}
          canPrevPage={currentPage > 1}
          canNextPage={currentPage * pageSize < products.length}
        />
      </div>
    </div>
  );
};
