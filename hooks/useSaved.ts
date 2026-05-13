import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'selah:saved';
const MAX_SAVED = 50;

async function getSaved(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

async function saveVerse(reference: string): Promise<void> {
  const saved = await getSaved();
  if (saved.includes(reference)) return;
  await AsyncStorage.setItem(KEY, JSON.stringify([reference, ...saved].slice(0, MAX_SAVED)));
}

async function unsaveVerse(reference: string): Promise<void> {
  const saved = await getSaved();
  await AsyncStorage.setItem(KEY, JSON.stringify(saved.filter(r => r !== reference)));
}

async function isSaved(reference: string): Promise<boolean> {
  const saved = await getSaved();
  return saved.includes(reference);
}

export function useSaved() {
  return { getSaved, saveVerse, unsaveVerse, isSaved };
}
