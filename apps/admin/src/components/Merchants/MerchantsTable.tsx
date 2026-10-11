import React from 'react';
import { Store } from 'lucide-react';
import { Button } from '../Elements/Button';
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
    <div className="rounded-2xl bg-white border border-bolt-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-bolt-surface/80 border-b border-bolt-border text-bolt-slate font-semibold uppercase tracking-wider text-2xs">
            <tr>
              <th className="py-3.5 px-5">Merchant / Store</th>
              <th className="py-3.5 px-5">Contact</th>
              <th className="py-3.5 px-5">Branches</th>
              <th className="py-3.5 px-5">Currency</th>
              <th className="py-3.5 px-5">Role</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bolt-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-bolt-slate">
                  <div className="w-6 h-6 border-2 border-bolt-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-medium text-xs">Loading merchant account details...</p>
                </td>
              </tr>
            ) : merchants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-bolt-slate">
                  <Store className="w-8 h-8 mx-auto text-bolt-slate/40 mb-2" />
                  <p className="font-semibold text-xs text-bolt-graphite">No registered merchant found</p>
                  <p className="text-2xs text-bolt-slate">
                    Register a business on the mobile app to manage it here.
                  </p>
                </td>
              </tr>
            ) : (
              merchants.map((merchant) => (
                <tr
                  key={merchant.id}
                  className="hover:bg-bolt-surface/60 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-bolt-light text-bolt-blue flex items-center justify-center font-bold text-xs">
                        {merchant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-bolt-graphite">
                          {merchant.name}
                        </div>
                        <div className="text-2xs text-bolt-slate font-medium">
                          {merchant.ownerName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-medium text-bolt-graphite">{merchant.phone || 'No phone'}</div>
                    <div className="text-2xs text-bolt-slate">{merchant.email || merchant.ownerEmail}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-medium text-bolt-graphite">
                      {merchant.stores.length} {merchant.stores.length === 1 ? 'branch' : 'branches'}
                    </div>
                    <div className="text-2xs text-bolt-slate">
                      {merchant.type || 'Retail Merchant'}
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono font-semibold text-bolt-graphite">
                    {merchant.currency}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-bolt-light text-bolt-blue border border-bolt-blue/20">
                      {merchant.ownerRole}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectMerchant(merchant)}
                      className="text-bolt-blue hover:text-bolt-primary-dark"
                    >
                      Inspect Profile
                    </Button>
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
