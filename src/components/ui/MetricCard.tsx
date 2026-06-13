import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'accent' | 'amber' | 'danger';
}

const variantStyles = {
  default: 'border-slate-700',
  accent: 'border-accent/30 bg-accent/5',
  amber: 'border-amber/30 bg-amber/5',
  danger: 'border-danger/30 bg-danger/5',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-400">{title}</p>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
