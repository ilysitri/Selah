import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_LAST_DATE = 'selah:streak:lastDate';
const KEY_COUNT = 'selah:streak:count';

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useStreak(): { streak: number; isLoading: boolean } {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function update() {
      const today = todayString();
      const yesterday = yesterdayString();

      const [storedDate, storedCount] = await Promise.all([
        AsyncStorage.getItem(KEY_LAST_DATE),
        AsyncStorage.getItem(KEY_COUNT),
      ]);

      let newStreak: number;

      if (!storedDate) {
        newStreak = 1;
      } else if (storedDate === today) {
        newStreak = parseInt(storedCount ?? '1', 10);
      } else if (storedDate === yesterday) {
        newStreak = parseInt(storedCount ?? '0', 10) + 1;
      } else {
        newStreak = 1;
      }

      if (storedDate !== today) {
        await AsyncStorage.multiSet([
          [KEY_LAST_DATE, today],
          [KEY_COUNT, String(newStreak)],
        ]);
      }

      setStreak(newStreak);
      setIsLoading(false);
    }

    update();
  }, []);

  return { streak, isLoading };
}
