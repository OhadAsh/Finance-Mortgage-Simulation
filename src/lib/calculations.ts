import type { Asset, CashTrough, ChartPoint, MortgageParams, ScenarioConfig } from '../types';
import { HEBREW_MONTHS } from '../types';
import {
  POST_ENTRY_BUFFER_MONTHS,
  SEMI_LIQUID_FACTOR,
  SIMULATION_MONTHS,
  START_MONTH,
  START_YEAR,
} from './constants';

export function computedNetAssetValue(asset: Pick<Asset, 'grossAmount' | 'taxRate'>): number {
  return Math.round(asset.grossAmount * (1 - asset.taxRate));
}

/** Manual net is capped at gross — it can only reduce tax impact, not exceed the holding value. */
export function clampNetOverride(
  asset: Pick<Asset, 'grossAmount' | 'netOverride'>,
): number | undefined {
  if (asset.netOverride == null || asset.netOverride <= 0) return undefined;
  const maxNet = Math.max(0, asset.grossAmount);
  const clamped = Math.min(asset.netOverride, maxNet);
  return clamped > 0 ? clamped : undefined;
}

export function netAssetValue(asset: Asset): number {
  if (asset.netOverride && asset.netOverride > 0) {
    return asset.netOverride;
  }
  return computedNetAssetValue(asset);
}

export function totalGross(assets: Asset[]): number {
  return assets.reduce((sum, asset) => sum + asset.grossAmount, 0);
}

export function totalNet(assets: Asset[]): number {
  return assets.reduce((sum, asset) => sum + netAssetValue(asset), 0);
}

export function totalLiquidNet(assets: Asset[]): number {
  return assets.reduce((sum, asset) => {
    const net = netAssetValue(asset);
    switch (asset.liquidity) {
      case 'liquid':
        return sum + net;
      case 'semi':
        return sum + net * SEMI_LIQUID_FACTOR;
      case 'locked':
        return sum;
    }
  }, 0);
}

export function monthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number,
): number {
  if (principal <= 0) return 0;
  if (annualRate === 0) return principal / (termYears * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function remainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  monthsElapsed: number,
): number {
  if (principal <= 0 || monthsElapsed <= 0) return principal;
  if (monthsElapsed >= termYears * 12) return 0;
  if (annualRate === 0) {
    const payment = principal / (termYears * 12);
    return Math.max(0, principal - payment * monthsElapsed);
  }

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  const payment = (principal * monthlyRate * factor) / (factor - 1);
  const balance =
    principal * Math.pow(1 + monthlyRate, monthsElapsed) -
    payment * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate);
  return Math.max(0, balance);
}

export function totalEquity(mortgage: MortgageParams): number {
  return mortgage.alreadyPaid + mortgage.dueSoon + mortgage.extraEquity;
}

/** mortgageP = apartmentValue − alreadyPaid − dueSoon − extraEquity */
export function mortgagePrincipal(mortgage: MortgageParams): number {
  const { apartmentValue, alreadyPaid, dueSoon, extraEquity } = mortgage;
  return Math.max(0, apartmentValue - alreadyPaid - dueSoon - extraEquity);
}

export function mortgageFigures(mortgage: MortgageParams): {
  principal: number;
  monthlyPayment: number;
} {
  const principal = mortgagePrincipal(mortgage);
  return {
    principal,
    monthlyPayment: monthlyPayment(principal, mortgage.annualRate, mortgage.termYears),
  };
}

export function formatMonthLabel(monthIndex: number): string {
  const totalMonths = START_MONTH + monthIndex;
  const year = START_YEAR + Math.floor(totalMonths / 12);
  const month = totalMonths % 12;
  const shortYear = String(year).slice(-2);
  return `${HEBREW_MONTHS[month]} ${shortYear}`;
}

function getMonthlySavings(
  scenario: ScenarioConfig,
  monthIndex: number,
  isPostEntry: boolean,
): number {
  const income1 = scenario.incomeSource1;
  const income2 =
    scenario.incomeSource2Active && monthIndex >= scenario.incomeSource2StartMonth
      ? scenario.incomeSource2
      : 0;

  return (
    income1 +
    income2 -
    scenario.monthlyExpenses -
    (isPostEntry ? 0 : scenario.currentRent)
  );
}

export function runSimulation(
  assets: Asset[],
  mortgage: MortgageParams,
  scenario: ScenarioConfig,
): ChartPoint[] {
  const points: ChartPoint[] = [];
  const liquidStart = totalLiquidNet(assets);
  const illiquidNet = totalNet(assets) - liquidStart;
  let cashPool = liquidStart;
  const principal = mortgagePrincipal(mortgage);
  const payment = monthlyPayment(principal, mortgage.annualRate, mortgage.termYears);
  const entryPayment = mortgage.dueSoon + mortgage.extraEquity;
  let mortgageMonthsElapsed = 0;
  let mortgageBalance = 0;
  const monthCount = Math.max(SIMULATION_MONTHS, mortgage.entryMonthOffset + POST_ENTRY_BUFFER_MONTHS);

  for (let m = 0; m < monthCount; m++) {
    const isPostEntry = m >= mortgage.entryMonthOffset;
    const monthlySavings = getMonthlySavings(scenario, m, isPostEntry);

    cashPool += monthlySavings;

    if (m === mortgage.entryMonthOffset) {
      cashPool -= entryPayment;
      mortgageMonthsElapsed = 1;
      mortgageBalance = remainingBalance(
        principal,
        mortgage.annualRate,
        mortgage.termYears,
        mortgageMonthsElapsed,
      );
      cashPool -= payment;
    } else if (m > mortgage.entryMonthOffset) {
      mortgageMonthsElapsed += 1;
      mortgageBalance = remainingBalance(
        principal,
        mortgage.annualRate,
        mortgage.termYears,
        mortgageMonthsElapsed,
      );
      cashPool -= payment;
    }

    const propertyValue =
      m >= mortgage.entryMonthOffset ? mortgage.apartmentValue : 0;
    const totalAssets = cashPool + illiquidNet + propertyValue;
    const netEquity = totalAssets - mortgageBalance;
    const liquidNetEquity = cashPool + propertyValue - mortgageBalance;
    const ltv =
      mortgage.apartmentValue > 0
        ? (mortgageBalance / mortgage.apartmentValue) * 100
        : 0;

    points.push({
      month: formatMonthLabel(m),
      totalAssets,
      cashBalance: cashPool,
      mortgageBalance,
      netEquity,
      liquidNetEquity,
      ltv,
    });
  }

  return points;
}

export function findCashTrough(points: ChartPoint[]): CashTrough {
  if (points.length === 0) {
    return { month: '', value: 0, monthIndex: 0 };
  }

  let minIndex = 0;
  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const min = points[minIndex];
    if (current && min && current.cashBalance < min.cashBalance) {
      minIndex = i;
    }
  }

  const trough = points[minIndex];
  return {
    month: trough?.month ?? '',
    value: trough?.cashBalance ?? 0,
    monthIndex: minIndex,
  };
}

export function getMetricAtMonth(
  points: ChartPoint[],
  monthIndex: number,
): { netEquity: number; ltv: number; month: string } {
  const clamped = Math.max(0, Math.min(monthIndex, points.length - 1));
  const point = points[clamped];
  return {
    netEquity: point?.netEquity ?? 0,
    ltv: point?.ltv ?? 0,
    month: point?.month ?? '',
  };
}
