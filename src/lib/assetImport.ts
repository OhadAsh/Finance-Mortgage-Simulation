import { parseExcelFile, type AssetParseResult } from './excelParser';

export type { AssetParseResult };

export function parseAssetFile(file: File): Promise<AssetParseResult> {
  return parseExcelFile(file);
}
