import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTraces } from './useTraces';
import { todayString } from '../lib/seededDate';

export function useTracePrompt(verseReference: string | undefined) {
  const { getTraceForReference } = useTraces();

  const [tracePromptVisible, setTracePromptVisible] = useState(false);
  const [tracedToday, setTracedToday] = useState(false);
  const traceOpacity = useRef(new Animated.Value(0)).current;
  const traceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 8-second trace prompt timer — resets whenever verse changes
  useEffect(() => {
    setTracePromptVisible(false);
    traceOpacity.setValue(0);
    clearTimeout(traceTimerRef.current ?? undefined);

    if (!verseReference) return;
    traceTimerRef.current = setTimeout(() => {
      setTracePromptVisible(true);
    }, 8000);

    return () => { clearTimeout(traceTimerRef.current ?? undefined); };
  }, [verseReference]);

  // Fade in when prompt becomes visible
  useEffect(() => {
    if (tracePromptVisible) {
      Animated.timing(traceOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [tracePromptVisible]);

  // Check trace status — fires on verse change
  useEffect(() => {
    if (!verseReference) return;
    const today = todayString();
    getTraceForReference(verseReference).then(trace => {
      setTracedToday(!!trace && trace.date === today);
    });
  }, [verseReference]);

  // Re-check on focus return (e.g. after saving a trace)
  useFocusEffect(
    useCallback(() => {
      if (!verseReference) return;
      const today = todayString();
      getTraceForReference(verseReference).then(trace => {
        setTracedToday(!!trace && trace.date === today);
      });
    }, [verseReference])
  );

  return { tracePromptVisible, tracedToday, traceOpacity };
}
