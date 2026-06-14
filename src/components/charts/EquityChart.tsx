import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartPoint } from '../../types';
import { CHART_ANIMATION_MS } from '../../lib/constants';
import { formatCurrency, formatCurrencyAxis } from '../../lib/utils';

interface EquityChartProps {
  data: ChartPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;

  return (
    <div className="rounded-lg border border-slate-600 bg-card p-3 shadow-xl">
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-sm text-accent">
        יתרת מזומן: {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function EquityChart({ data }: EquityChartProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-300">יתרת מזומן לאורך זמן</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v: number) => formatCurrencyAxis(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cashBalance" radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION_MS}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.cashBalance >= 0 ? '#10B981' : '#EF4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
