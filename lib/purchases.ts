import {
  initConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
} from 'react-native-iap';
import type { ProductSubscription } from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PurchasesPackage = {
  sku: string;
  product: {
    priceString: string;
  };
};

export const ENTITLEMENT_ID = 'selah_plus';

const SKU_ANNUAL = 'com.eviemaxinerose.selah.plus.annual';
const SKU_MONTHLY = 'com.eviemaxinerose.selah.plus.monthly';
const SKUS = [SKU_ANNUAL, SKU_MONTHLY];

type Offerings = {
  current: {
    annual: PurchasesPackage | null;
    monthly: PurchasesPackage | null;
  };
} | null;

export async function initPurchases(): Promise<void> {
  try {
    await initConnection();
  } catch (e) {
    console.error('[purchases] initConnection failed:', e);
  }
}

export async function getOfferings(): Promise<Offerings> {
  try {
    const result = await fetchProducts({ skus: SKUS, type: 'subs' });
    const subs = (result ?? []) as ProductSubscription[];
    let annual: PurchasesPackage | null = null;
    let monthly: PurchasesPackage | null = null;
    for (const sub of subs) {
      const priceString = sub.displayPrice;
      if (sub.id === SKU_ANNUAL) {
        annual = { sku: sub.id, product: { priceString } };
      } else if (sub.id === SKU_MONTHLY) {
        monthly = { sku: sub.id, product: { priceString } };
      }
    }
    return { current: { annual, monthly } };
  } catch (e) {
    console.error('[purchases] getOfferings failed:', e);
    return null;
  }
}

export async function doPurchasePackage(
  pkg: PurchasesPackage,
): Promise<{ success: boolean; cancelled: boolean }> {
  return new Promise(resolve => {
    const updateSub = purchaseUpdatedListener(async purchase => {
      if (purchase.productId !== pkg.sku) return;
      updateSub.remove();
      errorSub.remove();
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch {}
      try {
        await AsyncStorage.setItem('selah:premiumVerified', 'true');
      } catch {}
      resolve({ success: true, cancelled: false });
    });

    const errorSub = purchaseErrorListener(error => {
      updateSub.remove();
      errorSub.remove();
      resolve({ success: false, cancelled: error.code === ErrorCode.UserCancelled });
    });

    requestPurchase({ request: { apple: { sku: pkg.sku } }, type: 'subs' }).catch(error => {
      updateSub.remove();
      errorSub.remove();
      resolve({ success: false, cancelled: (error as any)?.code === ErrorCode.UserCancelled });
    });
  });
}

export async function doRestorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const has = purchases.some(p => SKUS.includes(p.productId));
    if (has) {
      await AsyncStorage.setItem('selah:premiumVerified', 'true');
    }
    return has;
  } catch (e) {
    console.error('[purchases] doRestorePurchases failed:', e);
    return false;
  }
}

export async function isPremiumCustomer(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem('selah:premiumVerified');
    return val === 'true';
  } catch {
    return false;
  }
}
