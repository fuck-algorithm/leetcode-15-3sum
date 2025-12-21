import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { ProgrammingLanguage, UserSettings } from '../types';

interface ThreeSumDB extends DBSchema {
  settings: {
    key: string;
    value: UserSettings;
  };
}

const DB_NAME = 'leetcode-15-3sum';
const DB_VERSION = 1;
const STORE_NAME = 'settings';
const SETTINGS_KEY = 'user-settings';

let dbPromise: Promise<IDBPDatabase<ThreeSumDB>> | null = null;

async function getDB(): Promise<IDBPDatabase<ThreeSumDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ThreeSumDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'python',
  playbackSpeed: 1,
  githubStars: 0,
  githubStarsLastFetch: 0,
};

export async function getSettings(): Promise<UserSettings> {
  try {
    const db = await getDB();
    const settings = await db.get(STORE_NAME, SETTINGS_KEY);
    return settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  try {
    const db = await getDB();
    const current = await getSettings();
    await db.put(STORE_NAME, { ...current, ...settings }, SETTINGS_KEY);
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

export async function getLanguage(): Promise<ProgrammingLanguage> {
  const settings = await getSettings();
  return settings.language;
}

export async function saveLanguage(language: ProgrammingLanguage): Promise<void> {
  await saveSettings({ language });
}

export async function getPlaybackSpeed(): Promise<number> {
  const settings = await getSettings();
  return settings.playbackSpeed;
}

export async function savePlaybackSpeed(speed: number): Promise<void> {
  await saveSettings({ playbackSpeed: speed });
}

export async function getGithubStars(): Promise<{ stars: number; lastFetch: number }> {
  const settings = await getSettings();
  return {
    stars: settings.githubStars,
    lastFetch: settings.githubStarsLastFetch,
  };
}

export async function saveGithubStars(stars: number): Promise<void> {
  await saveSettings({
    githubStars: stars,
    githubStarsLastFetch: Date.now(),
  });
}
