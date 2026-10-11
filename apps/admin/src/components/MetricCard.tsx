import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    type: 'positive' | 'neutral' | 'warning' | 'danger';
  };
  isHero?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  isHero = false,
}) => {
  const badgeStyles = {
    positive: 'bg-bolt-success-bg text-bolt-success-text border-bolt-success-border',
    neutral: 'bg-bolt-surface text-bolt-slate border-bolt-border',
    warning: 'bg-bolt-warning-bg text-bolt-warning-text border-bolt-warning-border',
    danger: 'bg-bolt-danger-bg text-bolt-danger-text border-bolt-danger-border',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-bolt-border p-5 shadow-2xs hover:shadow-xs transition-all duration-200 ${
        isHero ? 'ring-1 ring-bolt-blue/20' : ''
      }`}
    >
      {/* Signature 4px Brand Accent Strip for Hero Card */}
      {isHero && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bolt-blue via-bolt-mint to-bolt-yellow" />
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-bolt-slate uppercase tracking-wider">
          {label}
        </span>
        <div
          className={`p-2 rounded-xl ${
            isHero ? 'bg-bolt-light text-bolt-blue' : 'bg-bolt-surface text-bolt-slate'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-poppins font-bold text-2xl text-bolt-graphite tracking-tight">
          {value}
        </span>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-2xs font-semibold border ${
              badgeStyles[badge.type]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-bolt-slate font-medium">{subtext}</p>}
    </div>
  );
};
