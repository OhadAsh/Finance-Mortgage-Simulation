import { useAssetsStore } from '../store/useAssetsStore';
import { useMortgageStore } from '../store/useMortgageStore';
import { useSettingsStore } from '../store/useSettingsStore';

export async function clearAllAppData(): Promise<void> {
  try {
    await Promise.all([
      useAssetsStore.persist.clearStorage(),
      useMortgageStore.persist.clearStorage(),
      useSettingsStore.persist.clearStorage(),
    ]);

    useAssetsStore.getState().reset();
    useMortgageStore.getState().reset();
    useSettingsStore.getState().resetAll();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'לא ניתן למחוק את הנתונים השמורים בדפדפן';
    throw new Error(message);
  }
}
