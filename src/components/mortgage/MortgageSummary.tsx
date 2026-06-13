import {
  mortgagePrincipal,
  monthlyPayment,
  totalEquity,
  totalLiquidNet,
} from '../../lib/calculations';
import { formatCurrency, formatPercent } from '../../lib/format';
import { useMortgageStore } from '../../store/useMortgageStore';
import { useAssetsStore } from '../../store/useAssetsStore';

export function MortgageSummary() {
  const mortgage = useMortgageStore();
  const assets = useAssetsStore((s) => s.assets);

  const equity = totalEquity(mortgage);
  const equityPercent = (equity / mortgage.apartmentValue) * 100;
  const principal = mortgagePrincipal(mortgage);
  const payment = monthlyPayment(principal, mortgage.annualRate, mortgage.termYears);
  const liquidNet = totalLiquidNet(assets);
  const entryCost = mortgage.dueSoon + mortgage.extraEquity;
  const remainingLiquid = liquidNet - entryCost;

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
