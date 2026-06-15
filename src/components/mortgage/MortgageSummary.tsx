import { useShallow } from 'zustand/react/shallow';
import { mortgageFigures, totalEquity } from '../../lib/calculations';
import { LOW_LIQUID_WARNING } from '../../lib/constants';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { useSimulation } from '../../hooks/useSimulation';
import { selectMortgageParams, useMortgageStore } from '../../store/useMortgageStore';

export function MortgageSummary() {
  const mortgage = useMortgageStore(useShallow(selectMortgageParams));
  const { chartData } = useSimulation();

  const equity = totalEquity(mortgage);
  const equityPercent =
    mortgage.apartmentValue > 0 ? (equity / mortgage.apartmentValue) * 100 : 0;
  const { principal, monthlyPayment: payment } = mortgageFigures(mortgage);
  const entryIndex = Math.min(mortgage.entryMonthOffset, Math.max(0, chartData.length - 1));
  const cashAtEntry = chartData[entryIndex]?.cashBalance ?? 0;
  const remainingLiquid = cashAtEntry;

  type Highlight = 'accent' | 'amber' | 'danger';

  const rows: {
    label: string;
    value: string;
    highlight?: Highlight;
  }[] = [
    { label: 'הון עצמי כולל', value: formatCurrency(equity) },
    { label: 'אחוז מהדירה', value: formatPercent(equityPercent) },
    { label: 'קרן משכנתא', value: formatCurrency(principal) },
    { label: 'תשלום חודשי', value: formatCurrency(payment) },
    {
      label: 'נזילות שנותרת אחרי כניסה',
      value: formatCurrency(remainingLiquid),
      highlight: remainingLiquid < 0 ? 'danger' : remainingLiquid < LOW_LIQUID_WARNING ? 'amber' : 'accent',
    },
  ];

  const highlightColors: Record<Highlight, string> = {
    accent: 'text-accent',
    amber: 'text-amber',
    danger: 'text-danger',
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-700/50 last:border-0">
              <td className="px-4 py-2.5 text-slate-400">{row.label}</td>
              <td
                className={`px-4 py-2.5 text-left font-mono font-semibold ${
                  row.highlight ? highlightColors[row.highlight] : 'text-white'
                }`}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
