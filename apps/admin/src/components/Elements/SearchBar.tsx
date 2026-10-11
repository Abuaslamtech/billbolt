import React from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  shortcut?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  shortcut = '⌘K',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-bolt-slate absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-12 py-2 rounded-xl text-xs bg-bolt-surface border border-bolt-border placeholder:text-bolt-slate/70 text-bolt-graphite focus:outline-none focus:ring-2 focus:ring-bolt-blue/20 focus:border-bolt-blue transition-all"
      />
      {shortcut && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-2xs font-semibold text-bolt-slate bg-white border border-bolt-border rounded shadow-2xs pointer-events-none">
          {shortcut}
        </kbd>
      )}
    </div>
  );
};
