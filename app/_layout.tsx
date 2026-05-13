import { useEffect } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleDaily } from '../lib/notifications';
import { initPurchases } from '../lib/purchases';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    initPurchases().catch(() => {});
    async function reschedule() {
      const time = await AsyncStorage.getItem('selah:reminderTime');
      if (time) {
        scheduleDaily(time).catch(() => {});
      }
    }
    reschedule();
  }, []);

  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="mood" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="verse" options={{ headerShown: false }} />
      <Stack.Screen name="trace" options={{ headerShown: false }} />
      <Stack.Screen name="collections" options={{ headerShown: false }} />
      <Stack.Screen name="collection-detail" options={{ headerShown: false }} />
      <Stack.Screen name="paths" options={{ headerShown: false }} />
      <Stack.Screen name="path-detail" options={{ headerShown: false }} />
      <Stack.Screen name="path-day" options={{ headerShown: false }} />
      <Stack.Screen name="path-complete" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="intro" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="questionnaire" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="questionnaire-response" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="conclusion" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="thank-you" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
