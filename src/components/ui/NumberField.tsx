import { useEffect, useState } from 'react';

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
}

export function NumberField({
  value,
  onChange,
  disabled = false,
  className = '',
  suffix,
  prefix,
  min,
  max,
}: NumberFieldProps) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  const commit = (raw: string) => {
    const cleaned = raw.replace(/[^\d.-]/g, '');
    if (cleaned === '' || cleaned === '-') {
      onChange(0);
      setText('0');
      return;
    }
    let num = parseFloat(cleaned);
    if (Number.isNaN(num)) return;
    if (min !== undefined) num = Math.max(min, num);
    if (max !== undefined) num = Math.min(max, num);
    onChange(num);
    setText(String(num));
  };

  return (
    <div className={`relative ${className}`}>
      {prefix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={text}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit(text);
        }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit(text);
            e.currentTarget.blur();
          }
        }}
        className={`no-spinner w-full rounded-lg border border-slate-600 bg-slate-800 py-2 font-mono text-sm text-white outline-none transition-colors focus:border-accent disabled:opacity-50 ${
          prefix ? 'pr-8 pl-3' : 'px-3'
        } ${suffix ? 'pl-8' : ''}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
}
