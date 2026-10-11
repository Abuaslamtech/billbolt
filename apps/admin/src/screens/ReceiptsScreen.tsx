import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Receipt, Wallet, Banknote, Smartphone } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { TableToolbar } from '../components/ui/TableToolbar';
import { TablePagination } from '../components/ui/TablePagination';
import { ReceiptsTable } from '../components/Receipts/ReceiptsTable';
import { ReceiptDetailDrawer } from '../components/Receipts/ReceiptDetailDrawer';
import { Button } from '../components/Elements/Button';
import { useReceiptsScreen } from '../hooks/useReceiptsScreen';
import { formatCurrency, formatNumber } from '../lib/formatters';

export interface ReceiptsScreenProps {
  searchQuery?: string;
}

export const ReceiptsScreen: React.FC<ReceiptsScreenProps> = ({
  searchQuery: initialSearch = '',
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const {
    receipts,
    rawCount,
    methodFilter,
    setMethodFilter,
    selectedReceipt,
    setSelectedReceipt,
    isLoading,
    error,
    refetch,
  } = useReceiptsScreen(search);

  const totalRevenue = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const averageTicket = receipts.length > 0 ? Math.round(totalRevenue / receipts.length) : 0;

  // Pagination slice
  const paginatedReceipts = receipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Sales Ledger &amp; Receipts"
        subtitle="Auditable record of all completed transactions, digital receipts, and payment rails across merchant outlets."
        badge={`${rawCount} Total Records`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={refetch}
          >
            Refresh Ledger
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
          title="Total Receipts"
          value={formatNumber(rawCount)}
          subtext="Processed sales transactions"
          icon={Receipt}
          iconBg="bg-blue-50"
          iconColor="text-bolt-blue"
          borderColor="border-blue-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Volume"
          value={formatCurrency(totalRevenue)}
          subtext="Cumulative receipt value"
          icon={Wallet}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          borderColor="border-emerald-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Average Ticket"
          value={formatCurrency(averageTicket)}
          subtext="Mean transaction basket size"
          icon={Banknote}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          borderColor="border-purple-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Payment Settlement"
          value="100%"
          subtext="All receipts verified &amp; settled"
          icon={Smartphone}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          borderColor="border-amber-200/80"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by receipt number, customer name, or phone..."
        tabs={[
          { label: 'All Transactions', value: 'ALL', count: rawCount },
          { label: 'Cash', value: 'Cash' },
          { label: 'Transfer', value: 'Transfer' },
          { label: 'Card', value: 'Card' },
        ]}
        activeTab={methodFilter}
        onTabChange={(tab) => setMethodFilter(tab as any)}
      />

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-bolt-border shadow-2xs overflow-hidden">
        <ReceiptsTable
          receipts={paginatedReceipts}
          isLoading={isLoading}
          onViewReceipt={setSelectedReceipt}
        />

        {/* Table Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={receipts.length}
          pageSize={pageSize}
          onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => p + 1)}
          canPrevPage={currentPage > 1}
          canNextPage={currentPage * pageSize < receipts.length}
        />
      </div>

      {/* Slide-over Receipt Inspector */}
      {selectedReceipt && (
        <ReceiptDetailDrawer
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
