import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from './Skeleton';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  borderColor?: string;
  badge?: {
    text: string;
    positive?: boolean;
  };
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = 'bg-bolt-light',
  iconColor = 'text-bolt-blue',
  borderColor = 'border-bolt-blue/20',
  badge,
  isLoading = false,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-bolt-border shadow-2xs flex items-center justify-between transition-all hover:shadow-xs hover:border-bolt-blue/30 group">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-xs font-semibold text-bolt-slate uppercase tracking-wider leading-tight">
          {title}
        </p>
        {isLoading ? (
          <Skeleton className="h-7 w-24 mt-2" />
        ) : (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-2xl font-black text-bolt-graphite tracking-tight">
              {value}
            </span>
            {badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  badge.positive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {badge.text}
              </span>
            )}
          </div>
        )}
        {subtext && (
          <p className="text-[11px] text-bolt-slate font-medium mt-1 leading-tight line-clamp-1">
            {subtext}
          </p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${iconBg} ${iconColor} ${borderColor}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
