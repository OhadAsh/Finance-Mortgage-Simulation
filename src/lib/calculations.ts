import type { Asset, CashTrough, ChartPoint, MortgageParams, ScenarioConfig } from '../types';
import { HEBREW_MONTHS } from '../types';

const SIMULATION_MONTHS = 30;
const START_YEAR = 2026;
const START_MONTH = 5; // June (0-indexed)

export function netAssetValue(asset: Asset): number {
  return asset.grossAmount * (1 - asset.taxRate);
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
        return sum + net * 0.7;
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

export function mortgagePrincipal(mortgage: MortgageParams): number {
  return Math.max(0, mortgage.apartmentValue - totalEquity(mortgage));
}

export function formatMonthLabel(monthIndex: number): string {
  const totalMonths = START_MONTH + monthIndex;
  const year = START_YEAR + Math.floor(totalMonths / 12);
  const month = totalMonths % 12;
  const shortYear = String(year).slice(-2);
  return `${HEBREW_MONTHS[month]} ${shortYear}`;
}

function getMonthlyIncome(scenario: ScenarioConfig, monthIndex: number): number {
  let income = 0;

  if (scenario.incomeSource1Active && monthIndex >= scenario.incomeSource1StartMonth) {
    income += scenario.incomeSource1;
  }

  income += scenario.incomeSource2;

  return income;
}

export function runSimulation(
  assets: Asset[],
  mortgage: MortgageParams,
  scenario: ScenarioConfig,
): ChartPoint[] {
  const points: ChartPoint[] = [];
  let cashPool = totalNet(assets);
  const principal = mortgagePrincipal(mortgage);
  const payment = monthlyPayment(principal, mortgage.annualRate, mortgage.termYears);
  const entryPayment = mortgage.dueSoon + mortgage.extraEquity;
  let mortgageMonthsElapsed = 0;
  let mortgageBalance = 0;

  for (let m = 0; m < SIMULATION_MONTHS; m++) {
    cashPool += getMonthlyIncome(scenario, m);

    if (m < mortgage.entryMonthOffset) {
      cashPool -= scenario.monthlyExpenses + scenario.currentRent;
    } else if (m === mortgage.entryMonthOffset) {
      cashPool -= entryPayment;
      cashPool -= scenario.monthlyExpenses;
      mortgageMonthsElapsed = 1;
      mortgageBalance = remainingBalance(
        principal,
        mortgage.annualRate,
        mortgage.termYears,
        mortgageMonthsElapsed,
      );
      cashPool -= payment;
    } else {
      mortgageMonthsElapsed += 1;
      mortgageBalance = remainingBalance(
        principal,
        mortgage.annualRate,
        mortgage.termYears,
        mortgageMonthsElapsed,
      );
      cashPool -= scenario.monthlyExpenses + payment;
    }

    const propertyValue =
      m >= mortgage.entryMonthOffset ? mortgage.apartmentValue : 0;
    const totalAssets = cashPool + propertyValue;
    const netEquity = totalAssets - mortgageBalance;
    const ltv =
      mortgage.apartmentValue > 0
        ? (mortgageBalance / mortgage.apartmentValue) * 100
        : 0;

    points.push({
      month: formatMonthLabel(m),
      totalAssets,
      mortgageBalance,
      netEquity,
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
    if (current && min && current.totalAssets < min.totalAssets) {
      minIndex = i;
    }
  }

  const trough = points[minIndex];
  return {
    month: trough?.month ?? '',
    value: trough?.totalAssets ?? 0,
    monthIndex: minIndex,
  };
}

export function getCurrentLtv(points: ChartPoint[]): number {
  return points[0]?.ltv ?? 0;
}

export function getLatestLtv(points: ChartPoint[]): number {
  return points[points.length - 1]?.ltv ?? 0;
}

export function getLatestNetEquity(points: ChartPoint[]): number {
  return points[points.length - 1]?.netEquity ?? 0;
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
