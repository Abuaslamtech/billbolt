import React from 'react';
import { Bell } from 'lucide-react';
import { SearchBar } from './Elements/SearchBar';
import type { ScreenTab } from '../types/models';

export interface HeaderProps {
  activeTab: ScreenTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const tabTitles: Record<ScreenTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Daily Business Health',
    subtitle: 'Daily operational summary and real-time transaction activity',
  },
  merchants: {
    title: 'Merchants & Businesses',
    subtitle: 'Manage shops, verification status, and merchant health',
  },
  receipts: {
    title: 'Sales & Receipts Ledger',
    subtitle: 'Search and inspect all issued receipts across stores',
  },
  inventory: {
    title: 'Inventory & Catalog',
    subtitle: 'Monitor stock levels, SKUs, and pricing discrepancies',
  },
  system: {
    title: 'Sync Queue & System Health',
    subtitle: 'System reliability and operational telemetry',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
}) => {
  const current = tabTitles[activeTab];

  return (
    <header className="h-20 bg-white border-b border-bolt-border px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="font-poppins font-bold text-xl text-bolt-graphite tracking-tight">
          {current.title}
        </h1>
        <p className="text-xs text-bolt-slate font-medium">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar Element */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search merchant, receipt, phone..."
          className="w-80"
        />

        {/* System Pulse Live Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bolt-mint/10 border border-bolt-mint/20 text-bolt-success-text text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-bolt-mint animate-pulse" />
          <span>All Systems Operational</span>
        </div>

        {/* Notification Alert Trigger */}
        <button
          aria-label="Notifications"
          className="relative p-2.5 rounded-xl border border-bolt-border text-bolt-graphite hover:bg-bolt-surface transition-colors active:scale-95"
        >
          <Bell className="w-4 h-4 text-bolt-slate" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-bolt-yellow rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
