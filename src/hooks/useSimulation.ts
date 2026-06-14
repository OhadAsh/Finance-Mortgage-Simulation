import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { ChartPoint, ScenarioConfig } from '../types';
import { useAssetsStore } from '../store/useAssetsStore';
import { selectMortgageParams, useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  runSimulation,
  findCashTrough,
  getMetricAtMonth,
  mortgageFigures,
  totalNet,
} from '../lib/calculations';

export interface SimulationResult {
  chartData: ChartPoint[];
  cashTrough: ReturnType<typeof findCashTrough>;
  currentLtv: number;
  netEquity: number;
  savingsNet: number;
  entryMonthLabel: string;
  mortgagePrincipal: number;
  monthlyPayment: number;
  scenario: ScenarioConfig;
}

export function useSimulation(): SimulationResult {
  const assets = useAssetsStore((s) => s.assets);
  const mortgage = useMortgageStore(useShallow(selectMortgageParams));
  const activeScenario = useSettingsStore((s) => s.activeScenario);
  const scenarios = useSettingsStore((s) => s.scenarios);
  const scenario = scenarios[activeScenario];

  return useMemo((): SimulationResult => {
    const chartData = runSimulation(assets, mortgage, scenario);
    const cashTrough = findCashTrough(chartData);
    const { principal, monthlyPayment: payment } = mortgageFigures(mortgage);

    const entryMonth = Math.min(mortgage.entryMonthOffset, chartData.length - 1);
    const atEntry = getMetricAtMonth(chartData, entryMonth);

    return {
      chartData,
      cashTrough,
      currentLtv: atEntry.ltv,
      netEquity: atEntry.netEquity,
      savingsNet: totalNet(assets),
      entryMonthLabel: atEntry.month,
      mortgagePrincipal: principal,
      monthlyPayment: payment,
      scenario,
    };
  }, [assets, mortgage, scenario]);
}
