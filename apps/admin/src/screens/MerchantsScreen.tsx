import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Store, Building2, Wallet, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { TableToolbar } from '../components/ui/TableToolbar';
import { TablePagination } from '../components/ui/TablePagination';
import { MerchantsTable } from '../components/Merchants/MerchantsTable';
import { MerchantDetailDrawer } from '../components/Merchants/MerchantDetailDrawer';
import { Button } from '../components/Elements/Button';
import { useMerchantsScreen, type MerchantOverview } from '../hooks/useMerchantsScreen';
import { formatCurrency, formatNumber } from '../lib/formatters';

export interface MerchantsScreenProps {
  searchQuery?: string;
}

export const MerchantsScreen: React.FC<MerchantsScreenProps> = ({
  searchQuery: initialSearch = '',
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    merchants,
    selectedMerchant,
    setSelectedMerchant,
    isLoading,
    error,
    refetch,
  } = useMerchantsScreen(search);

  const totalStores = merchants.reduce((acc: number, m: MerchantOverview) => acc + m.storesCount, 0);
  const totalGMV = merchants.reduce((acc: number, m: MerchantOverview) => acc + m.totalRevenue, 0);

  // Pagination slice
  const paginatedMerchants = merchants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Merchant Accounts &amp; Network"
        subtitle="Real-time directory of registered businesses, owner contacts, store branches, and cumulative revenue volume."
        badge={`${merchants.length} Accounts`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={refetch}
          >
            Refresh Merchants
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
          title="Registered Merchants"
          value={formatNumber(merchants.length)}
          subtext="Verified business entities"
          icon={Store}
          iconBg="bg-blue-50"
          iconColor="text-bolt-blue"
          borderColor="border-blue-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Physical Outlets"
          value={formatNumber(totalStores)}
          subtext="Configured store locations"
          icon={Building2}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          borderColor="border-purple-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Network GMV"
          value={formatCurrency(totalGMV)}
          subtext="Cumulative merchant revenue"
          icon={Wallet}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          borderColor="border-emerald-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Account Status"
          value="100%"
          subtext="Active merchant standing"
          icon={ShieldCheck}
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
        searchPlaceholder="Search by business name, owner name, phone, or email..."
        tabs={[
          { label: 'All Accounts', value: 'ALL', count: merchants.length },
          { label: 'Active', value: 'ACTIVE' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Directory Table */}
      <div className="bg-white rounded-3xl border border-bolt-border shadow-2xs overflow-hidden">
        <MerchantsTable
          merchants={paginatedMerchants}
          isLoading={isLoading}
          onSelectMerchant={setSelectedMerchant}
        />

        {/* Table Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={merchants.length}
          pageSize={pageSize}
          onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => p + 1)}
          canPrevPage={currentPage > 1}
          canNextPage={currentPage * pageSize < merchants.length}
        />
      </div>

      {/* Slide-over Inspector */}
      <MerchantDetailDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </div>
  );
};
