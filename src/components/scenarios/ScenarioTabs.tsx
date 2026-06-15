import type { ScenarioConfig } from '../../types';
import { formatMonthLabel } from '../../lib/calculations';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ScenarioConfigPanel } from './ScenarioConfig';

const scenarioMeta: Record<
  'a' | 'b' | 'c',
  { badge: string; badgeColor: string }
> = {
  a: {
    badge: 'ירוק',
    badgeColor: 'bg-accent/20 text-accent border-accent/30',
  },
  b: {
    badge: 'צהוב',
    badgeColor: 'bg-amber/20 text-amber border-amber/30',
  },
  c: {
    badge: 'אדום',
    badgeColor: 'bg-danger/20 text-danger border-danger/30',
  },
};

function getScenarioDescription(scenario: ScenarioConfig): string {
  if (!scenario.incomeSource2Active) {
    return 'רק הכנסה ראשית פעילה';
  }

  if (scenario.incomeSource2StartMonth === 0) {
    return 'הכנסה ראשית ומשנית — מהחודש הראשון';
  }

  const month = scenario.incomeSource2StartMonth;
  return `הכנסה משנית נדחית — מתחילה בחודש ${month} (${formatMonthLabel(month)})`;
}

export function ScenarioTabs() {
  const activeScenario = useSettingsStore((s) => s.activeScenario);
  const setScenario = useSettingsStore((s) => s.setScenario);
  const scenarios = useSettingsStore((s) => s.scenarios);
  const current = scenarios[activeScenario];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">תרחישי הכנסה</h2>

      <div className="grid grid-cols-3 gap-2">
        {(['a', 'b', 'c'] as const).map((id) => {
          const meta = scenarioMeta[id];
          const isActive = activeScenario === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setScenario(id)}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center transition-all ${
                isActive
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-slate-700 bg-card text-slate-400 hover:border-slate-500'
              }`}
            >
              <span
                className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] leading-none ${meta.badgeColor}`}
              >
                {meta.badge}
              </span>
              <span className="w-full whitespace-normal text-[11px] font-medium leading-snug sm:text-xs">
                {scenarios[id].label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">{getScenarioDescription(current)}</p>

      <ScenarioConfigPanel scenario={current} />
    </section>
  );
}
