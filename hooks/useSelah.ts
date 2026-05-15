// Data source: assets/data/library.jsonl and prayers.jsonl (canonical source of truth).
// The .json files in the same directory are derived for Metro bundling — edit the .jsonl files.
import AsyncStorage from '@react-native-async-storage/async-storage';
import libraryRaw from '../assets/data/library.json';
import prayersRaw from '../assets/data/prayers.json';

import type { MoodTag, Verse, Prayer } from '../types/selah';
import { todayString } from '../lib/seededDate';

// Runtime safety — Metro ESM interop can wrap JSON in { default: [...] } in production Hermes builds
const _libraryRaw: unknown[] = Array.isArray(libraryRaw)
  ? libraryRaw
  : (libraryRaw as any)?.default ?? [];

const _prayersRaw: unknown[] = Array.isArray(prayersRaw)
  ? prayersRaw
  : (prayersRaw as any)?.default ?? [];

// ── constants ────────────────────────────────────────────────────────────────

const MOODS: MoodTag[] = [
  'afraid', 'anxious', 'overwhelmed', 'weary', 'exhausted',
  'grieving', 'heartbroken', 'lonely', 'abandoned',
  'ashamed', 'despairing', 'restless',
  'grateful', 'worshipful', 'strong', 'courageous',
];

const MOOD_LABELS: Record<MoodTag, string> = {
  afraid:      'I feel afraid',
  anxious:     'I feel anxious',
  overwhelmed: "I'm overwhelmed",
  weary:       "I'm carrying too much",
  exhausted:   'I have nothing left',
  grieving:    "I'm grieving",
  heartbroken: 'My heart is broken',
  lonely:      'I feel alone',
  abandoned:   'I feel abandoned',
  ashamed:     'I feel ashamed',
  despairing:  "I'm in a dark place",
  restless:    "I can't be still",
  grateful:    'I feel grateful',
  worshipful:  'I want to worship',
  strong:      "I'm feeling strong",
  courageous:  'I need courage',
};

const MOOD_EMOJIS: Record<MoodTag, string> = {
  afraid:      '🕯️',
  anxious:     '🌊',
  overwhelmed: '☁️',
  weary:       '🍂',
  exhausted:   '🌙',
  grieving:    '🌧️',
  heartbroken: '🫧',
  lonely:      '🌿',
  abandoned:   '🪨',
  ashamed:     '🌑',
  despairing:  '🌫️',
  restless:    '🍃',
  grateful:    '☀️',
  worshipful:  '✨',
  strong:      '🕊️',
  courageous:  '🌱',
};

// ── lazy initialization ───────────────────────────────────────────────────────
// Nothing runs at module level — data is built on first use inside a function,
// so a malformed JSON shape in production Hermes never crashes before render.

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _versesByMood: Record<MoodTag, Verse[]> | null = null;
let _prayerByMood: Record<MoodTag, Prayer | undefined> | null = null;
const _moodCursor: Partial<Record<MoodTag, number>> = {};

function getVersesByMoodMap(): Record<MoodTag, Verse[]> {
  if (_versesByMood) return _versesByMood;
  try {
    const lib = _libraryRaw as Verse[];
    _versesByMood = {} as Record<MoodTag, Verse[]>;
    for (const mood of MOODS) {
      _versesByMood[mood] = shuffle(lib.filter(v => v.mood_tags.includes(mood)));
    }
  } catch (e) {
    console.error('[useSelah] Failed to initialize versesByMood:', e);
    _versesByMood = {} as Record<MoodTag, Verse[]>;
    for (const mood of MOODS) {
      _versesByMood[mood] = [];
    }
  }
  return _versesByMood;
}

function getPrayerByMoodMap(): Record<MoodTag, Prayer | undefined> {
  if (_prayerByMood) return _prayerByMood;
  try {
    const prs = _prayersRaw as Prayer[];
    _prayerByMood = {} as Record<MoodTag, Prayer | undefined>;
    for (const prayer of prs) {
      _prayerByMood[prayer.mood_tag as MoodTag] = prayer;
    }
  } catch (e) {
    console.error('[useSelah] Failed to initialize prayerByMood:', e);
    _prayerByMood = {} as Record<MoodTag, Prayer | undefined>;
  }
  return _prayerByMood;
}

// ── data functions ────────────────────────────────────────────────────────────

function getVersesByMood(mood: MoodTag): Verse[] {
  return getVersesByMoodMap()[mood] ?? [];
}

function getRandomVerseByMood(mood: MoodTag): Verse | null {
  const verses = getVersesByMoodMap()[mood];
  if (!verses || verses.length === 0) return null;
  const i = _moodCursor[mood] ?? 0;
  _moodCursor[mood] = (i + 1) % verses.length;
  return verses[i];
}

function getPrayerByMood(mood: MoodTag): Prayer | null {
  return getPrayerByMoodMap()[mood] ?? null;
}

function getAllMoods(): MoodTag[] {
  return MOODS;
}

function getMoodDisplayLabel(mood: MoodTag): string {
  return MOOD_LABELS[mood];
}

function getMoodEmoji(mood: MoodTag): string {
  return MOOD_EMOJIS[mood];
}

function getVerseByReference(reference: string): Verse | null {
  return (_libraryRaw as Verse[]).find(v => v.reference === reference) ?? null;
}

function getVersesByCollection(collection: string): Verse[] {
  return (_libraryRaw as Verse[]).filter(v => v.collection === collection);
}

async function getMoodEntryCount(): Promise<number> {
  const key = `selah:moodCount:${todayString()}`;
  const raw = await AsyncStorage.getItem(key);
  return raw ? parseInt(raw, 10) : 0;
}

async function trackMoodEntry(): Promise<void> {
  const key = `selah:moodCount:${todayString()}`;
  const count = await getMoodEntryCount();
  await AsyncStorage.setItem(key, String(count + 1));
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useSelah() {
  return {
    getVersesByMood,
    getRandomVerseByMood,
    getPrayerByMood,
    getAllMoods,
    getMoodDisplayLabel,
    getMoodEmoji,
    getVerseByReference,
    getVersesByCollection,
    getMoodEntryCount,
    trackMoodEntry,
  };
}
