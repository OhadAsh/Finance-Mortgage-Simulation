import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AssetTable } from './components/assets/AssetTable';
import { MortgagePanel } from './components/mortgage/MortgagePanel';
import { ScenarioTabs } from './components/scenarios/ScenarioTabs';
import { MainChart } from './components/charts/MainChart';
import { EquityChart } from './components/charts/EquityChart';
import { LtvGauge } from './components/charts/LtvGauge';
import { InsightsPanel } from './components/insights/InsightsPanel';
import { ApiKeyModal } from './components/insights/ApiKeyModal';
import { useSimulation } from './hooks/useSimulation';
import { useExportReport } from './hooks/useExportReport';

export function App() {
  const { chartData, currentLtv, netEquity, savingsNet, entryMonthLabel } = useSimulation();
  const { exportXlsx, exportPdf, exporting } = useExportReport();
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiModalError, setApiModalError] = useState<string | null>(null);

  const handleOpenApiModal = (): void => {
    setApiModalError(null);
    setApiModalOpen(true);
  };

  const handleApiKeyUnauthorized = (message: string): void => {
    setApiModalError(message);
    setApiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-navy">
      <Header
        onApiKeyClick={handleOpenApiModal}
        onExportXlsx={exportXlsx}
        onExportPdf={exportPdf}
        exporting={exporting}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 lg:hidden">
          <Sidebar
            ltv={currentLtv}
            netEquity={netEquity}
            savingsNet={savingsNet}
            entryMonthLabel={entryMonthLabel}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <AssetTable />
            <MortgagePanel />
            <ScenarioTabs />
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="hidden lg:block">
              <Sidebar
                ltv={currentLtv}
                netEquity={netEquity}
                savingsNet={savingsNet}
                entryMonthLabel={entryMonthLabel}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <MainChart data={chartData} />
              </div>
              <LtvGauge value={currentLtv} />
            </div>
            <EquityChart data={chartData} />
            <InsightsPanel
              onRequestApiKey={handleOpenApiModal}
              onApiKeyUnauthorized={handleApiKeyUnauthorized}
            />
          </div>
        </div>
      </main>

      <ApiKeyModal
        isOpen={apiModalOpen}
        errorMessage={apiModalError}
        onClose={() => {
          setApiModalError(null);
          setApiModalOpen(false);
        }}
      />
    </div>
  );
}
