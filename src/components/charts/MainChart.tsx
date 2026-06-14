import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { ChartPoint } from '../../types';
import { CHART_ANIMATION_MS } from '../../lib/constants';
import { formatCurrency, formatCurrencyAxis } from '../../lib/utils';

interface MainChartProps {
  data: ChartPoint[];
}

function findEntryMonthLabel(data: ChartPoint[]): string | undefined {
  return data.find((point) => point.mortgageBalance > 0)?.month;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-600 bg-card p-3 shadow-xl">
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      <p className="text-sm text-accent">
        יתרת מזומן: {formatCurrency(point.cashBalance)}
      </p>
      <p className="text-sm text-danger">
        יתרת משכנתא: {formatCurrency(point.mortgageBalance)}
      </p>
      <p className="text-sm text-violet-400">
        שווי נטו כולל דירה: {formatCurrency(point.liquidNetEquity)}
      </p>
    </div>
  );
}

export function MainChart({ data }: MainChartProps) {
  const entryMonthLabel = useMemo(() => findEntryMonthLabel(data), [data]);

  return (
    <div className="rounded-xl border border-slate-700 bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-300">נזילות מול יתרת משכנתא</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 28, right: 10, left: 10, bottom: 0 }}>
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
          <Legend />
          <ReferenceLine y={0} stroke="#ffffff20" />
          {entryMonthLabel && (
            <ReferenceLine
              x={entryMonthLabel}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: 'כניסה לדירה',
                position: 'top',
                fill: '#f59e0b',
                fontSize: 11,
              }}
            />
          )}
          <Area
            dataKey="cashBalance"
            name="יתרת מזומן"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.15}
            type="linear"
            strokeWidth={2}
            dot={false}
            animationDuration={CHART_ANIMATION_MS}
          />
          <Area
            dataKey="mortgageBalance"
            name="יתרת משכנתא"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.1}
            type="monotone"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={CHART_ANIMATION_MS}
          />
          <Area
            dataKey="liquidNetEquity"
            name="שווי נטו כולל דירה"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.03}
            strokeOpacity={0.6}
            type="monotone"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            animationDuration={CHART_ANIMATION_MS}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
