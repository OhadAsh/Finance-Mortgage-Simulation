import { TrendingUp, BarChart3 } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../lib/utils';
import { MetricCard } from '../ui/MetricCard';

interface SidebarProps {
  netEquity: number;
  savingsNet: number;
  entryMonthLabel: string;
}

const scenarioBadgeColors: Record<'a' | 'b' | 'c', string> = {
  a: 'text-accent',
  b: 'text-amber',
  c: 'text-danger',
};

export function Sidebar({ netEquity, savingsNet, entryMonthLabel }: SidebarProps) {
  const activeScenario = useSettingsStore((s) => s.activeScenario);
  const scenarios = useSettingsStore((s) => s.scenarios);
  const scenario = scenarios[activeScenario];

  return (
    <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1">
      <MetricCard
        title="הון עצמי נטו"
        value={formatCurrency(netEquity)}
        subtitle={`בכניסה לדירה (${entryMonthLabel}) · מזומן + שווי דירה − משכנתא`}
        icon={<TrendingUp className="h-4 w-4" />}
        variant={netEquity >= 0 ? 'accent' : 'danger'}
      />
      <div className="col-span-2 rounded-xl border border-slate-700 bg-card p-4 lg:col-span-1">
        <p className="text-xs text-slate-500">
          סה״כ נכסים היום (ללא דירה):{' '}
          <span className="font-mono text-slate-300">{formatCurrency(savingsNet)}</span>
        </p>
      </div>
      <div className="col-span-2 rounded-xl border border-slate-700 bg-card p-4 lg:col-span-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          <p className="text-sm text-slate-400">תרחיש פעיל</p>
        </div>
        <p className={`mt-1 font-medium ${scenarioBadgeColors[activeScenario]}`}>
          {scenario.label}
        </p>
      </div>
    </aside>
  );
}
