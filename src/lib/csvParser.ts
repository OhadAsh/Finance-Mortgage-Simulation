import Papa from 'papaparse';
import type { Asset, LiquidityStatus } from '../types';

const REQUIRED_COLUMNS = ['שם', 'בעלים', 'סכום', 'מס%', 'נזילות'] as const;

type CsvRow = Record<string, string>;

export interface CsvParseResult {
  assets: Asset[];
  errors: string[];
}

function generateId(): string {
  return crypto.randomUUID();
}

function parseLiquidity(value: string): LiquidityStatus | null {
  const normalized = value.trim().toLowerCase();

  const mapping: Record<string, LiquidityStatus> = {
    liquid: 'liquid',
    semi: 'semi',
    locked: 'locked',
    'נזיל': 'liquid',
    'חצי נזיל': 'semi',
    'נעול': 'locked',
  };

  return mapping[normalized] ?? null;
}

function parseTaxRate(value: string): number | null {
  const num = parseFloat(value.replace('%', '').trim());
  if (Number.isNaN(num)) return null;
  if (num > 1) return num / 100;
  return num;
}

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[₪,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return null;
  return num;
}

function validateColumns(fields: string[] | undefined): string[] {
  const errors: string[] = [];
  if (!fields) {
    errors.push('קובץ CSV ריק או לא תקין');
    return errors;
  }

  for (const col of REQUIRED_COLUMNS) {
    if (!fields.includes(col)) {
      errors.push(`עמודה חסרה: ${col}`);
    }
  }

  return errors;
}

function rowToAsset(row: CsvRow, rowIndex: number): { asset: Asset | null; errors: string[] } {
  const errors: string[] = [];
  const name = row['שם']?.trim() ?? '';
  const owner = row['בעלים']?.trim() ?? '';
  const amountStr = row['סכום'] ?? '';
  const taxStr = row['מס%'] ?? '';
  const liquidityStr = row['נזילות'] ?? '';

  if (!name) errors.push(`שורה ${rowIndex + 2}: שם נכס חסר`);
  if (!owner) errors.push(`שורה ${rowIndex + 2}: בעלים חסר`);

  const grossAmount = parseAmount(amountStr);
  if (grossAmount === null) errors.push(`שורה ${rowIndex + 2}: סכום לא תקין`);

  const taxRate = parseTaxRate(taxStr);
  if (taxRate === null) errors.push(`שורה ${rowIndex + 2}: מס% לא תקין`);

  const liquidity = parseLiquidity(liquidityStr);
  if (!liquidity) errors.push(`שורה ${rowIndex + 2}: נזילות לא תקינה`);

  if (errors.length > 0 || grossAmount === null || taxRate === null || !liquidity) {
    return { asset: null, errors };
  }

  return {
    asset: {
      id: generateId(),
      name,
      owner,
      grossAmount,
      taxRate,
      liquidity,
    },
    errors: [],
  };
}

export function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const columnErrors = validateColumns(results.meta.fields);
        if (columnErrors.length > 0) {
          resolve({ assets: [], errors: columnErrors });
          return;
        }

        const assets: Asset[] = [];
        const errors: string[] = [];

        results.data.forEach((row, index) => {
          const { asset, errors: rowErrors } = rowToAsset(row, index);
          errors.push(...rowErrors);
          if (asset) assets.push(asset);
        });

        if (assets.length === 0 && errors.length === 0) {
          errors.push('לא נמצאו נכסים בקובץ');
        }

        resolve({ assets, errors });
      },
      error: (error) => {
        resolve({ assets: [], errors: [`שגיאה בקריאת הקובץ: ${error.message}`] });
      },
    });
  });
}

export function parseCsvText(text: string): CsvParseResult {
  const results = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const columnErrors = validateColumns(results.meta.fields);
  if (columnErrors.length > 0) {
    return { assets: [], errors: columnErrors };
  }

  const assets: Asset[] = [];
  const errors: string[] = [];

  results.data.forEach((row, index) => {
    const { asset, errors: rowErrors } = rowToAsset(row, index);
    errors.push(...rowErrors);
    if (asset) assets.push(asset);
  });

  if (assets.length === 0 && errors.length === 0) {
    errors.push('לא נמצאו נכסים בקובץ');
  }

  return { assets, errors };
}
