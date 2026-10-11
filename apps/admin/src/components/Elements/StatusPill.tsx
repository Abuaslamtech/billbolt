import React from 'react';

export type StatusType = 'active' | 'suspended' | 'healthy' | 'warning' | 'danger' | 'neutral';

export interface StatusPillProps {
  status: StatusType;
  label?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label }) => {
  const displayLabel = label || status;

  const styles: Record<StatusType, { bg: string; dot: string }> = {
    active: {
      bg: 'bg-bolt-success-bg text-bolt-success-text border-bolt-success-border',
      dot: 'bg-bolt-mint',
    },
    healthy: {
      bg: 'bg-bolt-success-bg text-bolt-success-text border-bolt-success-border',
      dot: 'bg-bolt-mint',
    },
    warning: {
      bg: 'bg-bolt-warning-bg text-bolt-warning-text border-bolt-warning-border',
      dot: 'bg-bolt-yellow',
    },
    danger: {
      bg: 'bg-bolt-danger-bg text-bolt-danger-text border-bolt-danger-border',
      dot: 'bg-bolt-red',
    },
    suspended: {
      bg: 'bg-bolt-danger-bg text-bolt-danger-text border-bolt-danger-border',
      dot: 'bg-bolt-red',
    },
    neutral: {
      bg: 'bg-bolt-surface text-bolt-slate border-bolt-border',
      dot: 'bg-bolt-slate',
    },
  };

  const current = styles[status] || styles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold capitalize border ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
};
