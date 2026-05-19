import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPremiumCustomer, doPurchasePackage, doRestorePurchases } from '../lib/purchases';
import type { PurchasesPackage } from '../lib/purchases';

let cachedIsPremium: boolean | null = null;

async function resolveIsPremium(): Promise<boolean> {
  if (cachedIsPremium !== null) return cachedIsPremium;
  const result = await isPremiumCustomer();
  cachedIsPremium = result;
  return result;
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState<boolean>(cachedIsPremium ?? false);
  const [loading, setLoading] = useState<boolean>(cachedIsPremium === null);

  useEffect(() => {
    if (cachedIsPremium !== null) return;
    resolveIsPremium()
      .then(result => { setIsPremium(result); })
      .catch(() => {})
      .finally(() => { setLoading(false); });
  }, []);

  async function purchase(pkg: PurchasesPackage): Promise<{ success: boolean; cancelled: boolean }> {
    const result = await doPurchasePackage(pkg);
    if (result.success) {
      cachedIsPremium = true;
      setIsPremium(true);
    }
    return result;
  }

  async function restore(): Promise<boolean> {
    const ok = await doRestorePurchases();
    if (ok) {
      cachedIsPremium = true;
      setIsPremium(true);
    }
    return ok;
  }

  async function refresh(): Promise<void> {
    cachedIsPremium = null;
    setLoading(true);
    try {
      const result = await resolveIsPremium();
      setIsPremium(result);
    } catch {}
    setLoading(false);
  }

  async function setDevPremium(value: boolean): Promise<void> {
    if (value) {
      await AsyncStorage.setItem('selah:premiumVerified', 'true');
    } else {
      await AsyncStorage.removeItem('selah:premiumVerified');
    }
    cachedIsPremium = value;
    setIsPremium(value);
  }

  return { isPremium, loading, purchase, restore, refresh, setDevPremium };
}
