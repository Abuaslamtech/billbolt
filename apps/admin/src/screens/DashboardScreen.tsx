import React from 'react';
import {
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { LiveSalesTable } from '../components/Dashboard/LiveSalesTable';
import { CategoryDistribution } from '../components/Dashboard/CategoryDistribution';
import { Button } from '../components/Elements/Button';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { formatCurrency, formatNumber } from '../lib/formatters';

export interface DashboardScreenProps {
  onNavigateToMerchants?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToMerchants,
}) => {
  const {
    metrics,
    topProducts,
    recentReceipts,
    isLoading,
    error,
    refetch,
  } = useDashboardScreen();

  return (
    <div className="space-y-6">
      {/* Error / Connection Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-bolt-danger-bg border border-bolt-danger-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-bolt-danger-text flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-bolt-danger-text">{error}</p>
              <p className="text-2xs text-bolt-slate mt-0.5">
                Please check your network connection and try again.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* Overview Glance Cards (Rule of 3-4 from Billbolt UX) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Today's Sales Volume"
          value={formatCurrency(metrics?.todaySales ?? 0)}
          subtext={
            metrics?.yesterdaySales != null
              ? `Yesterday: ${formatCurrency(metrics.yesterdaySales)}`
              : 'Sales today'
          }
          icon={TrendingUp}
          badge={{
            text: `${(metrics?.todaySalesGrowth ?? 0) >= 0 ? '+' : ''}${
              metrics?.todaySalesGrowth ?? 0
            }%`,
            type: (metrics?.todaySalesGrowth ?? 0) >= 0 ? 'positive' : 'warning',
          }}
          isHero
        />
        <MetricCard
          label="Total Receipts Issued"
          value={formatNumber(metrics?.totalReceiptsCount ?? 0)}
          subtext="Total transaction volume logged"
          icon={Receipt}
          badge={{ text: 'Recorded', type: 'neutral' }}
        />
        <MetricCard
          label="Unique Customers"
          value={formatNumber(metrics?.totalCustomersCount ?? 0)}
          subtext="Distinct customers served"
          icon={Users}
          badge={{ text: 'Customers', type: 'positive' }}
        />
        <MetricCard
          label="Inventory Attention"
          value={formatNumber(
            (metrics?.needReorderCount ?? 0) + (metrics?.outOfStockCount ?? 0)
          )}
          subtext={`${metrics?.outOfStockCount ?? 0} out of stock · ${
            metrics?.needReorderCount ?? 0
          } low`}
          icon={AlertTriangle}
          badge={{
            text: (metrics?.outOfStockCount ?? 0) > 0 ? 'Action Needed' : 'Good Shape',
            type: (metrics?.outOfStockCount ?? 0) > 0 ? 'danger' : 'positive',
          }}
        />
      </div>

      {/* Operational Actions Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-bolt-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-bolt-blue animate-pulse" />
          <span className="text-xs font-semibold text-bolt-graphite">
            Merchant Operations Stream
          </span>
          <span className="text-xs text-bolt-slate">
            • Real-time updates
          </span>
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
            onClick={() => alert('Exporting consolidated ledger...')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            onClick={onNavigateToMerchants}
          >
            Inspect Merchant
          </Button>
        </div>
      </div>

      {/* Main Grid: Live Transactions + Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveSalesTable receipts={recentReceipts} isLoading={isLoading} />
        </div>
        <div>
          <CategoryDistribution
            products={topProducts}
            isLoading={isLoading}
            onBroadcastClick={() => alert('Opening merchant announcement modal...')}
          />
        </div>
      </div>
    </div>
  );
};
