import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-bolt-graphite tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bolt-light text-bolt-blue border border-bolt-blue/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-bolt-slate font-normal mt-1 leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
