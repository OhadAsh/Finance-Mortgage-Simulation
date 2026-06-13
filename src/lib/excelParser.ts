import * as XLSX from 'xlsx';
import type { Asset, LiquidityStatus } from '../types';

export interface AssetParseResult {
  assets: Asset[];
  errors: string[];
}

function generateId(): string {
  return crypto.randomUUID();
}

const SUMMARY_ROW_MARKERS = ['סך הכל', 'ביחד נזיל', 'ביחד', 'סה"כ', 'סה״כ'];

const META_COLUMNS = new Set(['הערות', 'עודכן לאחרונה', 'notes', 'updated']);

function normalizeHeader(value: unknown): string {
  return String(value ?? '').trim();
}

function parseLiquidityFromExcel(value: unknown): LiquidityStatus | null {
  const normalized = normalizeHeader(value).toLowerCase();

  const mapping: Record<string, LiquidityStatus> = {
    liquid: 'liquid',
    semi: 'semi',
    locked: 'locked',
    נזיל: 'liquid',
    'לא נזיל': 'semi',
    'חצי נזיל': 'semi',
    נעול: 'locked',
  };

  return mapping[normalized] ?? null;
}

function parseNumericAmount(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const cleaned = String(value ?? '').replace(/[₪,\s]/g, '').trim();
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
}

function isSummaryRow(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;
  return SUMMARY_ROW_MARKERS.some((marker) => trimmed.startsWith(marker));
}

function inferTaxRate(notes: string): number {
  return notes.includes('לא כולל מיסים') ? 0.25 : 0;
}

function isNameColumn(header: string): boolean {
  const h = header.toLowerCase();
  return h === 'שם' || h.includes('מוצר') || h === 'name' || h === 'product';
}

function isLiquidityColumn(header: string): boolean {
  const h = header.toLowerCase();
  return h.includes('נזיל') || h === 'liquidity';
}

function parseWideFormatSheet(rows: unknown[][]): AssetParseResult {
  const errors: string[] = [];
  const assets: Asset[] = [];

  if (rows.length < 2) {
    return { assets: [], errors: ['גיליון Excel ריק או ללא שורת כותרות'] };
  }

  const headers = (rows[0] ?? []).map(normalizeHeader);
  const nameIdx = headers.findIndex(isNameColumn);
  const liquidityIdx = headers.findIndex(isLiquidityColumn);
  const notesIdx = headers.indexOf('הערות');

  if (nameIdx === -1) {
    return { assets: [], errors: ['לא נמצאה עמודת שם (מוצר/שם)'] };
  }
  if (liquidityIdx === -1) {
    return { assets: [], errors: ['לא נמצאה עמודת נזילות (נזיל/לא נזיל)'] };
  }

  const ownerColumns = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header, index }) => {
      if (index === nameIdx || index === liquidityIdx || index === notesIdx) return false;
      if (!header || META_COLUMNS.has(header)) return false;
      return index < liquidityIdx || index > liquidityIdx;
    })
    .filter(({ index }) => index > nameIdx && index < liquidityIdx);

  if (ownerColumns.length === 0) {
    return {
      assets: [],
      errors: ['לא נמצאו עמודות שותפים בין שם הנכס לעמודת הנזילות'],
    };
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row) continue;

    const name = normalizeHeader(row[nameIdx]);
    if (isSummaryRow(name)) continue;

    const liquidity = parseLiquidityFromExcel(row[liquidityIdx]);
    if (!liquidity) {
      errors.push(`שורה ${rowIndex + 1}: נזילות לא תקינה עבור "${name}"`);
      continue;
    }

    const notes = notesIdx >= 0 ? normalizeHeader(row[notesIdx]) : '';
    const taxRate = inferTaxRate(notes);
    let rowHasAsset = false;

    for (const { header: owner, index } of ownerColumns) {
      const amount = parseNumericAmount(row[index]);
      if (amount === null || amount <= 0) continue;

      rowHasAsset = true;
      assets.push({
        id: generateId(),
        name,
        owner,
        grossAmount: amount,
        taxRate,
        liquidity,
        notes: notes || undefined,
      });
    }

    if (!rowHasAsset) continue;
  }

  if (assets.length === 0 && errors.length === 0) {
    errors.push('לא נמצאו נכסים בגיליון');
  }

  return { assets, errors };
}

function pickSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  const preferred = workbook.Sheets['חסכונות'];
  if (preferred) return preferred;

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return null;
  return workbook.Sheets[firstSheetName] ?? null;
}

export function parseExcelBuffer(buffer: ArrayBuffer): AssetParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = pickSheet(workbook);

    if (!sheet) {
      return { assets: [], errors: ['קובץ Excel ללא גיליונות'] };
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      raw: true,
    });

    return parseWideFormatSheet(rows);
  } catch {
    return { assets: [], errors: ['שגיאה בקריאת קובץ Excel'] };
  }
}

export function parseExcelFile(file: File): Promise<AssetParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) {
        resolve({ assets: [], errors: ['שגיאה בקריאת הקובץ'] });
        return;
      }
      resolve(parseExcelBuffer(reader.result));
    };

    reader.onerror = () => {
      resolve({ assets: [], errors: ['שגיאה בקריאת הקובץ'] });
    };

    reader.readAsArrayBuffer(file);
  });
}
