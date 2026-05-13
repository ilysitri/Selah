export type MoodTag =
  | 'afraid'
  | 'anxious'
  | 'overwhelmed'
  | 'weary'
  | 'exhausted'
  | 'grieving'
  | 'heartbroken'
  | 'lonely'
  | 'abandoned'
  | 'ashamed'
  | 'despairing'
  | 'restless'
  | 'grateful'
  | 'worshipful'
  | 'strong'
  | 'courageous';

export type Verse = {
  reference: string;
  text: string;
  mood_tags: MoodTag[];
  tone: string;
  notes: string | null;      // internal — never display to users
  collection: string | null; // internal — reserved for future collections
};

export type Prayer = {
  mood_tag: MoodTag;
  prayer: string;
};

export type PathDay = {
  day: number;
  verseReference: string;
  prayer: string;
  practice: string;
};

export type GuidedPath = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  duration: number;
  description: string;
  days: PathDay[];
};

export type TraceEntry = {
  id: string;         // `${date}-${reference}` slugified, e.g. "2026-05-08-psalm-46-10"
  date: string;       // YYYY-MM-DD
  reference: string;  // e.g. "Psalm 46:10"
  verseText: string;  // full verse text, stored at capture time
  tone: string;       // tone field from the verse, stored at capture time
  phrase: string;     // her one-line capture
};
