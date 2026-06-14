import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScenarioConfig } from '../types';
import { SCENARIO_DEFAULTS } from '../types';
import { MAX_SCENARIO_MONTH } from '../lib/constants';
import { createVersionedLocalStorage } from '../lib/persistStorage';

interface SettingsState {
  openRouterApiKey: string | null;
  activeScenario: 'a' | 'b' | 'c';
  scenarios: Record<'a' | 'b' | 'c', ScenarioConfig>;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  setScenario: (id: 'a' | 'b' | 'c') => void;
  updateScenario: (id: 'a' | 'b' | 'c', patch: Partial<ScenarioConfig>) => void;
  resetScenarios: () => void;
}

interface LegacySettings {
  anthropicApiKey?: string | null;
  openRouterApiKey?: string | null;
}

type LegacyScenario = Partial<ScenarioConfig> & {
  husbandSalaryNet?: number;
  husbandHasIncome?: boolean;
  husbandStartMonth?: number;
  wifeSalaryNet?: number;
};

function normalizeScenario(scenario: LegacyScenario, id: 'a' | 'b' | 'c'): ScenarioConfig {
  const defaults = SCENARIO_DEFAULTS[id];

  const legacyStart = scenario.husbandStartMonth ?? scenario.incomeSource1StartMonth;
  const legacyActive =
    scenario.incomeSource1Active ??
    scenario.husbandHasIncome ??
    (legacyStart === 999 ? false : defaults.incomeSource1Active);

  const startMonth = legacyStart ?? defaults.incomeSource1StartMonth;

  return {
    ...defaults,
    ...scenario,
    id,
    label: defaults.label,
    incomeSource1:
      scenario.incomeSource1 ?? scenario.husbandSalaryNet ?? defaults.incomeSource1,
    incomeSource2:
      scenario.incomeSource2 ?? scenario.wifeSalaryNet ?? defaults.incomeSource2,
    incomeSource1Active: legacyActive,
    incomeSource1StartMonth: legacyActive ? Math.min(Math.max(0, startMonth), MAX_SCENARIO_MONTH) : 0,
  };
}

function applyScenarioPreset(scenario: ScenarioConfig, id: 'a' | 'b' | 'c'): ScenarioConfig {
  const defaults = SCENARIO_DEFAULTS[id];
  return {
    ...scenario,
    id,
    label: defaults.label,
    incomeSource1Active: defaults.incomeSource1Active,
    incomeSource1StartMonth: defaults.incomeSource1StartMonth,
  };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openRouterApiKey: null,
      activeScenario: 'a',
      scenarios: { ...SCENARIO_DEFAULTS },

      setApiKey: (key) => set({ openRouterApiKey: key }),

      clearApiKey: () => set({ openRouterApiKey: null }),

      setScenario: (id) => set({ activeScenario: id }),

      updateScenario: (id, patch) =>
        set((state) => ({
          scenarios: {
            ...state.scenarios,
            [id]: { ...state.scenarios[id], ...patch },
          },
        })),

      resetScenarios: () => set({ scenarios: { ...SCENARIO_DEFAULTS } }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => createVersionedLocalStorage()),
      version: 9,
      migrate: (persistedState) => {
        const state = persistedState as Partial<SettingsState & LegacySettings> | undefined;
        const raw = state?.scenarios;
        const scenarios = {
          a: normalizeScenario(raw?.a ?? {}, 'a'),
          b: normalizeScenario(raw?.b ?? {}, 'b'),
          c: normalizeScenario(raw?.c ?? {}, 'c'),
        };
        return {
          openRouterApiKey: state?.openRouterApiKey ?? state?.anthropicApiKey ?? null,
          activeScenario: state?.activeScenario ?? 'a',
          scenarios: {
            a: applyScenarioPreset(scenarios.a, 'a'),
            b: applyScenarioPreset(scenarios.b, 'b'),
            c: applyScenarioPreset(scenarios.c, 'c'),
          },
        };
      },
    },
  ),
);
