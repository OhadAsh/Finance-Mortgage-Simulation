import { useId } from 'react';
import { formatCurrency, formatPercent } from '../../lib/utils';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: 'currency' | 'percent' | 'number' | 'years';
  disabled?: boolean;
}

function formatValue(value: number, format: SliderProps['format']): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return formatPercent(value);
    case 'years':
      return `${value} שנים`;
    default:
      return String(value);
  }
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = 'number',
  disabled = false,
}: SliderProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <span className="font-mono text-sm font-semibold text-accent">
          {formatValue(value, format)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-accent disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatValue(min, format)}</span>
        <span>{formatValue(max, format)}</span>
      </div>
    </div>
  );
}
