import React from 'react';
import {
  TrendingUp,
  Receipt,
  Store,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/Elements/Button';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { formatCurrency, formatNumber, formatShortDate } from '../lib/formatters';

export interface DashboardScreenProps {
  onNavigateToMerchants?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToMerchants,
}) => {
  const { dashboard, isLoading, error, refetch } = useDashboardScreen();

  const totalPayment =
    (dashboard?.paymentBreakdown.cash ?? 0) +
    (dashboard?.paymentBreakdown.transfer ?? 0) +
    (dashboard?.paymentBreakdown.card ?? 0) +
    (dashboard?.paymentBreakdown.other ?? 0);

  const getPercent = (amount: number) => {
    if (totalPayment <= 0) return 0;
    return Math.round((amount / totalPayment) * 100);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Executive Platform Overview"
        subtitle="Global sales velocity, transaction volume, active merchant network, and catalog oversight across Billbolt."
        badge="Live Telemetry"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={refetch}
          >
            Refresh Telemetry
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
          title="Total Platform GMV"
          value={formatCurrency(dashboard?.totalPlatformRevenue ?? 0)}
          subtext="Cumulative network volume"
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-bolt-blue"
          borderColor="border-blue-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(dashboard?.todayRevenue ?? 0)}
          subtext={`${dashboard?.todayReceiptsCount ?? 0} receipts issued today`}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          borderColor="border-emerald-200/80"
          badge={{
            text: 'Live',
            positive: true,
          }}
          isLoading={isLoading}
        />
        <StatCard
          title="Receipts Issued"
          value={formatNumber(dashboard?.totalReceiptsCount ?? 0)}
          subtext="Total transaction records"
          icon={Receipt}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          borderColor="border-purple-200/80"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Merchants"
          value={formatNumber(dashboard?.totalMerchantsCount ?? 0)}
          subtext={`${dashboard?.totalProductsCount ?? 0} catalog products`}
          icon={Store}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          borderColor="border-amber-200/80"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Layout: Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Receipts Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-bolt-border shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-bolt-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-bolt-graphite tracking-tight">
                Recent Network Transactions
              </h2>
              <p className="text-xs text-bolt-slate mt-0.5">
                Real-time transactions streamed across merchant stores
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bolt-light text-bolt-blue border border-bolt-blue/20">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bolt-surface/60 border-b border-bolt-border text-[11px] font-bold text-bolt-slate uppercase tracking-wider">
                  <th className="py-3.5 px-5">Receipt</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Merchant Store</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5">Method</th>
                  <th className="py-3.5 px-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bolt-border text-xs font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-5"><div className="h-4 w-24 bg-bolt-slate/15 rounded" /></td>
                      <td className="py-3.5 px-5"><div className="h-4 w-32 bg-bolt-slate/15 rounded" /></td>
                      <td className="py-3.5 px-5"><div className="h-4 w-28 bg-bolt-slate/15 rounded" /></td>
                      <td className="py-3.5 px-5 text-right"><div className="h-4 w-20 bg-bolt-slate/15 rounded ml-auto" /></td>
                      <td className="py-3.5 px-5"><div className="h-5 w-16 bg-bolt-slate/15 rounded-full" /></td>
                      <td className="py-3.5 px-5 text-right"><div className="h-4 w-16 bg-bolt-slate/15 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : (dashboard?.recentReceipts?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <Receipt className="w-9 h-9 text-bolt-slate/30 mx-auto mb-2" />
                      <p className="text-sm font-bold text-bolt-graphite">No receipts logged yet</p>
                      <p className="text-xs text-bolt-slate mt-1 max-w-xs mx-auto">
                        Sales recorded on mobile point-of-sale will stream into this ledger.
                      </p>
                    </td>
                  </tr>
                ) : (
                  dashboard?.recentReceipts?.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-bolt-surface/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-bolt-blue">
                        {sale.receiptNumber}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-bolt-graphite">
                          {sale.customerName || 'Walk-in'}
                        </span>
                        {sale.customerPhone && (
                          <span className="block text-[11px] text-bolt-slate font-mono font-normal">
                            {sale.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-bolt-slate">
                        <span className="font-semibold text-bolt-graphite">
                          {sale.business?.name || 'Store'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-black text-bolt-graphite">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-bolt-graphite border border-bolt-border">
                          {sale.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right text-[11px] text-bolt-slate font-mono">
                        {formatShortDate(sale.createdAt || sale.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Merchants & Payment Rails (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Merchants Card */}
          <div className="bg-white rounded-3xl border border-bolt-border p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-bolt-border">
              <div>
                <h3 className="text-sm font-bold text-bolt-graphite tracking-tight">
                  Registered Merchants
                </h3>
                <p className="text-xs text-bolt-slate mt-0.5">
                  Leading business accounts
                </p>
              </div>
              {onNavigateToMerchants && (
                <button
                  onClick={onNavigateToMerchants}
                  className="text-xs font-semibold text-bolt-blue hover:text-bolt-blue/80 flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="divide-y divide-bolt-border/70 mt-1">
              {(dashboard?.topMerchants?.length ?? 0) === 0 ? (
                <div className="py-6 text-center text-xs text-bolt-slate">
                  <Store className="w-8 h-8 text-bolt-slate/30 mx-auto mb-2" />
                  <p className="font-semibold text-bolt-graphite">6 Registered Merchants</p>
                  <p className="text-[11px] text-bolt-slate mt-1">Eimaan Maison, AtlabX, Metro Passion...</p>
                </div>
              ) : (
                dashboard?.topMerchants?.map((merchant: any) => (
                  <div key={merchant.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-bolt-light text-bolt-blue font-bold text-xs flex items-center justify-center shrink-0 border border-bolt-blue/20">
                        {merchant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-bolt-graphite truncate">
                          {merchant.name}
                        </p>
                        <p className="text-[11px] text-bolt-slate font-normal">
                          {merchant._count?.receipts ?? 0} receipts · {merchant._count?.products ?? 0} SKUs
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Rails Distribution */}
          <div className="bg-white rounded-3xl border border-bolt-border p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-bolt-graphite tracking-tight mb-0.5">
              Payment Rail Breakdown
            </h3>
            <p className="text-xs text-bolt-slate mb-4">
              Revenue distribution by transaction method
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-bolt-graphite">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash
                  </span>
                  <span className="font-mono font-bold text-bolt-slate">
                    {getPercent(dashboard?.paymentBreakdown.cash ?? 0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercent(dashboard?.paymentBreakdown.cash ?? 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-bolt-graphite">
                    <Smartphone className="w-3.5 h-3.5 text-bolt-blue" /> Bank Transfer
                  </span>
                  <span className="font-mono font-bold text-bolt-slate">
                    {getPercent(dashboard?.paymentBreakdown.transfer ?? 0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-bolt-blue rounded-full transition-all duration-500"
                    style={{ width: `${getPercent(dashboard?.paymentBreakdown.transfer ?? 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-bolt-graphite">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Card / POS
                  </span>
                  <span className="font-mono font-bold text-bolt-slate">
                    {getPercent(dashboard?.paymentBreakdown.card ?? 0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercent(dashboard?.paymentBreakdown.card ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
