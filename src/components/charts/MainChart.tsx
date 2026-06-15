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
import { LtvBadge } from './LtvBadge';
import { ChartLegend } from './ChartLegend';
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_MARGIN,
  CHART_X_AXIS_HEIGHT,
  getChartXAxisInterval,
} from '../../lib/chartTheme';

interface MainChartProps {
  data: ChartPoint[];
  ltv: number;
  entryMonthLabel: string;
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
      <p className="text-sm text-accent">יתרת מזומן: {formatCurrency(point.cashBalance)}</p>
      <p className="text-sm text-danger">יתרת משכנתא: {formatCurrency(point.mortgageBalance)}</p>
      <p className="text-sm text-violet-400">
        שווי נטו כולל דירה: {formatCurrency(point.liquidNetEquity)}
      </p>
    </div>
  );
}

export function MainChart({ data, ltv, entryMonthLabel }: MainChartProps) {
  const entryMonth = useMemo(() => findEntryMonthLabel(data), [data]);
  const lastMonth = data.length > 0 ? data[data.length - 1] : undefined;
  const lastMonthLabel = lastMonth?.month;
  const xAxisInterval = getChartXAxisInterval(data.length);

  return (
    <div className="rounded-xl border border-slate-700 bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">נזילות מול יתרת משכנתא</h3>
          <p className="mt-1 text-xs text-slate-500">
            תחזית {data.length} חודשים
            {lastMonthLabel ? ` · עד ${lastMonthLabel}` : ''}
            {entryMonthLabel ? ` · כניסה ב-${entryMonthLabel}` : ''}
          </p>
        </div>
        <LtvBadge value={ltv} />
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="mortgageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="month"
            tick={CHART_AXIS_TICK}
            angle={-35}
            textAnchor="end"
            height={CHART_X_AXIS_HEIGHT}
            interval={xAxisInterval}
            minTickGap={28}
            tickMargin={8}
          />
          <YAxis
            tick={CHART_AXIS_TICK}
            tickFormatter={(v: number) => formatCurrencyAxis(v)}
            width={48}
            tickMargin={4}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<ChartLegend />} verticalAlign="bottom" />
          <ReferenceLine y={0} stroke="#ffffff20" />
          {entryMonth && (
            <ReferenceLine
              x={entryMonth}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'כניסה לדירה',
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 10,
                offset: 8,
              }}
            />
          )}
          <Area
            dataKey="cashBalance"
            name="יתרת מזומן"
            stroke="#10b981"
            fill="url(#cashGradient)"
            type="linear"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={CHART_ANIMATION_MS}
          />
          <Area
            dataKey="mortgageBalance"
            name="יתרת משכנתא"
            stroke="#ef4444"
            fill="url(#mortgageGradient)"
            type="monotone"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={CHART_ANIMATION_MS}
          />
          <Area
            dataKey="liquidNetEquity"
            name="שווי נטו כולל דירה"
            stroke="#8b5cf6"
            fill="transparent"
            strokeOpacity={0.75}
            type="monotone"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            animationDuration={CHART_ANIMATION_MS}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
