export type CollectionKey =
  | 'lament'
  | 'identity'
  | 'motherhood'
  | 'shame-and-worthiness'
  | 'rest-and-peace'
  | 'courage-and-fear';

export type CollectionMeta = {
  key: CollectionKey;
  name: string;
  subtitle: string;
};

export const COLLECTIONS: CollectionMeta[] = [
  { key: 'lament',               name: 'Psalms of Lament',  subtitle: 'When you need words for the pain' },
  { key: 'identity',             name: 'Who You Are',        subtitle: 'Scriptures on worth and belonging' },
  { key: 'motherhood',           name: 'For Mothers',        subtitle: 'Carrying, nurturing, letting go' },
  { key: 'shame-and-worthiness', name: 'Shame & Worthiness', subtitle: 'You are not too broken to be held' },
  { key: 'rest-and-peace',       name: 'Rest & Peace',       subtitle: 'Permission to be still' },
  { key: 'courage-and-fear',     name: 'Courage & Fear',     subtitle: 'When you need to be steadied' },
];

export function getCollectionMeta(key: string): CollectionMeta | undefined {
  return COLLECTIONS.find(c => c.key === key);
}
