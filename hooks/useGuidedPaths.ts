import AsyncStorage from '@react-native-async-storage/async-storage';
import { GUIDED_PATHS } from '../constants/paths';
import { todayString } from '../lib/seededDate';
import type { GuidedPath } from '../types/selah';

const STORAGE_KEY = 'selah:paths';

type PathProgress = {
  pathId: string;
  startedDate: string;
  lastOpenedDate: string;
  currentDay: number;
  completedDays: number[];
  completed: boolean;
  completedDate?: string;
};

type PathsStorage = {
  activePathId: string | null;
  progress: Record<string, PathProgress>;
};

async function getStorage(): Promise<PathsStorage> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { activePathId: null, progress: {} };
  return JSON.parse(raw) as PathsStorage;
}

async function setStorage(data: PathsStorage): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getAllPaths(): GuidedPath[] {
  return GUIDED_PATHS;
}

function getPathById(id: string): GuidedPath | null {
  return GUIDED_PATHS.find(p => p.id === id) ?? null;
}

async function getActivePath(): Promise<{ path: GuidedPath; progress: PathProgress } | null> {
  const storage = await getStorage();
  if (!storage.activePathId) return null;
  const progress = storage.progress[storage.activePathId];
  if (!progress) return null;
  const path = getPathById(storage.activePathId);
  if (!path) return null;
  return { path, progress };
}

async function startPath(pathId: string): Promise<void> {
  const storage = await getStorage();
  const today = todayString();
  storage.activePathId = pathId;
  storage.progress[pathId] = {
    pathId,
    startedDate: today,
    lastOpenedDate: today,
    currentDay: 1,
    completedDays: [],
    completed: false,
  };
  await setStorage(storage);
}

async function completeDay(pathId: string, day: number): Promise<void> {
  const storage = await getStorage();
  const progress = storage.progress[pathId];
  if (!progress) return;
  const path = getPathById(pathId);
  const today = todayString();

  if (!progress.completedDays.includes(day)) {
    progress.completedDays.push(day);
  }
  progress.lastOpenedDate = today;
  progress.currentDay = day + 1;

  if (path && day >= path.duration) {
    progress.completed = true;
    progress.completedDate = today;
    storage.activePathId = null;
  }

  await setStorage(storage);
}

async function abandonPath(pathId: string): Promise<void> {
  const storage = await getStorage();
  if (storage.activePathId === pathId) {
    storage.activePathId = null;
  }
  delete storage.progress[pathId];
  await setStorage(storage);
}

async function getPathProgress(pathId: string): Promise<PathProgress | null> {
  const storage = await getStorage();
  return storage.progress[pathId] ?? null;
}

async function hasCompletedPath(pathId: string): Promise<boolean> {
  const storage = await getStorage();
  return storage.progress[pathId]?.completed ?? false;
}

export function useGuidedPaths() {
  return {
    getAllPaths,
    getPathById,
    getActivePath,
    startPath,
    completeDay,
    abandonPath,
    getPathProgress,
    hasCompletedPath,
  };
}
