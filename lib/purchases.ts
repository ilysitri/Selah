export type PurchasesPackage = any

export const ENTITLEMENT_ID = 'selah_plus'

export const initPurchases = async (): Promise<void> => {
  // RevenueCat disabled until App Store release
  // Replace PLACEHOLDER keys and remove this guard before going live
  return
}

export const getOfferings = async (): Promise<any> => null

export const doPurchasePackage = async (_pkg: PurchasesPackage) => null

export const doRestorePurchases = async (): Promise<any> => null

export const isPremiumCustomer = async (): Promise<boolean> => false
