import { useShallow } from 'zustand/react/shallow';
import {
  mortgageFigures,
  remainingLiquidAfterEntry,
  totalEquity,
} from '../../lib/calculations';
import { formatCurrency, formatPercent } from '../../lib/format';
import { selectMortgageParams, useMortgageStore } from '../../store/useMortgageStore';
import { useAssetsStore } from '../../store/useAssetsStore';

export function MortgageSummary() {
  const mortgage = useMortgageStore(useShallow(selectMortgageParams));
  const assets = useAssetsStore((s) => s.assets);

  const equity = totalEquity(mortgage);
  const equityPercent =
    mortgage.apartmentValue > 0 ? (equity / mortgage.apartmentValue) * 100 : 0;
  const { principal, monthlyPayment: payment } = mortgageFigures(mortgage);
  const remainingLiquid = remainingLiquidAfterEntry(assets, mortgage);

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
      highlight: remainingLiquid < 0 ? 'danger' : remainingLiquid < 100000 ? 'amber' : 'accent',
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
