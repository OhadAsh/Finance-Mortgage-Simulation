import type { LiquidityStatus } from '../../types';

interface BadgeProps {
  status: LiquidityStatus;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  LiquidityStatus,
  { label: string; emoji: string; color: string; activeColor: string }
> = {
  liquid: {
    label: 'נזיל',
    emoji: '🟢',
    color: 'border-accent/30 text-accent bg-accent/10',
    activeColor: 'border-accent text-accent bg-accent/20 ring-2 ring-accent/30',
  },
  semi: {
    label: 'חצי נזיל',
    emoji: '🟡',
    color: 'border-amber/30 text-amber bg-amber/10',
    activeColor: 'border-amber text-amber bg-amber/20 ring-2 ring-amber/30',
  },
  locked: {
    label: 'נעול',
    emoji: '🔴',
    color: 'border-danger/30 text-danger bg-danger/10',
    activeColor: 'border-danger text-danger bg-danger/20 ring-2 ring-danger/30',
  },
};

export function Badge({ status, onClick, active = false, size = 'md' }: BadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const className = `inline-flex items-center gap-1 rounded-full border font-medium transition-all ${sizeClass} ${
    active ? config.activeColor : config.color
  } ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span>{config.emoji}</span>
        <span>{config.label}</span>
      </button>
    );
  }

  return (
    <span className={className}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
