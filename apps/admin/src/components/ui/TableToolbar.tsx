import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface FilterTabOption {
  label: string;
  value: string;
  count?: number;
}

export interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  tabs?: FilterTabOption[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  actions?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  tabs,
  activeTab,
  onTabChange,
  actions,
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-white p-3.5 rounded-2xl border border-bolt-border shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-bolt-slate absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-bolt-surface text-bolt-graphite text-xs font-medium rounded-xl border border-bolt-border pl-10 pr-9 py-2.5 outline-none transition-all placeholder:text-bolt-slate/70 focus:border-bolt-blue focus:bg-white focus:ring-2 focus:ring-bolt-blue/15"
        />
        {localSearch && (
          <button
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bolt-slate hover:text-bolt-graphite p-0.5 rounded-md"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Segmented Filter Pills & Action Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-bolt-slate mr-1 shrink-0 hidden sm:inline" />
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => onTabChange?.(tab.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer select-none active:scale-[0.98] ${
                    isSelected
                      ? 'bg-bolt-blue text-white shadow-xs'
                      : 'bg-bolt-surface text-bolt-slate hover:text-bolt-graphite hover:bg-slate-200/60 border border-bolt-border'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-bolt-border text-bolt-slate'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {actions && <div className="shrink-0 ml-auto">{actions}</div>}
      </div>
    </div>
  );
};
