import { Home, RotateCcw } from 'lucide-react';
import { useMortgageStore } from '../../store/useMortgageStore';
import { useAssetsStore } from '../../store/useAssetsStore';
import { totalLiquidNet } from '../../lib/calculations';
import { Slider } from '../ui/Slider';
import { NumberField } from '../ui/NumberField';
import { MortgageSummary } from './MortgageSummary';

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
    <div className="rounded-xl border border-slate-700 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{label}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            isManual
              ? 'bg-amber/20 text-amber'
              : 'bg-accent/20 text-accent'
          }`}
        >
          {isManual ? 'ידני' : 'אוטומטי'}
        </span>
      </div>

      <div>
        <p className="mb-1 text-xs text-slate-500">סכום (₪)</p>
        <NumberField
          value={amount}
          onChange={onAmountChange}
          prefix="₪"
        />
      </div>

      <div>
        <p className="mb-1 text-xs text-slate-500">אחוז משווי דירה</p>
        <NumberField
          value={percent}
          onChange={onPercentChange}
          suffix="%"
        />
      </div>

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-card p-4 space-y-2">
          <p className="text-xs text-slate-400">שווי דירה</p>
          <NumberField
            value={mortgage.apartmentValue}
            onChange={(v) => setField({ apartmentValue: v })}
            prefix="₪"
          />
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
            label=""
            value={mortgage.entryMonthOffset}
            min={0}
            max={36}
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
