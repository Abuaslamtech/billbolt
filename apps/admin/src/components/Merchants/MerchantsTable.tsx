import React from 'react';
import { Store, ChevronRight, Mail } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import type { MerchantOverview } from '../../hooks/useMerchantsScreen';

export interface MerchantsTableProps {
  merchants: MerchantOverview[];
  isLoading?: boolean;
  onSelectMerchant: (merchant: MerchantOverview) => void;
}

export const MerchantsTable: React.FC<MerchantsTableProps> = ({
  merchants,
  isLoading = false,
  onSelectMerchant,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-bolt-border shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bolt-surface/60 border-b border-bolt-border text-[11px] font-bold text-bolt-slate uppercase tracking-wider">
              <th className="py-4 px-6">Merchant &amp; Business</th>
              <th className="py-4 px-6">Owner Account</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6 text-center">Outlets / SKUs</th>
              <th className="py-4 px-6 text-right">Total Revenue</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bolt-border text-xs font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-bolt-slate/15 shrink-0" />
                      <div>
                        <div className="h-4 w-32 bg-bolt-slate/15 rounded mb-1.5" />
                        <div className="h-3 w-40 bg-bolt-slate/10 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6"><div className="h-4 w-28 bg-bolt-slate/15 rounded mb-1" /><div className="h-3 w-36 bg-bolt-slate/10 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-bolt-slate/15 rounded" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-4 w-16 bg-bolt-slate/15 rounded mx-auto" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-4 w-20 bg-bolt-slate/15 rounded ml-auto" /></td>
                  <td className="py-4 px-6 text-center"><div className="h-5 w-16 bg-bolt-slate/15 rounded-full mx-auto" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-7 w-16 bg-bolt-slate/15 rounded-lg ml-auto" /></td>
                </tr>
              ))
            ) : merchants.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-bolt-surface flex items-center justify-center text-bolt-slate mx-auto mb-3 border border-bolt-border">
                    <Store className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-bolt-graphite">No merchants found</p>
                  <p className="text-xs text-bolt-slate mt-1 max-w-sm mx-auto">
                    Registered businesses on Billbolt will appear in this directory.
                  </p>
                </td>
              </tr>
            ) : (
              merchants.map((merchant) => (
                <tr
                  key={merchant.id}
                  onClick={() => onSelectMerchant(merchant)}
                  className="hover:bg-bolt-surface/60 transition-colors cursor-pointer group"
                >
                  {/* Business Brand */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-bolt-light text-bolt-blue flex items-center justify-center font-bold text-xs shrink-0 border border-bolt-blue/20 shadow-2xs group-hover:scale-105 transition-transform">
                        {merchant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-bolt-graphite group-hover:text-bolt-blue transition-colors truncate">
                          {merchant.name}
                        </p>
                        <p className="text-[11px] text-bolt-slate truncate font-normal">
                          {merchant.type || 'Retail Merchant'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Owner Account */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-bolt-graphite truncate">
                      {merchant.ownerName}
                    </p>
                    <p className="text-[11px] text-bolt-slate truncate font-normal flex items-center gap-1">
                      <Mail className="w-3 h-3 text-bolt-slate/70" />
                      {merchant.ownerEmail}
                    </p>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-6 font-mono text-xs text-bolt-graphite">
                    {merchant.phone || merchant.ownerPhone || 'N/A'}
                  </td>

                  {/* Stores & Products */}
                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-bolt-graphite">
                      {merchant.storesCount}
                    </span>{' '}
                    <span className="text-[11px] text-bolt-slate">stores</span>
                    <span className="block text-[11px] text-bolt-slate font-normal">
                      {merchant.productsCount} products
                    </span>
                  </td>

                  {/* Total Revenue */}
                  <td className="py-4 px-6 text-right font-black text-bolt-graphite text-sm tracking-tight">
                    {formatCurrency(merchant.totalRevenue)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-bolt-blue group-hover:translate-x-0.5 transition-transform">
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
