import { memo, useState, type ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import type { Asset, LiquidityStatus } from '../../types';
import { netAssetValue } from '../../lib/calculations';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { useAssetsStore } from '../../store/useAssetsStore';

interface AssetRowProps {
  asset: Asset;
}

const liquidityRowColors: Record<LiquidityStatus, string> = {
  liquid: 'border-r-accent/60',
  semi: 'border-r-amber/60',
  locked: 'border-r-danger/60',
};

const liquidityLabels: Record<LiquidityStatus, string> = {
  liquid: 'נזיל',
  semi: 'חצי נזיל',
  locked: 'נעול',
};

const fieldAriaLabels: Record<EditableField, string> = {
  name: 'שם נכס',
  owner: 'בעלים',
  grossAmount: 'סכום ברוטו',
  taxRate: 'אחוז מס',
};

type EditableField = 'name' | 'owner' | 'grossAmount' | 'taxRate';

function AssetRowComponent({ asset }: AssetRowProps): ReactElement {
  const updateAsset = useAssetsStore((s) => s.updateAsset);
  const removeAsset = useAssetsStore((s) => s.removeAsset);
  const setLiquidity = useAssetsStore((s) => s.setLiquidity);
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (field: EditableField): void => {
    setEditing(field);
    if (field === 'grossAmount') {
      setEditValue(String(asset.grossAmount));
    } else if (field === 'taxRate') {
      setEditValue(String(asset.taxRate * 100));
    } else {
      setEditValue(asset[field]);
    }
  };

  const commitEdit = (): void => {
    if (!editing) return;

    if (editing === 'grossAmount') {
      const val = editValue.trim() === '' ? 0 : parseFloat(editValue);
      if (!Number.isNaN(val)) updateAsset(asset.id, { grossAmount: val });
    } else if (editing === 'taxRate') {
      const val = editValue.trim() === '' ? 0 : parseFloat(editValue);
      if (!Number.isNaN(val)) updateAsset(asset.id, { taxRate: val / 100 });
    } else {
      updateAsset(asset.id, { [editing]: editValue });
    }

    setEditing(null);
  };

  const cycleLiquidity = (): void => {
    const order: LiquidityStatus[] = ['liquid', 'semi', 'locked'];
    const idx = order.indexOf(asset.liquidity);
    const next = order[(idx + 1) % order.length];
    if (next) setLiquidity(asset.id, next);
  };

  const renderCell = (field: EditableField, display: string): ReactElement => {
    if (editing === field) {
      return (
        <input
          autoFocus
          type="text"
          inputMode={field === 'grossAmount' || field === 'taxRate' ? 'decimal' : 'text'}
          value={editValue}
          aria-label={fieldAriaLabels[field]}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(null);
          }}
          className="no-spinner w-full rounded border border-accent bg-slate-800 px-2 py-1 text-sm text-white outline-none"
        />
      );
    }

    return (
      <button
        type="button"
        onClick={() => startEdit(field)}
        className="w-full text-right text-sm text-slate-200 transition-colors hover:text-accent"
      >
        {display}
      </button>
    );
  };

  return (
    <tr className={`border-b border-slate-700/50 border-r-4 ${liquidityRowColors[asset.liquidity]}`}>
      <td className="px-3 py-2">{renderCell('name', asset.name)}</td>
      <td className="px-3 py-2">{renderCell('owner', asset.owner)}</td>
      <td className="px-3 py-2 font-mono">{renderCell('grossAmount', formatCurrency(asset.grossAmount))}</td>
      <td className="px-3 py-2 font-mono">{renderCell('taxRate', formatPercent(asset.taxRate * 100, 0))}</td>
      <td className="px-3 py-2 font-mono text-slate-400">{formatCurrency(netAssetValue(asset))}</td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={cycleLiquidity}
          aria-label={`שנה נזילות (${liquidityLabels[asset.liquidity]})`}
        >
          <Badge status={asset.liquidity} size="sm" />
        </button>
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={() => removeAsset(asset.id)}
          className="rounded p-1 text-slate-500 transition-colors hover:bg-danger/10 hover:text-danger"
          aria-label="מחק נכס"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export const AssetRow = memo(AssetRowComponent);
