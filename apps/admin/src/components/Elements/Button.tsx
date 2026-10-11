import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2 font-semibold',
    lg: 'px-5 py-2.5 text-sm gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-bolt-blue text-white hover:bg-bolt-primary-dark shadow-sm shadow-blue-600/20',
    secondary:
      'bg-white text-bolt-graphite border border-bolt-border hover:bg-bolt-surface',
    danger:
      'bg-bolt-danger-bg text-bolt-danger-text border border-bolt-danger-border hover:bg-red-100',
    ghost:
      'bg-transparent text-bolt-slate hover:text-bolt-graphite hover:bg-bolt-surface',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
