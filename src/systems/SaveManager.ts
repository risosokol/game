import { STORAGE_KEYS } from '@/config/GameConfig';

export interface SaveData {
  version: 1;
  discoveredLandmarks: string[];
  completedQuests: string[];
  player: { tileX: number; tileY: number } | null;
  settings: { musicEnabled: boolean; sfxEnabled: boolean };
}

const DEFAULT_SAVE: SaveData = {
  version: 1,
  discoveredLandmarks: [],
  completedQuests: [],
  player: null,
  settings: { musicEnabled: true, sfxEnabled: true },
};

/** Thin wrapper around localStorage. Fails soft (in-memory only) if
 * localStorage is unavailable (e.g. privacy mode), so the game stays
 * playable even without persistence. */
export class SaveManager {
  private data: SaveData;
  private storageAvailable: boolean;

  constructor() {
    this.storageAvailable = SaveManager.detectStorage();
    this.data = this.load();
  }

  private static detectStorage(): boolean {
    try {
      const testKey = '__trebisov_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private load(): SaveData {
    if (!this.storageAvailable) return structuredClone(DEFAULT_SAVE);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.SAVE);
      if (!raw) return structuredClone(DEFAULT_SAVE);
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        ...structuredClone(DEFAULT_SAVE),
        ...parsed,
        settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings ?? {}) },
      };
    } catch {
      return structuredClone(DEFAULT_SAVE);
    }
  }

  private persist(): void {
    if (!this.storageAvailable) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.SAVE, JSON.stringify(this.data));
    } catch {
      // ignore quota / privacy-mode failures — progress just won't persist
    }
  }

  getData(): Readonly<SaveData> {
    return this.data;
  }

  isDiscovered(landmarkId: string): boolean {
    return this.data.discoveredLandmarks.includes(landmarkId);
  }

  markDiscovered(landmarkId: string): boolean {
    if (this.isDiscovered(landmarkId)) return false;
    this.data.discoveredLandmarks.push(landmarkId);
    this.persist();
    return true;
  }

  markQuestCompleted(questId: string): boolean {
    if (this.data.completedQuests.includes(questId)) return false;
    this.data.completedQuests.push(questId);
    this.persist();
    return true;
  }

  isQuestCompleted(questId: string): boolean {
    return this.data.completedQuests.includes(questId);
  }

  savePlayerPosition(tileX: number, tileY: number): void {
    this.data.player = { tileX, tileY };
    this.persist();
  }

  getPlayerPosition(): { tileX: number; tileY: number } | null {
    return this.data.player;
  }

  setSetting<K extends keyof SaveData['settings']>(key: K, value: SaveData['settings'][K]): void {
    this.data.settings[key] = value;
    this.persist();
  }

  getSettings(): SaveData['settings'] {
    return this.data.settings;
  }

  resetAll(): void {
    this.data = structuredClone(DEFAULT_SAVE);
    this.persist();
  }
}

export const saveManager = new SaveManager();
