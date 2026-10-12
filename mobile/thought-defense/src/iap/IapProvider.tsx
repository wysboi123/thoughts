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
  passDaysRemaining: number | null;
  purchase: (productId: string) => Promise<{ ok: boolean; reason?: string; message?: string }>;
  restore: () => Promise<{ summary: string }>;
  resetStub: () => Promise<void>;
  consumePendingClarity: () => Promise<number>;
  describeEntitlements: () => string;
};

const IapContext = createContext<IapContextValue | null>(null);

const empty: Entitlements = {
  clarityPassActive: false,
  ownedCosmetics: [],
  stubPurchases: [],
  stubPurchaseLog: [],
  passExpiresAt: null,
  pendingClarity: 0,
};

export function IapProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [entitlements, setEntitlements] = useState<Entitlements>(empty);
  const [passDays, setPassDays] = useState<number | null>(null);

  const syncMeta = useCallback((e: Entitlements) => {
    setEntitlements(e);
    setPassDays(iapService.passDaysRemaining());
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const e = await iapService.init();
      if (alive) {
        syncMeta(e);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [syncMeta]);

  const purchase = useCallback(
    async (productId: string) => {
      const result = await iapService.purchase(productId);
      if (result.ok) {
        syncMeta(result.entitlements);
        return { ok: true, message: result.message };
      }
      return { ok: false, reason: result.reason };
    },
    [syncMeta],
  );

  const restore = useCallback(async () => {
    const { entitlements: e, summary } = await iapService.restore();
    syncMeta(e);
    return { summary };
  }, [syncMeta]);

  const resetStub = useCallback(async () => {
    const e = await iapService.resetStub();
    syncMeta(e);
  }, [syncMeta]);

  const consumePendingClarity = useCallback(async () => {
    const amount = await iapService.consumePendingClarity();
    syncMeta(iapService.getEntitlements());
    return amount;
  }, [syncMeta]);

  const describeEntitlements = useCallback(() => iapService.describeEntitlements(), []);

  const value = useMemo(
    () => ({
      ready,
      stubMode: iapService.stubMode,
      entitlements,
      products: PRODUCTS,
      passDaysRemaining: passDays,
      purchase,
      restore,
      resetStub,
      consumePendingClarity,
      describeEntitlements,
    }),
    [
      ready,
      entitlements,
      passDays,
      purchase,
      restore,
      resetStub,
      consumePendingClarity,
      describeEntitlements,
    ],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}

export function useIap() {
  const ctx = useContext(IapContext);
  if (!ctx) throw new Error('useIap must be used within IapProvider');
  return ctx;
}
