import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartPoint } from '../../types';
import { formatCurrency } from '../../lib/format';

interface MainChartProps {
  data: ChartPoint[];
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-600 bg-card p-3 shadow-xl">
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function MainChart({ data }: MainChartProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-300">נכסים מול יתרת משכנתא</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mortgageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) =>
              value === 'totalAssets' ? 'סה״כ נכסים' : 'יתרת משכנתא'
            }
          />
          <Area
            type="monotone"
            dataKey="totalAssets"
            stroke="#10B981"
            fill="url(#assetsGradient)"
            strokeWidth={2}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="mortgageBalance"
            stroke="#EF4444"
            fill="url(#mortgageGradient)"
            strokeWidth={2}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
