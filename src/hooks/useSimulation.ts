import { useMemo } from 'react';
import { useAssetsStore } from '../store/useAssetsStore';
import { useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  runSimulation,
  findCashTrough,
  getMetricAtMonth,
  mortgagePrincipal,
  monthlyPayment,
  totalNet,
} from '../lib/calculations';

export function useSimulation() {
  const assets = useAssetsStore((s) => s.assets);
  const mortgage = useMortgageStore();
  const activeScenario = useSettingsStore((s) => s.activeScenario);
  const scenarios = useSettingsStore((s) => s.scenarios);
  const scenario = scenarios[activeScenario];

  return useMemo(() => {
    const chartData = runSimulation(assets, mortgage, scenario);
    const cashTrough = findCashTrough(chartData);
    const principal = mortgagePrincipal(mortgage);
    const payment = monthlyPayment(principal, mortgage.annualRate, mortgage.termYears);

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
