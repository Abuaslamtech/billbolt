import React from 'react';
import {
  Activity,
  Store,
  Receipt,
  Package,
  Server,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import billboltSymbol from '../assets/svg/billbolt_symbol.svg';
import type { ScreenTab } from '../types/models';

export interface SidebarProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
}

const navItems: { id: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Activity,
    description: 'Real-time sales & health',
  },
  {
    id: 'merchants',
    label: 'Merchants',
    icon: Store,
    description: 'Businesses & shops',
  },
  {
    id: 'receipts',
    label: 'Sales & Receipts',
    icon: Receipt,
    description: 'Global transaction ledger',
  },
  {
    id: 'inventory',
    label: 'Inventory Catalog',
    icon: Package,
    description: 'SKUs, stock & pricing',
  },
  {
    id: 'system',
    label: 'Sync & System',
    icon: Server,
    description: 'Mobile sync queue & logs',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userEmail = 'admin@billbolt.com',
  userRole = 'ADMIN',
  onLogout,
}) => {
  return (
    <aside className="w-72 bg-white border-r border-bolt-border flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-bolt-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={billboltSymbol}
            alt="Billbolt Logo"
            className="w-10 h-10 rounded-xl shadow-xs object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-poppins font-bold text-lg tracking-tight text-bolt-graphite">
                Billbolt
              </span>
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider bg-bolt-light text-bolt-blue">
                Admin
              </span>
            </div>
            <p className="text-xs text-bolt-slate font-medium">Merchant Operations</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-2xs font-bold uppercase tracking-wider text-bolt-slate/70">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                isActive
                  ? 'bg-bolt-blue text-white shadow-sm shadow-blue-600/20'
                  : 'text-bolt-graphite hover:bg-bolt-surface hover:text-bolt-graphite'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-bolt-slate'
                  }`}
                />
                <div className="text-left">
                  <div className={`font-semibold ${isActive ? 'text-white' : 'text-bolt-graphite'}`}>
                    {item.label}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-bolt-slate'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/90" />}
            </button>
          );
        })}
      </div>

      {/* Operator Profile Card & Logout */}
      <div className="p-4 border-t border-bolt-border bg-bolt-surface/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-bolt-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bolt-graphite text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-bolt-graphite truncate max-w-[110px]">
                  {userEmail}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-bolt-mint flex-shrink-0" />
              </div>
              <p className="text-2xs text-bolt-slate truncate">{userRole}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-bolt-slate hover:text-bolt-danger-text hover:bg-bolt-danger-bg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
