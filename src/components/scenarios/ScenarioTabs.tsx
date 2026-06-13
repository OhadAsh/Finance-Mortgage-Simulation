import { useSettingsStore } from '../../store/useSettingsStore';
import { ScenarioConfigPanel } from './ScenarioConfig';

const scenarioMeta: Record<
  'a' | 'b' | 'c',
  { badge: string; badgeColor: string; description: string }
> = {
  a: {
    badge: 'ירוק',
    badgeColor: 'bg-accent/20 text-accent border-accent/30',
    description: 'הכנסה ראשית ומשנית — מהחודש הראשון',
  },
  b: {
    badge: 'צהוב',
    badgeColor: 'bg-amber/20 text-amber border-amber/30',
    description: 'הכנסה ראשית נדחית — מתחילה בחודש 6',
  },
  c: {
    badge: 'אדום',
    badgeColor: 'bg-danger/20 text-danger border-danger/30',
    description: 'רק הכנסה משנית פעילה',
  },
};

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
              className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-sm font-medium transition-all sm:flex-row sm:gap-2 sm:px-3 ${
                isActive
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-slate-700 bg-card text-slate-400 hover:border-slate-500'
              }`}
            >
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${meta.badgeColor}`}
              >
                {meta.badge}
              </span>
              <span className="truncate text-center text-xs sm:text-sm">
                {scenarios[id].label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">{scenarioMeta[activeScenario].description}</p>

      <ScenarioConfigPanel scenario={current} />
    </section>
  );
}
