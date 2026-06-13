import { useCallback, useState } from 'react';
import { useAssetsStore } from '../store/useAssetsStore';
import { useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useSimulation } from './useSimulation';
import { exportToPdf, exportToXlsx } from '../lib/exportReport';

export function useExportReport() {
  const [exporting, setExporting] = useState(false);
  const assets = useAssetsStore((s) => s.assets);
  const mortgage = useMortgageStore();
  const activeScenario = useSettingsStore((s) => s.activeScenario);
  const scenarios = useSettingsStore((s) => s.scenarios);
  const simulation = useSimulation();

  const buildSnapshot = useCallback(() => {
    const { chartData, cashTrough, currentLtv, netEquity, mortgagePrincipal, monthlyPayment, scenario } =
      simulation;

    return {
      assets,
      mortgage,
      scenarios,
      activeScenario,
      scenario,
      chartData,
      cashTrough,
      currentLtv,
      netEquity,
      mortgagePrincipal,
      monthlyPayment,
    };
  }, [assets, mortgage, scenarios, activeScenario, simulation]);

  const exportXlsx = useCallback(() => {
    exportToXlsx(buildSnapshot());
  }, [buildSnapshot]);

  const exportPdf = useCallback(async () => {
    setExporting(true);
    try {
      await exportToPdf(buildSnapshot());
    } finally {
      setExporting(false);
    }
  }, [buildSnapshot]);

  return { exportXlsx, exportPdf, exporting };
}
