import { useMemo } from 'react';
import { useAssetsStore } from '../store/useAssetsStore';
import { useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  runSimulation,
  findCashTrough,
  getLatestLtv,
  getLatestNetEquity,
  mortgagePrincipal,
  monthlyPayment,
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

    return {
      chartData,
      cashTrough,
      currentLtv: getLatestLtv(chartData),
      netEquity: getLatestNetEquity(chartData),
      mortgagePrincipal: principal,
      monthlyPayment: payment,
      scenario,
    };
  }, [assets, mortgage, scenario]);
}
