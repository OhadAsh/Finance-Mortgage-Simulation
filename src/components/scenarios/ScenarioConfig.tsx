import type { ScenarioConfig } from '../../types';
import { MAX_SCENARIO_MONTH } from '../../lib/constants';
import { formatCurrency } from '../../lib/utils';
import { useSettingsStore } from '../../store/useSettingsStore';
import { NumberField } from '../ui/NumberField';

interface ScenarioConfigPanelProps {
  scenario: ScenarioConfig;
}

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <div className="min-h-[2.25rem] space-y-0.5">
      <span className="block text-xs leading-tight text-slate-300">{children}</span>
      <p className="text-xs leading-tight text-slate-500">{hint ?? '\u00A0'}</p>
    </div>
  );
}

export function ScenarioConfigPanel({ scenario }: ScenarioConfigPanelProps) {
  const updateScenario = useSettingsStore((s) => s.updateScenario);

  const income1 = scenario.incomeSource1Active ? scenario.incomeSource1 : 0;
  const computedSavings =
    income1 + scenario.incomeSource2 - scenario.monthlyExpenses - scenario.currentRent;

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full space-y-3 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <h3 className="text-sm font-medium text-white">הכנסות חודשיות</h3>

        <div className="grid grid-cols-2 items-end gap-3">
          <label className="flex min-w-0 flex-col gap-2">
            <FieldLabel hint="יכולה להתחיל בחודש מאוחר">
              הכנסה ראשית (נטו)
            </FieldLabel>
            <NumberField
              value={scenario.incomeSource1}
              prefix="₪"
              min={0}
              disabled={!scenario.incomeSource1Active}
              onChange={(val) => updateScenario(scenario.id, { incomeSource1: val })}
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <FieldLabel hint="בתוקף מחודש">הכנסה משנית (נטו)</FieldLabel>
            <NumberField
              value={scenario.incomeSource2}
              prefix="₪"
              min={0}
              onChange={(val) => updateScenario(scenario.id, { incomeSource2: val })}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={scenario.incomeSource1Active}
              onChange={(e) =>
                updateScenario(scenario.id, { incomeSource1Active: e.target.checked })
              }
              className="h-4 w-4 rounded accent-accent"
            />
            <span className="text-sm text-slate-300">הכנסה ראשית פעילה</span>
          </label>

          {scenario.incomeSource1Active && (
            <label className="block space-y-2">
              <FieldLabel hint="0 = מהחודש הראשון בסימולציה">
                חודש תחילת הכנסה (ראשית)
              </FieldLabel>
              <NumberField
                value={scenario.incomeSource1StartMonth}
                min={0}
                max={MAX_SCENARIO_MONTH}
                onChange={(val) =>
                  updateScenario(scenario.id, { incomeSource1StartMonth: val })
                }
              />
            </label>
          )}
        </div>
      </div>

      <div className="w-full space-y-3 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <h3 className="text-sm font-medium text-white">הוצאות חודשיות</h3>
        <div className="grid grid-cols-2 items-end gap-3">
          <label className="flex min-w-0 flex-col gap-2">
            <FieldLabel>הוצאות כלליות</FieldLabel>
            <NumberField
              value={scenario.monthlyExpenses}
              prefix="₪"
              min={0}
              onChange={(val) => updateScenario(scenario.id, { monthlyExpenses: val })}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-2">
            <FieldLabel hint="עד כניסה לדירה">שכירות</FieldLabel>
            <NumberField
              value={scenario.currentRent}
              prefix="₪"
              min={0}
              onChange={(val) => updateScenario(scenario.id, { currentRent: val })}
            />
          </label>
        </div>
      </div>

      <div className="w-full space-y-1 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <p className="text-sm font-medium text-white">חיסכון חודשי מחושב</p>
        <p className="text-xs text-slate-500">הכנסות פחות הוצאות ושכירות</p>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2">
          <p className="text-xs text-slate-500">
            {formatCurrency(income1)} + {formatCurrency(scenario.incomeSource2)} −{' '}
            {formatCurrency(scenario.monthlyExpenses)} − {formatCurrency(scenario.currentRent)}
          </p>
          <p
            className={`shrink-0 font-semibold ${
              computedSavings >= 0 ? 'text-accent' : 'text-danger'
            }`}
          >
            {formatCurrency(computedSavings)}
          </p>
        </div>
      </div>
    </div>
  );
}
