import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Asset, LiquidityStatus } from '../types';
import { createVersionedLocalStorage } from '../lib/persistStorage';

function generateId(): string {
  return crypto.randomUUID();
}

const DEFAULT_ASSETS: Asset[] = [];

interface AssetsState {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  setLiquidity: (id: string, status: LiquidityStatus) => void;
  importFromCsv: (assets: Asset[], mode: 'merge' | 'replace') => void;
  reset: () => void;
}

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set) => ({
      assets: DEFAULT_ASSETS,

      addAsset: (asset) =>
        set((state) => ({
          assets: [...state.assets, { ...asset, id: generateId() }],
        })),

      updateAsset: (id, patch) =>
        set((state) => ({
          assets: state.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        })),

      setLiquidity: (id, status) =>
        set((state) => ({
          assets: state.assets.map((a) => (a.id === id ? { ...a, liquidity: status } : a)),
        })),

      importFromCsv: (assets, mode) =>
        set((state) => ({
          assets: mode === 'replace' ? assets : [...state.assets, ...assets],
        })),

      reset: () => set({ assets: [] }),
    }),
    {
      name: 'assets-store',
      storage: createJSONStorage(() => createVersionedLocalStorage()),
      version: 5,
      migrate: () => ({ assets: [] }),
    },
  ),
);
