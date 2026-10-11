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
import billboltSymbol from '../../assets/svg/billbolt_symbol.svg';
import type { ScreenTab } from '../../types/models';

export interface SidebarProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
}

const navItems: {
  id: ScreenTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Activity,
    description: 'Real-time sales & health',
  },
  {
    id: 'merchants',
    label: 'Merchants & Stores',
    icon: Store,
    description: 'Registered business network',
  },
  {
    id: 'receipts',
    label: 'Receipts & Sales',
    icon: Receipt,
    description: 'Issued sales receipts',
  },
  {
    id: 'inventory',
    label: 'Inventory & Catalog',
    icon: Package,
    description: 'Stock levels & alerts',
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
  userEmail,
  userRole = 'ADMIN',
  onLogout,
}) => {
  const initial = (userEmail ? userEmail.charAt(0) : 'A').toUpperCase();
  const displayName = userEmail || 'Administrator';

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none text-white shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 p-2 flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
          <img
            src={billboltSymbol}
            alt="Billbolt Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              Billbolt
            </h1>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-bolt-blue/20 text-blue-400 border border-bolt-blue/30">
              Admin
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Operations Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group active:scale-[0.98] ${
                isActive
                  ? 'bg-bolt-blue text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </button>
          );
        })}
      </nav>

      {/* Operator Profile Card & Logout Footer */}
      <div className="p-4 border-t border-white/10 bg-[#090D16]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-bolt-blue text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {initial}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-white truncate" title={displayName}>
                {displayName}
              </p>
              <p className="text-[10px] text-blue-200 font-medium truncate">
                {userRole}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
