import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TraceEntry } from '../types/selah';

const KEY = 'selah:traces';
const MAX_TRACES = 365;

async function loadTraces(): Promise<TraceEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as TraceEntry[]) : [];
}

async function saveTrace(entry: TraceEntry): Promise<void> {
  const existing = await loadTraces();
  const updated = [entry, ...existing].slice(0, MAX_TRACES);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

async function getTraceForReference(reference: string): Promise<TraceEntry | null> {
  const traces = await loadTraces();
  return traces.find(t => t.reference === reference) ?? null;
}

async function getTraceOneYearAgo(): Promise<TraceEntry | null> {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const targetDate = `${y}-${m}-${day}`;
  const traces = await loadTraces();
  return traces.find(t => t.date === targetDate) ?? null;
}

export function useTraces() {
  return { saveTrace, loadTraces, getTraceForReference, getTraceOneYearAgo };
}
