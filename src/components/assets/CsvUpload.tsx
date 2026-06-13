import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { parseAssetFile } from '../../lib/assetImport';
import type { Asset } from '../../types';
import { formatCurrency } from '../../lib/format';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useAssetsStore } from '../../store/useAssetsStore';

interface CsvUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CsvUpload({ isOpen, onClose }: CsvUploadProps) {
  const importFromCsv = useAssetsStore((s) => s.importFromCsv);
  const [preview, setPreview] = useState<Asset[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const result = await parseAssetFile(file);
    setPreview(result.assets);
    setErrors(result.errors);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleConfirm = () => {
    if (preview.length > 0) {
      importFromCsv(preview, importMode);
      setPreview([]);
      setErrors([]);
      onClose();
    }
  };

  const handleClose = () => {
    setPreview([]);
    setErrors([]);
    onClose();
  };

  const baseUrl = import.meta.env.BASE_URL;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="ייבוא נכסים מ-Excel" size="lg">
      <div className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
            dragOver ? 'border-accent bg-accent/5' : 'border-slate-600'
          }`}
        >
          <Upload className="mb-3 h-10 w-10 text-slate-500" />
          <p className="mb-2 text-sm text-slate-300">גרור קובץ Excel לכאן או</p>
          <label className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80">
            בחר קובץ
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
          <p className="mt-3 text-center text-xs text-slate-500">
            גיליון עם עמודות: מוצר/שם, שותפים, נזיל/לא נזיל, הערות
          </p>
          <a
            href={`${baseUrl}assets-template.xlsx`}
            download="assets-template.xlsx"
            className="mt-2 text-xs text-accent hover:underline"
          >
            הורד תבנית Excel
          </a>
        </div>

        {errors.length > 0 && (
          <Alert variant="error" title="שגיאות בקובץ">
            <ul className="list-inside list-disc space-y-1">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}

        {preview.length > 0 && (
          <>
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              <span className="text-sm text-slate-300">
                {preview.length} נכסים מוכנים לייבוא
              </span>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-accent"
                />
                מיזוג עם קיימים
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-accent"
                />
                החלפת כל הנכסים
              </label>
            </div>

            <div className="max-h-60 overflow-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800">
                  <tr className="text-right text-slate-400">
                    <th className="px-3 py-2">שם</th>
                    <th className="px-3 py-2">בעלים</th>
                    <th className="px-3 py-2">סכום</th>
                    <th className="px-3 py-2">נזילות</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((asset) => (
                    <tr key={asset.id} className="border-t border-slate-700/50">
                      <td className="px-3 py-2">{asset.name}</td>
                      <td className="px-3 py-2">{asset.owner}</td>
                      <td className="px-3 py-2 font-mono">{formatCurrency(asset.grossAmount)}</td>
                      <td className="px-3 py-2">
                        <Badge status={asset.liquidity} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent/80"
            >
              אשר ייבוא
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
