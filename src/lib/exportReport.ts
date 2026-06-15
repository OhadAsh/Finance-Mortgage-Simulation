import * as XLSX from 'xlsx';
import type { Asset, ChartPoint, LiquidityStatus, MortgageParams, ScenarioConfig } from '../types';
import type { CashTrough } from '../types';
import { netAssetValue, totalLiquidNet, totalNet } from './calculations';
import { formatCurrency, formatCurrencyAxis, formatNumber, formatPercent } from './utils';

export interface ExportSnapshot {
  assets: Asset[];
  mortgage: MortgageParams;
  scenarios: Record<'a' | 'b' | 'c', ScenarioConfig>;
  activeScenario: 'a' | 'b' | 'c';
  scenario: ScenarioConfig;
  chartData: ChartPoint[];
  cashTrough: CashTrough;
  currentLtv: number;
  netEquity: number;
  mortgagePrincipal: number;
  monthlyPayment: number;
}

const LIQUIDITY_EXCEL: Record<LiquidityStatus, string> = {
  liquid: 'נזיל',
  semi: 'לא נזיל',
  locked: 'נעול',
};

const LIQUIDITY_LABEL: Record<LiquidityStatus, string> = {
  liquid: 'נזיל',
  semi: 'חצי נזיל',
  locked: 'נעול',
};

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Wide-format rows matching the Excel import template */
function assetsToWideRows(assets: Asset[]): unknown[][] {
  const owners = [...new Set(assets.map((a) => a.owner))].sort();
  const grouped = new Map<
    string,
    { name: string; liquidity: LiquidityStatus; notes: string; amounts: Record<string, number> }
  >();

  for (const asset of assets) {
    const key = `${asset.name}||${asset.liquidity}||${asset.notes ?? ''}`;
    const entry = grouped.get(key) ?? {
      name: asset.name,
      liquidity: asset.liquidity,
      notes: asset.notes ?? '',
      amounts: {},
    };
    entry.amounts[asset.owner] = (entry.amounts[asset.owner] ?? 0) + asset.grossAmount;
    grouped.set(key, entry);
  }

  const header: unknown[] = ['מוצר/שם', ...owners, 'נזיל/לא נזיל', 'הערות'];
  const rows: unknown[][] = [header];

  for (const entry of grouped.values()) {
    rows.push([
      entry.name,
      ...owners.map((owner) => entry.amounts[owner] ?? 0),
      LIQUIDITY_EXCEL[entry.liquidity],
      entry.notes,
    ]);
  }

  return rows;
}

function mortgageRows(mortgage: MortgageParams): unknown[][] {
  return [
    ['שדה', 'ערך'],
    ['שווי דירה', mortgage.apartmentValue],
    ['שולם עד כה', mortgage.alreadyPaid],
    ['אחוז שולם', mortgage.alreadyPaidPercent],
    ['לתשלום בכניסה', mortgage.dueSoon],
    ['אחוז לתשלום', mortgage.dueSoonPercent],
    ['הון עצמי נוסף', mortgage.extraEquity],
    ['ריבית שנתית', mortgage.annualRate],
    ['תקופה (שנים)', mortgage.termYears],
    ['חודש כניסה', mortgage.entryMonthOffset],
  ];
}

function scenarioRows(scenarios: Record<'a' | 'b' | 'c', ScenarioConfig>): unknown[][] {
  const header = [
    'תרחיש',
    'הכנסה ראשית',
    'הכנסה משנית',
    'משנית פעילה',
    'חודש התחלה (משנית)',
    'הוצאות',
    'שכירות',
  ];
  const rows = (['a', 'b', 'c'] as const).map((id) => {
    const s = scenarios[id];
    return [
      s.label,
      s.incomeSource1,
      s.incomeSource2,
      s.incomeSource2Active ? 'כן' : 'לא',
      s.incomeSource2StartMonth,
      s.monthlyExpenses,
      s.currentRent,
    ];
  });
  return [header, ...rows];
}

/** Export only user-entered data — same structure as import */
export function exportToXlsx(snapshot: ExportSnapshot): void {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(assetsToWideRows(snapshot.assets)),
    'חסכונות',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(mortgageRows(snapshot.mortgage)),
    'משכנתא',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(scenarioRows(snapshot.scenarios)),
    'תרחישים',
  );

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `simulation-data-${timestamp()}.xlsx`,
  );
}

interface ChartSeries {
  key: keyof ChartPoint;
  color: string;
  label: string;
}

function buildLineChartSvg(
  data: ChartPoint[],
  series: ChartSeries[],
  width = 680,
  height = 180,
): string {
  if (data.length === 0) return '';

  const pad = { top: 16, right: 16, bottom: 28, left: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const allValues = data.flatMap((point) =>
    series.map((s) => Number(point[s.key])),
  );
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => pad.top + plotH - ((v - minVal) / range) * plotH;

  const gridLines = [0, 0.5, 1]
    .map((t) => {
      const y = pad.top + plotH * (1 - t);
      const val = minVal + range * t;
      return `
        <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${pad.left - 6}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${formatCurrencyAxis(val)}</text>
      `;
    })
    .join('');

  const paths = series
    .map((s) => {
      const d = data
        .map((point, i) => {
          const x = toX(i);
          const y = toY(Number(point[s.key]));
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
    })
    .join('');

  const legend = series
    .map((s, i) => {
      const x = pad.left + i * 130;
      return `
        <line x1="${x}" y1="${height - 8}" x2="${x + 16}" y2="${height - 8}" stroke="${s.color}" stroke-width="2"/>
        <text x="${x + 20}" y="${height - 4}" font-size="10" fill="#475569">${s.label}</text>
      `;
    })
    .join('');

  const xLabels = data
    .filter((_, i) => i % 5 === 0 || i === data.length - 1)
    .map((point) => {
      const idx = data.indexOf(point);
      const x = toX(idx);
      return `<text x="${x}" y="${height - 14}" text-anchor="middle" font-size="8" fill="#94a3b8">${point.month}</text>`;
    })
    .join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border-radius:8px;">
      ${gridLines}
      ${paths}
      ${xLabels}
      ${legend}
    </svg>
  `;
}

function buildReportHtml(snapshot: ExportSnapshot): string {
  const assetRows = snapshot.assets
    .map(
      (asset) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${asset.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${asset.owner}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${formatCurrency(asset.grossAmount)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${formatPercent(asset.taxRate * 100, 0)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${formatCurrency(netAssetValue(asset))}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${LIQUIDITY_LABEL[asset.liquidity]}</td>
      </tr>`,
    )
    .join('');

  const assetsChart = buildLineChartSvg(snapshot.chartData, [
    { key: 'cashBalance', color: '#10b981', label: 'יתרת נזילות' },
    { key: 'mortgageBalance', color: '#ef4444', label: 'יתרת משכנתא' },
  ]);

  const equityChart = buildLineChartSvg(snapshot.chartData, [
    { key: 'netEquity', color: '#3b82f6', label: 'הון עצמי נטו' },
  ]);

  const m = snapshot.mortgage;

  return `
    <div dir="rtl" style="font-family: Heebo, Arial, sans-serif; color: #0f172a; padding: 32px; background: #fff; width: 750px;">
      <h1 style="margin: 0 0 4px; font-size: 22px;">סימולטור נכסים ומשכנתא</h1>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 13px;">דוח סימולציה · ${new Date().toLocaleString('he-IL')}</p>

      <h2 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin-top: 24px;">סיכום</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px;">
        <tr><td style="padding: 6px 0; color: #64748b;">תרחיש פעיל</td><td style="padding: 6px 0; font-weight: 600;">${snapshot.scenario.label}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">הון עצמי נטו</td><td style="padding: 6px 0; font-weight: 600;">${formatCurrency(snapshot.netEquity)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">יחס הלוואה לשווי</td><td style="padding: 6px 0; font-weight: 600;">${formatPercent(snapshot.currentLtv, 1)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">שפל תזרים</td><td style="padding: 6px 0; font-weight: 600;">${snapshot.cashTrough.month} — ${formatCurrency(snapshot.cashTrough.value)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">סה״כ נטו / נזיל</td><td style="padding: 6px 0; font-weight: 600;">${formatCurrency(totalNet(snapshot.assets))} / ${formatCurrency(totalLiquidNet(snapshot.assets))}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">תשלום חודשי</td><td style="padding: 6px 0; font-weight: 600;">${formatCurrency(snapshot.monthlyPayment)}</td></tr>
      </table>

      <h2 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin-top: 28px;">גרפים</h2>
      <p style="margin: 12px 0 6px; font-size: 12px; color: #64748b;">נכסים מול יתרת משכנתא</p>
      ${assetsChart}
      <p style="margin: 20px 0 6px; font-size: 12px; color: #64748b;">הון עצמי נטו</p>
      ${equityChart}

      <h2 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin-top: 28px;">משכנתא</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px;">
        <tr><td style="padding: 6px 0; color: #64748b;">שווי דירה</td><td>${formatCurrency(m.apartmentValue)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">שולם עד כה</td><td>${formatCurrency(m.alreadyPaid)} (${formatPercent(m.alreadyPaidPercent, 0)})</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">לתשלום בכניסה</td><td>${formatCurrency(m.dueSoon)} (${formatPercent(m.dueSoonPercent, 0)})</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">הון עצמי נוסף</td><td>${formatCurrency(m.extraEquity)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">ריבית / תקופה</td><td>${formatPercent(m.annualRate, 1)} · ${m.termYears} שנים</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">כניסה לדירה</td><td>חודש ${formatNumber(m.entryMonthOffset)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">קרן משכנתא</td><td>${formatCurrency(snapshot.mortgagePrincipal)}</td></tr>
      </table>

      <h2 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin-top: 28px;">נכסים (${snapshot.assets.length})</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; text-align: right;">שם</th>
            <th style="padding: 8px; text-align: right;">בעלים</th>
            <th style="padding: 8px; text-align: right;">ברוטו</th>
            <th style="padding: 8px; text-align: right;">מס%</th>
            <th style="padding: 8px; text-align: right;">נטו</th>
            <th style="padding: 8px; text-align: right;">נזילות</th>
          </tr>
        </thead>
        <tbody>${assetRows || '<tr><td colspan="6" style="padding:12px;color:#94a3b8;">אין נכסים</td></tr>'}</tbody>
      </table>

      <p style="margin-top: 32px; font-size: 11px; color: #94a3b8;">לצורך עזר בלבד · אין בהמלצה פיננסית</p>
    </div>
  `;
}

export async function exportToPdf(snapshot: ExportSnapshot): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.innerHTML = buildReportHtml(snapshot);
  document.body.appendChild(container);

  const reportEl = container.firstElementChild as HTMLElement;

  try {
    const canvas = await html2canvas(reportEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`simulation-${timestamp()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
