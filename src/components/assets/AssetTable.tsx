import { useState } from 'react';
import { Plus, FileUp } from 'lucide-react';
import { useAssetsStore } from '../../store/useAssetsStore';
import { totalGross, totalNet, totalLiquidNet } from '../../lib/calculations';
import { formatCurrency } from '../../lib/utils';
import { AssetRow } from './AssetRow';
import { AssetTotals } from './AssetTotals';
import { CsvUpload } from './CsvUpload';

export const COLUMN_WIDTHS = {
  name: 155,
  owner: 72,
  gross: 130,
  tax: 52,
  net: 168,
  liquidity: 100,
  actions: 40,
} as const;

export const TABLE_MIN_WIDTH = Object.values(COLUMN_WIDTHS).reduce((sum, w) => sum + w, 0);

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
        <table className="text-xs" style={{ width: TABLE_MIN_WIDTH }}>
          <colgroup>
            <col style={{ width: COLUMN_WIDTHS.name }} />
            <col style={{ width: COLUMN_WIDTHS.owner }} />
            <col style={{ width: COLUMN_WIDTHS.gross }} />
            <col style={{ width: COLUMN_WIDTHS.tax }} />
            <col style={{ width: COLUMN_WIDTHS.net }} />
            <col style={{ width: COLUMN_WIDTHS.liquidity }} />
            <col style={{ width: COLUMN_WIDTHS.actions }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-700 text-right text-slate-400">
              <th className="px-2 py-2.5">שם</th>
              <th className="px-2 py-2.5">בעלים</th>
              <th className="px-2 py-2.5">ברוטו</th>
              <th className="px-2 py-2.5">מס%</th>
              <th className="px-2 py-2.5">נטו</th>
              <th className="px-2 py-2.5">נזילות</th>
              <th className="px-2 py-2.5" aria-label="מחק" />
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-600 bg-slate-800/50 font-medium">
              <td colSpan={2} className="px-2 py-2.5 text-slate-300">
                סיכום
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 font-mono text-white">
                {formatCurrency(totalGross(assets))}
              </td>
              <td className="px-2 py-2.5" />
              <td className="whitespace-nowrap px-2 py-2.5 font-mono text-accent">
                {formatCurrency(totalNet(assets))}
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 font-mono text-amber">
                <span className="text-slate-500">נזיל </span>
                {formatCurrency(totalLiquidNet(assets))}
              </td>
              <td className="px-2 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>

      <CsvUpload isOpen={csvOpen} onClose={() => setCsvOpen(false)} />
    </section>
  );
}
