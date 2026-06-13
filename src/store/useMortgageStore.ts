import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MortgageParams } from '../types';

function calcFromPercent(value: number, percent: number): number {
  return Math.round(value * percent / 100);
}

const DEFAULT_MORTGAGE: MortgageParams = {
  apartmentValue: 0,
  alreadyPaid: 0,
  dueSoon: 0,
  alreadyPaidPercent: 0,
  dueSoonPercent: 0,
  alreadyPaidManual: false,
  dueSoonManual: false,
  extraEquity: 0,
  annualRate: 4.5,
  termYears: 25,
  entryMonthOffset: 0,
};

function applyDerivedFields(state: MortgageParams, patch: Partial<MortgageParams>): MortgageParams {
  const next: MortgageParams = { ...state, ...patch };

  if ('apartmentValue' in patch || 'alreadyPaidPercent' in patch) {
    if (!next.alreadyPaidManual || 'alreadyPaidPercent' in patch) {
      if ('alreadyPaidPercent' in patch) next.alreadyPaidManual = false;
      next.alreadyPaid = calcFromPercent(next.apartmentValue, next.alreadyPaidPercent);
    }
  }

  if ('apartmentValue' in patch || 'dueSoonPercent' in patch) {
    if (!next.dueSoonManual || 'dueSoonPercent' in patch) {
      if ('dueSoonPercent' in patch) next.dueSoonManual = false;
      next.dueSoon = calcFromPercent(next.apartmentValue, next.dueSoonPercent);
    }
  }

  if ('alreadyPaid' in patch && !('alreadyPaidManual' in patch)) {
    next.alreadyPaidManual = true;
  }

  if ('dueSoon' in patch && !('dueSoonManual' in patch)) {
    next.dueSoonManual = true;
  }

  if (patch.alreadyPaidManual === false) {
    next.alreadyPaid = calcFromPercent(next.apartmentValue, next.alreadyPaidPercent);
  }

  if (patch.dueSoonManual === false) {
    next.dueSoon = calcFromPercent(next.apartmentValue, next.dueSoonPercent);
  }

  return next;
}

interface MortgageState extends MortgageParams {
  setField: (patch: Partial<MortgageParams>) => void;
  reset: () => void;
}

export const useMortgageStore = create<MortgageState>()(
  persist(
    (set) => ({
      ...DEFAULT_MORTGAGE,

      setField: (patch) =>
        set((state) => applyDerivedFields(state, patch)),

      reset: () => set(DEFAULT_MORTGAGE),
    }),
    {
      name: 'mortgage-store',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: () => applyDerivedFields(DEFAULT_MORTGAGE, {}),
    },
  ),
);
