// Data source: assets/data/library.jsonl and prayers.jsonl (canonical source of truth).
// The .json files in the same directory are derived for Metro bundling — edit the .jsonl files.
import AsyncStorage from '@react-native-async-storage/async-storage';
import libraryRaw from '../assets/data/library.json';
import prayersRaw from '../assets/data/prayers.json';

import type { MoodTag, Verse, Prayer } from '../types/selah';
import { todayString } from '../lib/seededDate';

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

// ── module-level data (processed once on first import) ───────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const library = libraryRaw as unknown as Verse[];
const prayers = prayersRaw as unknown as Prayer[];

// Verses indexed by mood, shuffled once per session for stable ordering
const versesByMood = {} as Record<MoodTag, Verse[]>;
for (const mood of MOODS) {
  versesByMood[mood] = shuffle(library.filter(v => v.mood_tags.includes(mood)));
}

// Prayers indexed by mood (one per tag)
const prayerByMood = {} as Record<MoodTag, Prayer | undefined>;
for (const prayer of prayers) {
  prayerByMood[prayer.mood_tag] = prayer;
}

// Round-robin cursor per mood — advances each call so the same verse is never
// returned twice in a row unless that mood has only one verse.
const moodCursor: Partial<Record<MoodTag, number>> = {};

// ── data functions ────────────────────────────────────────────────────────────

function getVersesByMood(mood: MoodTag): Verse[] {
  return versesByMood[mood] ?? [];
}

function getRandomVerseByMood(mood: MoodTag): Verse | null {
  const verses = versesByMood[mood];
  if (!verses || verses.length === 0) return null;
  const i = moodCursor[mood] ?? 0;
  moodCursor[mood] = (i + 1) % verses.length;
  return verses[i];
}

function getPrayerByMood(mood: MoodTag): Prayer | null {
  return prayerByMood[mood] ?? null;
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
  return library.find(v => v.reference === reference) ?? null;
}

function getVersesByCollection(collection: string): Verse[] {
  return library.filter(v => v.collection === collection);
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
