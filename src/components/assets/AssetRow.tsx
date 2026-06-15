import { memo, useState, type ReactElement } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import type { Asset, LiquidityStatus } from '../../types';
import { computedNetAssetValue, clampNetOverride } from '../../lib/calculations';
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
  const [editingManual, setEditingManual] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const hasNetOverride = asset.netOverride != null && asset.netOverride > 0;
  const computedNet = computedNetAssetValue(asset);

  const openManualEdit = (): void => {
    setManualValue(asset.netOverride != null ? String(asset.netOverride) : '');
    setEditingManual(true);
  };

  const commitManualEdit = (): void => {
    const raw = manualValue.trim();
    if (raw === '') {
      updateAsset(asset.id, { netOverride: undefined });
    } else {
      const num = parseFloat(raw.replace(/[^\d.-]/g, ''));
      if (!Number.isNaN(num) && num > 0) {
        const netOverride = clampNetOverride({ ...asset, netOverride: num });
        if (netOverride !== undefined) {
          updateAsset(asset.id, { netOverride });
        }
      }
    }
    setEditingManual(false);
  };

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
        title={field === 'name' ? asset.name : undefined}
        className={`text-right text-xs text-slate-200 transition-colors hover:text-accent ${
          field === 'name' ? 'block w-full truncate' : 'inline whitespace-nowrap'
        }`}
      >
        {display}
      </button>
    );
  };

  return (
    <tr className={`border-b border-slate-700/50 border-r-4 ${liquidityRowColors[asset.liquidity]}`}>
      <td className="px-2 py-1.5">{renderCell('name', asset.name)}</td>
      <td className="px-2 py-1.5">{renderCell('owner', asset.owner)}</td>
      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-xs">
        {renderCell('grossAmount', formatCurrency(asset.grossAmount))}
      </td>
      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-xs">
        {renderCell('taxRate', formatPercent(asset.taxRate * 100, 0))}
      </td>
      <td className="px-2 py-1.5 font-mono text-xs">
        {editingManual ? (
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-[10px] text-slate-500">₪</span>
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              value={manualValue}
              aria-label="נטו ידני"
              onChange={(e) => setManualValue(e.target.value)}
              onBlur={commitManualEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitManualEdit();
                if (e.key === 'Escape') setEditingManual(false);
              }}
              className="no-spinner min-w-0 flex-1 rounded border border-accent bg-slate-800 px-1.5 py-0.5 text-xs text-white outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span
              title={
                hasNetOverride ? 'ערך נטו ידני — מחליף את החישוב האוטומטי' : undefined
              }
              className={`min-w-0 flex-1 whitespace-nowrap ${
                hasNetOverride ? 'text-accent' : 'text-slate-400'
              }`}
            >
              {formatCurrency(hasNetOverride ? asset.netOverride! : computedNet)}
              {hasNetOverride && (
                <span className="mr-1 rounded-full border border-blue-400/30 bg-blue-400/10 px-1 py-0.5 text-[9px] font-medium text-blue-400">
                  ידני
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={openManualEdit}
              title="ערוך נטו ידני"
              className={`shrink-0 rounded p-0.5 transition-colors hover:bg-slate-700 ${
                hasNetOverride ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label="ערוך נטו ידני"
            >
              <Pencil className="h-3 w-3" />
            </button>
            {asset.netOverride != null && (
              <button
                type="button"
                onClick={() => updateAsset(asset.id, { netOverride: undefined })}
                className="shrink-0 rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
                aria-label="נקה נטו ידני"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-2 py-1.5">
        <button
          type="button"
          onClick={cycleLiquidity}
          aria-label={`שנה נזילות (${liquidityLabels[asset.liquidity]})`}
        >
          <Badge status={asset.liquidity} size="sm" />
        </button>
      </td>
      <td className="px-2 py-1.5">
        <button
          type="button"
          onClick={() => removeAsset(asset.id)}
          className="rounded p-0.5 text-slate-500 transition-colors hover:bg-danger/10 hover:text-danger"
          aria-label="מחק נכס"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

export const AssetRow = memo(AssetRowComponent);
