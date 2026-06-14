import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
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

export function useSimulation() {
  const assets = useAssetsStore((s) => s.assets);
  const mortgage = useMortgageStore(useShallow(selectMortgageParams));
  const activeScenario = useSettingsStore((s) => s.activeScenario);
  const scenarios = useSettingsStore((s) => s.scenarios);
  const scenario = scenarios[activeScenario];

  return useMemo(() => {
    const chartData = runSimulation(assets, mortgage, scenario);
    const cashTrough = findCashTrough(chartData);
    const { principal, monthlyPayment: payment } = mortgageFigures(mortgage);

    const entryMonth = Math.min(mortgage.entryMonthOffset, chartData.length - 1);
    const atEntry = getMetricAtMonth(chartData, entryMonth);
    const atToday = getMetricAtMonth(chartData, 0);

    return {
      chartData,
      cashTrough,
      currentLtv: atEntry.ltv,
      netEquity: atEntry.netEquity,
      netEquityToday: atToday.netEquity,
      savingsNet: totalNet(assets),
      entryMonthLabel: atEntry.month,
      mortgagePrincipal: principal,
      monthlyPayment: payment,
      scenario,
    };
  }, [assets, mortgage, scenario]);
}
