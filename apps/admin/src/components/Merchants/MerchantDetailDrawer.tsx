import React from 'react';
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building,
} from 'lucide-react';
import { Drawer } from '../Elements/Drawer';
import { Button } from '../Elements/Button';
import type { MerchantOverview } from '../../hooks/useMerchantsScreen';

export interface MerchantDetailDrawerProps {
  merchant: MerchantOverview | null;
  onClose: () => void;
}

export const MerchantDetailDrawer: React.FC<MerchantDetailDrawerProps> = ({
  merchant,
  onClose,
}) => {
  if (!merchant) return null;

  return (
    <Drawer
      isOpen={!!merchant}
      onClose={onClose}
      title={merchant.name}
      subtitle={merchant.type || 'Retail Merchant'}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onClose} className="w-full">
            Close Inspector
          </Button>
        </div>
      }
    >
      {/* Account Info */}
      <div className="p-4 rounded-xl border border-bolt-border bg-bolt-surface flex items-center justify-between">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
            Account Role & Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bolt-success-bg text-bolt-success-text border border-bolt-success-border">
              <span className="w-1.5 h-1.5 rounded-full bg-bolt-mint" />
              <span>Verified Account</span>
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-bolt-border text-bolt-graphite">
          {merchant.ownerRole}
        </span>
      </div>

      {/* Contact & Store Attributes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-bolt-slate">
          Merchant Details
        </h3>

        <div className="divide-y divide-bolt-border rounded-xl border border-bolt-border bg-white overflow-hidden text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-bolt-slate">
              <Building className="w-4 h-4" /> Owner
            </span>
            <span className="font-medium text-bolt-graphite">{merchant.ownerName}</span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-bolt-slate">
              <Phone className="w-4 h-4" /> Phone Number
            </span>
            <span className="font-medium text-bolt-graphite">{merchant.phone || 'None'}</span>
          </div>
          <div className="p-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-bolt-slate">
              <Mail className="w-4 h-4" /> Email Address
            </span>
            <span className="font-medium text-bolt-graphite">{merchant.email || merchant.ownerEmail}</span>
          </div>
          {merchant.address && (
            <div className="p-3.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-bolt-slate">
                <MapPin className="w-4 h-4" /> Store Location
              </span>
              <span className="font-medium text-bolt-graphite">{merchant.address}</span>
            </div>
          )}
          <div className="p-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-bolt-slate">
              <Calendar className="w-4 h-4" /> Registered
            </span>
            <span className="font-medium text-bolt-graphite">
              {new Date(merchant.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Branches & Stores */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-bolt-slate">
          Registered Store Branches ({merchant.stores.length})
        </h3>

        <div className="space-y-2">
          {merchant.stores.map((store) => (
            <div
              key={store.id}
              className="p-3.5 rounded-xl border border-bolt-border bg-bolt-surface flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-xs text-bolt-graphite">{store.name}</div>
                <div className="text-2xs text-bolt-slate">{store.location || 'Primary Location'}</div>
              </div>
              {store.isDefault && (
                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-bolt-light text-bolt-blue">
                  Default Store
                </span>
              )}
            </div>
          ))}
          {merchant.stores.length === 0 && (
            <p className="text-xs text-bolt-slate py-2">No separate branch locations configured.</p>
          )}
        </div>
      </div>
    </Drawer>
  );
};
