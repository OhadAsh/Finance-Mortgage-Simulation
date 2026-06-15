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
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_MARGIN,
  CHART_X_AXIS_HEIGHT,
  getChartXAxisInterval,
} from '../../lib/chartTheme';

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
      <p className="text-sm text-accent">יתרת מזומן: {formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function EquityChart({ data }: EquityChartProps) {
  const xAxisInterval = getChartXAxisInterval(data.length);

  return (
    <div className="rounded-xl border border-slate-700 bg-card p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">יתרת מזומן לאורך זמן</h3>
        <p className="mt-1 text-xs text-slate-500">מגמת נזילות חודשית לפני ואחרי כניסה לדירה</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={CHART_MARGIN}>
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
          <Bar
            dataKey="cashBalance"
            radius={[4, 4, 0, 0]}
            animationDuration={CHART_ANIMATION_MS}
          >
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
