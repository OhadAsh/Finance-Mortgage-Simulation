import { useState } from 'react';
import { Plus, FileUp } from 'lucide-react';
import { useAssetsStore } from '../../store/useAssetsStore';
import { totalGross, totalNet, totalLiquidNet } from '../../lib/calculations';
import { formatCurrency } from '../../lib/utils';
import { AssetRow } from './AssetRow';
import { AssetTotals } from './AssetTotals';
import { CsvUpload } from './CsvUpload';

export function AssetTable() {
  const assets = useAssetsStore((s) => s.assets);
  const addAsset = useAssetsStore((s) => s.addAsset);
  const [csvOpen, setCsvOpen] = useState(false);

  const handleAddAsset = () => {
    addAsset({
      name: 'נכס חדש',
      owner: 'שותף א׳',
      grossAmount: 0,
      taxRate: 0,
      liquidity: 'liquid',
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">נכסים פיננסיים</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCsvOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-accent hover:text-accent"
          >
            <FileUp className="h-4 w-4" />
            ייבוא Excel
          </button>
          <button
            type="button"
            onClick={handleAddAsset}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent/80"
          >
            <Plus className="h-4 w-4" />
            הוסף נכס
          </button>
        </div>
      </div>

      <AssetTotals />

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-right text-xs text-slate-400">
              <th className="px-3 py-3">שם</th>
              <th className="px-3 py-3">בעלים</th>
              <th className="px-3 py-3">ברוטו</th>
              <th className="px-3 py-3">מס%</th>
              <th className="px-3 py-3">נטו</th>
              <th className="px-3 py-3">נטו ידני</th>
              <th className="px-3 py-3">נזילות</th>
              <th className="px-3 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-600 bg-slate-800/50 font-medium">
              <td colSpan={2} className="px-3 py-3 text-sm text-slate-300">
                סיכום
              </td>
              <td className="px-3 py-3 font-mono text-sm text-white">
                {formatCurrency(totalGross(assets))}
              </td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3 font-mono text-sm text-accent">
                {formatCurrency(totalNet(assets))}
              </td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3 font-mono text-sm text-amber">
                {formatCurrency(totalLiquidNet(assets))}
              </td>
              <td className="px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <CsvUpload isOpen={csvOpen} onClose={() => setCsvOpen(false)} />
    </section>
  );
}
