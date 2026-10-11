import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import { SearchBar } from '../Elements/SearchBar';
import type { ScreenTab } from '../../types/models';

export interface TopNavProps {
  activeTab: ScreenTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userRole?: string;
}

const tabBreadcrumbs: Record<ScreenTab, { category: string; page: string }> = {
  dashboard: { category: 'Executive Overview', page: 'Daily Business Health' },
  merchants: { category: 'Merchant Network', page: 'Businesses & Stores' },
  receipts: { category: 'Transaction Ledger', page: 'Receipts & Sales' },
  inventory: { category: 'Supply & Catalog', page: 'Inventory Health' },
  system: { category: 'Infrastructure', page: 'Sync Engine & Telemetry' },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  userRole = 'ADMIN',
}) => {
  const current = tabBreadcrumbs[activeTab];

  return (
    <header className="h-16 bg-white border-b border-bolt-border px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-bolt-graphite tracking-tight">
          {current.page}
        </h2>
        <span className="text-xs text-bolt-slate">•</span>
        <span className="text-xs text-bolt-slate">Billbolt Operations</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3.5">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search records, receipts, phones..."
          className="w-64 sm:w-72"
        />

        {/* Operational Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Operational</span>
        </div>

        {/* Role Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bolt-light border border-bolt-blue/15 text-bolt-blue text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{userRole}</span>
        </div>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl border border-bolt-border text-bolt-graphite hover:bg-bolt-surface transition-all active:scale-[0.98]"
        >
          <Bell className="w-4 h-4 text-bolt-slate" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
