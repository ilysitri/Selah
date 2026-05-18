export function usePremium() {
  return {
    isPremium: true,
    loading: false,
    purchase: async (_pkg: any): Promise<{ success: boolean; cancelled: boolean }> => ({ success: false, cancelled: false }),
    restore: async (): Promise<boolean> => false,
    refresh: async (): Promise<void> => {},
    setDevPremium: async (_value: boolean): Promise<void> => {},
  };
}
