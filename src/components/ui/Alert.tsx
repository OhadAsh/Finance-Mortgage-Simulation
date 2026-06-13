import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
}

const variantConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-400',
    iconColor: 'text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber/10 border-amber/30',
    text: 'text-amber',
    iconColor: 'text-amber',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-danger/10 border-danger/30',
    text: 'text-danger',
    iconColor: 'text-danger',
  },
};

export function Alert({ variant = 'info', title, children }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${config.bg}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
      <div className="space-y-1">
        {title && <p className={`font-medium ${config.text}`}>{title}</p>}
        <div className="text-sm text-slate-300">{children}</div>
      </div>
    </div>
  );
}
