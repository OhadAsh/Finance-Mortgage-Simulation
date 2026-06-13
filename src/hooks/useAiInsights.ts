import { useCallback, useRef, useState } from 'react';
import { fetchAiInsights } from '../lib/aiInsights';
import { useAssetsStore } from '../store/useAssetsStore';
import { useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useSimulation } from './useSimulation';

export function useAiInsights() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const apiKey = useSettingsStore((s) => s.openRouterApiKey);
  const assets = useAssetsStore((s) => s.assets);
  const mortgage = useMortgageStore();
  const { chartData, scenario } = useSimulation();

  const generateWithPrompt = useCallback(
    async (prompt: string, label: string) => {
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
        setError(err instanceof Error ? err.message : 'שגיאה לא צפויה');
        setSelectedLabel(null);
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setText('');
    setError(null);
    setSelectedLabel(null);
  }, []);

  return {
    text,
    loading,
    error,
    selectedLabel,
    generateWithPrompt,
    cancel,
    reset,
    hasApiKey: !!apiKey,
    assets,
    mortgage,
    chartData,
    scenario,
  };
}
