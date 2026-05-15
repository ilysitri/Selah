import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isPremiumCustomer,
  doPurchasePackage,
  doRestorePurchases,
  ENTITLEMENT_ID,
  type PurchasesPackage,
} from '../lib/purchases';

// Module-level cache — shared across all hook instances within a session.
// Set to null to force a fresh check on next call.
let cachedIsPremium: boolean | null = null;

async function resolveIsPremium(): Promise<boolean> {
  const dev = await AsyncStorage.getItem('selah:devPremium');
  if (dev === 'true') return true;

  if (cachedIsPremium !== null) return cachedIsPremium;

  const stored = await AsyncStorage.getItem('selah:premiumVerified');
  if (stored !== null) {
    cachedIsPremium = stored === 'true';
    return cachedIsPremium;
  }

  const premium = await isPremiumCustomer();
  cachedIsPremium = premium;
  await AsyncStorage.setItem('selah:premiumVerified', premium ? 'true' : 'false');
  return premium;
}

async function persistPremium(value: boolean): Promise<void> {
  cachedIsPremium = value;
  await AsyncStorage.setItem('selah:premiumVerified', value ? 'true' : 'false');
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[LAUNCH] premium status loading');
    resolveIsPremium()
      .then(result => {
        setIsPremium(result);
        console.log('[LAUNCH] premium status loaded:', result);
      })
      .catch(e => {
        console.error('[LAUNCH] premium status load failed:', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function purchase(pkg: PurchasesPackage): Promise<{ success: boolean; cancelled: boolean }> {
    try {
      await doPurchasePackage(pkg);
      await persistPremium(true);
      setIsPremium(true);
      return { success: true, cancelled: false };
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean };
      return { success: false, cancelled: err?.userCancelled === true };
    }
  }

  async function restore(): Promise<boolean> {
    try {
      const info = await doRestorePurchases();
      const premium = !!(info?.entitlements?.active?.[ENTITLEMENT_ID]);
      await persistPremium(premium);
      setIsPremium(premium);
      return premium;
    } catch {
      return false;
    }
  }

  async function refresh(): Promise<void> {
    cachedIsPremium = null;
    const result = await resolveIsPremium();
    setIsPremium(result);
  }

  async function setDevPremium(value: boolean): Promise<void> {
    if (value) {
      await AsyncStorage.setItem('selah:devPremium', 'true');
    } else {
      await AsyncStorage.removeItem('selah:devPremium');
    }
    cachedIsPremium = null;
    const result = await resolveIsPremium();
    setIsPremium(result);
  }

  return { isPremium, loading, purchase, restore, refresh, setDevPremium };
}
