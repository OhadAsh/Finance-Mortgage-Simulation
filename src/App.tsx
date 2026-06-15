import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AssetTable } from './components/assets/AssetTable';
import { MortgagePanel } from './components/mortgage/MortgagePanel';
import { ScenarioTabs } from './components/scenarios/ScenarioTabs';
import { MainChart } from './components/charts/MainChart';
import { EquityChart } from './components/charts/EquityChart';
import { InsightsPanel } from './components/insights/InsightsPanel';
import { ApiKeyModal } from './components/insights/ApiKeyModal';
import { DeleteDataModal } from './components/layout/DeleteDataModal';
import { useSimulation } from './hooks/useSimulation';
import { useExportReport } from './hooks/useExportReport';

export function App() {
  const { chartData, currentLtv, netEquity, savingsNet, entryMonthLabel } = useSimulation();
  const { exportXlsx, exportPdf, exporting } = useExportReport();
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiModalError, setApiModalError] = useState<string | null>(null);
  const [deleteDataModalOpen, setDeleteDataModalOpen] = useState(false);
  const [insightsResetKey, setInsightsResetKey] = useState(0);

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
        onDeleteDataClick={() => setDeleteDataModalOpen(true)}
        onExportXlsx={exportXlsx}
        onExportPdf={exportPdf}
        exporting={exporting}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 lg:hidden">
          <Sidebar
            netEquity={netEquity}
            savingsNet={savingsNet}
            entryMonthLabel={entryMonthLabel}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-6">
            <AssetTable />
            <MortgagePanel />
            <ScenarioTabs />
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div className="hidden lg:block">
              <Sidebar
                netEquity={netEquity}
                savingsNet={savingsNet}
                entryMonthLabel={entryMonthLabel}
              />
            </div>
            <MainChart
              data={chartData}
              ltv={currentLtv}
              entryMonthLabel={entryMonthLabel}
            />
            <EquityChart data={chartData} />
            <InsightsPanel
              onRequestApiKey={handleOpenApiModal}
              onApiKeyUnauthorized={handleApiKeyUnauthorized}
              resetKey={insightsResetKey}
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

      <DeleteDataModal
        isOpen={deleteDataModalOpen}
        onClose={() => setDeleteDataModalOpen(false)}
        onCleared={() => setInsightsResetKey((key) => key + 1)}
      />
    </div>
  );
}
