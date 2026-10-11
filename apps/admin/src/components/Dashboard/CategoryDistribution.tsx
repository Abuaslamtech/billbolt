import React from 'react';
import { Send, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import type { TopProductItem } from '../../types/models';

export interface CategoryDistributionProps {
  products: TopProductItem[];
  isLoading?: boolean;
  onBroadcastClick?: () => void;
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  products,
  isLoading = false,
  onBroadcastClick,
}) => {
  const maxRevenue = products.reduce((max, p) => Math.max(max, p.revenue), 0) || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-bolt-border p-5">
        <h2 className="font-poppins font-bold text-sm text-bolt-graphite mb-1">
          Top Selling Products
        </h2>
        <p className="text-xs text-bolt-slate mb-4">Sales volume by product</p>

        {isLoading ? (
          <div className="py-8 text-center text-bolt-slate text-xs">
            Calculating top items...
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-bolt-slate">
            <Package className="w-6 h-6 mx-auto text-bolt-slate/40 mb-1.5" />
            <p className="text-xs font-medium text-bolt-graphite">No top products yet</p>
            <p className="text-2xs text-bolt-slate">Sales figures will appear once transactions occur.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((prod) => {
              const percentage = Math.round((prod.revenue / maxRevenue) * 100);
              return (
                <div key={prod.productId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-bolt-graphite truncate max-w-[180px]">
                      {prod.productName}
                    </span>
                    <span className="font-semibold text-bolt-graphite">
                      {formatCurrency(prod.revenue)} ({prod.totalSold} sold)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-bolt-surface overflow-hidden">
                    <div
                      className="h-full bg-bolt-blue rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-bolt-light/40 border border-bolt-blue/20 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-bolt-blue text-white">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-xs text-bolt-graphite">
              Admin Broadcast Alert
            </h3>
            <p className="text-2xs text-bolt-slate mt-1 leading-relaxed">
              Send instant in-app notification banners to all active mobile POS merchant devices.
            </p>
            <button
              onClick={onBroadcastClick}
              className="mt-3 text-xs font-semibold text-bolt-blue hover:underline flex items-center gap-1"
            >
              Create Announcement →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
