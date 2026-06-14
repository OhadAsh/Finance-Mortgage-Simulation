import { Home, RotateCcw } from 'lucide-react';
import { useMortgageStore } from '../../store/useMortgageStore';
import { useAssetsStore } from '../../store/useAssetsStore';
import { totalLiquidNet } from '../../lib/calculations';
import { MAX_ENTRY_MONTH_OFFSET } from '../../lib/constants';
import { Slider } from '../ui/Slider';
import { NumberField } from '../ui/NumberField';
import { MortgageSummary } from './MortgageSummary';

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 min-h-[1rem] text-xs leading-tight text-slate-500">{children}</p>
  );
}

interface EquityFieldProps {
  label: string;
  amount: number;
  percent: number;
  isManual: boolean;
  onAmountChange: (value: number) => void;
  onPercentChange: (value: number) => void;
  onResetAuto: () => void;
}

function EquityField({
  label,
  amount,
  percent,
  isManual,
  onAmountChange,
  onPercentChange,
  onResetAuto,
}: EquityFieldProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-700 bg-card p-4">
      <div className="flex min-h-[1.5rem] items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            isManual ? 'bg-amber/20 text-amber' : 'bg-accent/20 text-accent'
          }`}
        >
          {isManual ? 'ידני' : 'אוטומטי'}
        </span>
      </div>

      <div>
        <FieldLabel>סכום (₪)</FieldLabel>
        <NumberField
          value={amount}
          onChange={onAmountChange}
          prefix="₪"
          ariaLabel={`${label} — סכום`}
        />
      </div>

      <div>
        <FieldLabel>אחוז משווי דירה</FieldLabel>
        <NumberField
          value={percent}
          onChange={onPercentChange}
          suffix="%"
          ariaLabel={`${label} — אחוז משווי דירה`}
        />
      </div>

      <div className="min-h-[1.25rem]">
        {isManual && (
          <button
            type="button"
            onClick={onResetAuto}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            חזור לחישוב אוטומטי
          </button>
        )}
      </div>
    </div>
  );
}

export function MortgagePanel() {
  const mortgage = useMortgageStore();
  const setField = useMortgageStore((s) => s.setField);
  const assets = useAssetsStore((s) => s.assets);
  const maxEquity = Math.floor(totalLiquidNet(assets));

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Home className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-white">פרמטרי משכנתא</h2>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-3">
        <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-700 bg-card p-4">
          <div className="flex min-h-[1.5rem] items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-300">שווי דירה</p>
            <span className="invisible shrink-0 rounded-full px-2 py-0.5 text-xs">—</span>
          </div>

          <div>
            <FieldLabel>סכום (₪)</FieldLabel>
            <NumberField
              value={mortgage.apartmentValue}
              onChange={(v) => setField({ apartmentValue: v })}
              prefix="₪"
              ariaLabel="שווי דירה — סכום"
            />
          </div>

          <div className="invisible pointer-events-none" aria-hidden>
            <FieldLabel>אחוז משווי דירה</FieldLabel>
            <NumberField value={0} onChange={() => {}} suffix="%" disabled />
          </div>

          <div className="min-h-[1.25rem]" />
        </div>

        <EquityField
          label="שולם עד כה"
          amount={mortgage.alreadyPaid}
          percent={mortgage.alreadyPaidPercent}
          isManual={mortgage.alreadyPaidManual}
          onAmountChange={(v) => setField({ alreadyPaid: v })}
          onPercentChange={(v) => setField({ alreadyPaidPercent: v })}
          onResetAuto={() => setField({ alreadyPaidManual: false })}
        />

        <EquityField
          label="לתשלום בכניסה"
          amount={mortgage.dueSoon}
          percent={mortgage.dueSoonPercent}
          isManual={mortgage.dueSoonManual}
          onAmountChange={(v) => setField({ dueSoon: v })}
          onPercentChange={(v) => setField({ dueSoonPercent: v })}
          onResetAuto={() => setField({ dueSoonManual: false })}
        />
      </div>

      <div className="space-y-5 rounded-xl border border-slate-700 bg-card p-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-300">חודש כניסה לדירה</span>
            <span className="text-sm font-mono text-accent">
              {mortgage.entryMonthOffset === 0
                ? 'מיידי'
                : `עוד ${mortgage.entryMonthOffset} חודשים`}
            </span>
          </div>
          <Slider
            label="חודש כניסה לדירה"
            value={mortgage.entryMonthOffset}
            min={0}
            max={MAX_ENTRY_MONTH_OFFSET}
            step={1}
            onChange={(v) => setField({ entryMonthOffset: v })}
            format="number"
          />
        </div>

        <Slider
          label="הון עצמי נוסף"
          value={mortgage.extraEquity}
          min={0}
          max={maxEquity}
          step={10000}
          onChange={(v) => setField({ extraEquity: v })}
          format="currency"
        />
        <Slider
          label="ריבית שנתית"
          value={mortgage.annualRate}
          min={3}
          max={7}
          step={0.1}
          onChange={(v) => setField({ annualRate: v })}
          format="percent"
        />
        <Slider
          label="תקופת משכנתא"
          value={mortgage.termYears}
          min={15}
          max={30}
          step={1}
          onChange={(v) => setField({ termYears: v })}
          format="years"
        />
      </div>

      <MortgageSummary />
    </section>
  );
}
