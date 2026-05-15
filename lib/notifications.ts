import * as Notifications from 'expo-notifications';
import { library, todayString, seededIndex } from './seededDate';

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDaily(time: string): Promise<void> {
  const parts = time.split(':');
  if (parts.length < 2) {
    console.error('[notifications] invalid time format:', time);
    return;
  }
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute)) {
    console.error('[notifications] NaN hour/minute from time:', time);
    return;
  }

  if (!library || library.length === 0) {
    console.error('[notifications] library is empty, skipping schedule');
    return;
  }

  await cancelAll();

  const today = todayString();
  const idx = seededIndex(today, library.length);
  const verse = library[idx];
  if (!verse) {
    console.error('[notifications] verse at index', idx, 'is undefined');
    return;
  }
  const words = verse.text.split(/\s+/).slice(0, 8).join(' ');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Selah',
      body: `${verse.reference} — ${words}…`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
