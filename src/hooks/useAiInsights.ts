import { useCallback, useRef, useState } from 'react';
import type { Asset, ChartPoint, MortgageParams, ScenarioConfig } from '../types';
import { fetchAiInsights, ApiUnauthorizedError } from '../lib/aiInsights';
import { useAssetsStore } from '../store/useAssetsStore';
import { selectMortgageParams, useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useSimulation } from './useSimulation';
import { useShallow } from 'zustand/react/shallow';

export interface AiInsightsResult {
  text: string;
  loading: boolean;
  error: string | null;
  selectedLabel: string | null;
  generateWithPrompt: (prompt: string, label: string) => Promise<void>;
  hasApiKey: boolean;
  assets: Asset[];
  mortgage: MortgageParams;
  chartData: ChartPoint[];
  scenario: ScenarioConfig;
}

export function useAiInsights(onUnauthorized?: (message: string) => void): AiInsightsResult {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const apiKey = useSettingsStore((s) => s.openRouterApiKey);
  const clearApiKey = useSettingsStore((s) => s.clearApiKey);
  const assets = useAssetsStore((s) => s.assets);
  const mortgage = useMortgageStore(useShallow(selectMortgageParams));
  const { chartData, scenario } = useSimulation();

  const generateWithPrompt = useCallback(
    async (prompt: string, label: string): Promise<void> => {
      if (!apiKey) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setText('');
      setSelectedLabel(label);

      try {
        const stream = fetchAiInsights(apiKey, prompt, controller.signal);

        for await (const chunk of stream) {
          setText((prev) => prev + chunk);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (err instanceof ApiUnauthorizedError) {
          clearApiKey();
          setError(err.message);
          setSelectedLabel(null);
          onUnauthorized?.(err.message);
          return;
        }
        setError(err instanceof Error ? err.message : 'שגיאה לא צפויה');
        setSelectedLabel(null);
      } finally {
        setLoading(false);
      }
    },
    [apiKey, clearApiKey, onUnauthorized],
  );

  return {
    text,
    loading,
    error,
    selectedLabel,
    generateWithPrompt,
    hasApiKey: !!apiKey,
    assets,
    mortgage,
    chartData,
    scenario,
  };
}
