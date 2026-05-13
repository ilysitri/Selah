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
  await cancelAll();

  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const today = todayString();
  const idx = seededIndex(today, library.length);
  const verse = library[idx];
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
