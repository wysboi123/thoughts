import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { iapService, type Entitlements } from './iapService';
import { PRODUCTS, type StoreProduct } from './products';

type IapContextValue = {
  ready: boolean;
  stubMode: boolean;
  entitlements: Entitlements;
  products: StoreProduct[];
  purchase: (productId: string) => Promise<{ ok: boolean; reason?: string }>;
  restore: () => Promise<void>;
  resetStub: () => Promise<void>;
  consumePendingClarity: () => Promise<number>;
};

const IapContext = createContext<IapContextValue | null>(null);

const empty: Entitlements = {
  clarityPassActive: false,
  ownedCosmetics: [],
  stubPurchases: [],
  passExpiresAt: null,
  pendingClarity: 0,
};

export function IapProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [entitlements, setEntitlements] = useState<Entitlements>(empty);

  useEffect(() => {
    let alive = true;
    (async () => {
      const e = await iapService.init();
      if (alive) {
        setEntitlements(e);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const purchase = useCallback(async (productId: string) => {
    const result = await iapService.purchase(productId);
    if (result.ok) {
      setEntitlements(result.entitlements);
      return { ok: true };
    }
    return { ok: false, reason: result.reason };
  }, []);

  const restore = useCallback(async () => {
    const e = await iapService.restore();
    setEntitlements(e);
  }, []);

  const resetStub = useCallback(async () => {
    const e = await iapService.resetStub();
    setEntitlements(e);
  }, []);

  const consumePendingClarity = useCallback(async () => {
    const amount = await iapService.consumePendingClarity();
    setEntitlements(iapService.getEntitlements());
    return amount;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      stubMode: iapService.stubMode,
      entitlements,
      products: PRODUCTS,
      purchase,
      restore,
      resetStub,
      consumePendingClarity,
    }),
    [ready, entitlements, purchase, restore, resetStub, consumePendingClarity],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}

export function useIap() {
  const ctx = useContext(IapContext);
  if (!ctx) throw new Error('useIap must be used within IapProvider');
  return ctx;
}
