import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MortgageParams } from '../types';
import { createVersionedLocalStorage } from '../lib/persistStorage';

function calcFromPercent(value: number, percent: number): number {
  return Math.round(value * percent / 100);
}

const DEFAULT_MORTGAGE: MortgageParams = {
  apartmentValue: 0,
  alreadyPaid: 0,
  dueSoon: 0,
  alreadyPaidPercent: 15,
  dueSoonPercent: 10,
  alreadyPaidManual: false,
  dueSoonManual: false,
  extraEquity: 0,
  annualRate: 4.5,
  termYears: 25,
  entryMonthOffset: 0,
};

export function selectMortgageParams(state: MortgageParams): MortgageParams {
  return {
    apartmentValue: state.apartmentValue,
    alreadyPaid: state.alreadyPaid,
    dueSoon: state.dueSoon,
    alreadyPaidPercent: state.alreadyPaidPercent,
    dueSoonPercent: state.dueSoonPercent,
    alreadyPaidManual: state.alreadyPaidManual,
    dueSoonManual: state.dueSoonManual,
    extraEquity: state.extraEquity,
    annualRate: state.annualRate,
    termYears: state.termYears,
    entryMonthOffset: state.entryMonthOffset,
  };
}

function syncDerivedFields(state: MortgageParams): MortgageParams {
  const next: MortgageParams = { ...state };

  if (!next.alreadyPaidManual) {
    next.alreadyPaid = calcFromPercent(next.apartmentValue, next.alreadyPaidPercent);
  }

  if (!next.dueSoonManual) {
    next.dueSoon = calcFromPercent(next.apartmentValue, next.dueSoonPercent);
  }

  return next;
}

function applyDerivedFields(state: MortgageParams, patch: Partial<MortgageParams>): MortgageParams {
  const next: MortgageParams = { ...state, ...patch };

  if ('alreadyPaidPercent' in patch) {
    next.alreadyPaidManual = false;
  }

  if ('dueSoonPercent' in patch) {
    next.dueSoonManual = false;
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

  return syncDerivedFields(next);
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
      storage: createJSONStorage(() => createVersionedLocalStorage()),
      version: 6,
      migrate: (persistedState) =>
        syncDerivedFields({
          ...DEFAULT_MORTGAGE,
          ...(persistedState as Partial<MortgageParams>),
        }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<MortgageState>),
        ...syncDerivedFields({
          ...DEFAULT_MORTGAGE,
          ...(persistedState as Partial<MortgageParams>),
        }),
      }),
    },
  ),
);
