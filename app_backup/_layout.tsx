import React from 'react';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleDaily } from '../lib/notifications';
import { initPurchases } from '../lib/purchases';

console.log('[MODULE] loaded: app/_layout.tsx')

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CRASH] ErrorBoundary caught:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center', fontSize: 16 }}>
            Something went wrong. Please close and reopen the app.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayout() {
  React.useEffect(() => {
    const init = async () => {
      try {
        console.log('[LAUNCH] setNotificationHandler starting');
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
        console.log('[LAUNCH] setNotificationHandler done');

        console.log('[LAUNCH] initPurchases starting');
        await initPurchases();
        console.log('[LAUNCH] initPurchases done');

        console.log('[LAUNCH] reschedule starting');
        const time = await AsyncStorage.getItem('selah:reminderTime');
        if (time) {
          await scheduleDaily(time);
        }
        console.log('[LAUNCH] reschedule done');
      } catch (e) {
        console.error('[LAUNCH] launch sequence failed:', e);
      }
    };
    init();
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

export default function Root() {
  return (
    <ErrorBoundary>
      <RootLayout />
    </ErrorBoundary>
  );
}
