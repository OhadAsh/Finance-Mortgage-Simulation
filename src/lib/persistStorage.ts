import type { StateStorage } from 'zustand/middleware';

interface VersionedPersistEnvelope<T> {
  version: number;
  state: T;
}

function isVersionedEnvelope(value: unknown): value is VersionedPersistEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'state' in value &&
    'version' in value &&
    typeof (value as VersionedPersistEnvelope<unknown>).version === 'number'
  );
}

/** Normalizes legacy flat localStorage entries to { version, state }. */
export function createVersionedLocalStorage(): StateStorage {
  return {
    getItem: (name: string): string | null => {
      const raw = localStorage.getItem(name);
      if (!raw) return null;

      try {
        const parsed: unknown = JSON.parse(raw);
        if (isVersionedEnvelope(parsed)) {
          return raw;
        }
        return JSON.stringify({ version: 0, state: parsed } satisfies VersionedPersistEnvelope<unknown>);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
      localStorage.removeItem(name);
    },
  };
}
