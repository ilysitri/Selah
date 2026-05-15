import libraryRaw from '../assets/data/library.json';
import type { Verse } from '../types/selah';

export const library = libraryRaw as unknown as Verse[];

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function seededIndex(dateStr: string, poolSize: number): number {
  if (!poolSize || poolSize <= 0) return 0;
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return h % poolSize;
}
