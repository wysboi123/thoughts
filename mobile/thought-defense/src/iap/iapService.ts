import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PRODUCTS, type StoreProduct } from './products';

const STORAGE_KEY = 'td.iap.entitlements.v1';

export type StubPurchaseRecord = {
  productId: string;
  at: string;
  storeProductId: string;
};

export type Entitlements = {
  clarityPassActive: boolean;
  ownedCosmetics: string[];
  /** Stub mode records simulated purchases for local testing */
  stubPurchases: string[];
  /** Timestamped stub purchase log (hardening — audit / restore summary) */
  stubPurchaseLog: StubPurchaseRecord[];
  passExpiresAt: string | null;
  /** Consumable Clarity waiting to apply on next play session */
  pendingClarity: number;
};

const DEFAULT_ENTITLEMENTS: Entitlements = {
  clarityPassActive: false,
  ownedCosmetics: [],
  stubPurchases: [],
  stubPurchaseLog: [],
  passExpiresAt: null,
  pendingClarity: 0,
};

export type PurchaseResult =
  | { ok: true; product: StoreProduct; entitlements: Entitlements; message: string }
  | { ok: false; reason: string };

/**
 * Client IAP abstraction.
 * - Expo Go / missing credentials → stub purchases (persisted locally)
 * - Dev / production builds: wire react-native-iap or RevenueCat behind the same API
 *   (see docs/EAS_BUILD.md). Do not ship stub-only to stores.
 *
 * Femmy open ask (not A/B/C): prefer RevenueCat or react-native-iap for store builds?
 */
export class IapService {
  private entitlements: Entitlements = { ...DEFAULT_ENTITLEMENTS };
  private ready = false;
  private inFlight: string | null = null;
  private lastError: string | null = null;
  /** true until native IAP module + store credentials are configured */
  readonly stubMode = true;

  async init(): Promise<Entitlements> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Entitlements>;
        this.entitlements = {
          ...DEFAULT_ENTITLEMENTS,
          ...parsed,
          ownedCosmetics: Array.isArray(parsed.ownedCosmetics) ? parsed.ownedCosmetics : [],
          stubPurchases: Array.isArray(parsed.stubPurchases) ? parsed.stubPurchases : [],
          stubPurchaseLog: Array.isArray(parsed.stubPurchaseLog) ? parsed.stubPurchaseLog : [],
        };
      }
    } catch {
      // keep defaults
    }
    this.refreshPassExpiry();
    this.ready = true;
    return this.getEntitlements();
  }

  isReady() {
    return this.ready;
  }

  getInFlight() {
    return this.inFlight;
  }

  getLastError() {
    return this.lastError;
  }

  getEntitlements(): Entitlements {
    return {
      ...this.entitlements,
      ownedCosmetics: [...this.entitlements.ownedCosmetics],
      stubPurchases: [...this.entitlements.stubPurchases],
      stubPurchaseLog: this.entitlements.stubPurchaseLog.map((r) => ({ ...r })),
    };
  }

  getStoreProductId(product: StoreProduct): string {
    return Platform.OS === 'ios' ? product.iosProductId : product.androidProductId;
  }

  listProducts(): StoreProduct[] {
    return PRODUCTS;
  }

  /** Days left on Clarity Pass, or null if inactive / no expiry. */
  passDaysRemaining(): number | null {
    this.refreshPassExpiry();
    if (!this.entitlements.clarityPassActive || !this.entitlements.passExpiresAt) return null;
    const ms = new Date(this.entitlements.passExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  }

  /** Human summary for restore / settings feedback. */
  describeEntitlements(): string {
    this.refreshPassExpiry();
    const e = this.entitlements;
    const parts: string[] = [];
    if (e.clarityPassActive) {
      const days = this.passDaysRemaining();
      parts.push(
        days != null
          ? `Clarity Pass active (~${days} day${days === 1 ? '' : 's'} left)`
          : 'Clarity Pass active',
      );
    } else {
      parts.push('Clarity Pass off');
    }
    parts.push(
      e.ownedCosmetics.length
        ? `Looks: ${e.ownedCosmetics.length} pack${e.ownedCosmetics.length === 1 ? '' : 's'}`
        : 'No cosmetic packs yet',
    );
    if (e.pendingClarity > 0) {
      parts.push(`+${e.pendingClarity} Clarity waiting for next session`);
    }
    if (this.stubMode && e.stubPurchaseLog.length > 0) {
      parts.push(`${e.stubPurchaseLog.length} stub purchase${e.stubPurchaseLog.length === 1 ? '' : 's'} logged`);
    }
    return parts.join(' · ');
  }

  private async persist() {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.entitlements));
  }

  private refreshPassExpiry() {
    if (!this.entitlements.passExpiresAt) {
      this.entitlements.clarityPassActive = false;
      return;
    }
    this.entitlements.clarityPassActive =
      new Date(this.entitlements.passExpiresAt).getTime() > Date.now();
  }

  private recordStubPurchase(product: StoreProduct) {
    if (!this.entitlements.stubPurchases.includes(product.id)) {
      this.entitlements.stubPurchases.push(product.id);
    }
    this.entitlements.stubPurchaseLog.push({
      productId: product.id,
      at: new Date().toISOString(),
      storeProductId: this.getStoreProductId(product),
    });
    // Cap log so stub storage stays light
    if (this.entitlements.stubPurchaseLog.length > 40) {
      this.entitlements.stubPurchaseLog = this.entitlements.stubPurchaseLog.slice(-40);
    }
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    if (this.inFlight) {
      return { ok: false, reason: 'A purchase is already in progress — try again in a moment.' };
    }

    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      this.lastError = 'Unknown product';
      return { ok: false, reason: 'Unknown product' };
    }

    // Soft guard: already-owned cosmetics (non-consumable)
    if (
      product.kind === 'nonconsumable' &&
      this.entitlements.ownedCosmetics.includes(product.id)
    ) {
      return { ok: false, reason: 'You already own this look — no charge.' };
    }

    this.inFlight = productId;
    this.lastError = null;

    try {
      // Native path placeholder — replace with RNIap.requestPurchase / Purchases.purchasePackage
      if (!this.stubMode) {
        this.lastError = 'Native IAP not configured yet';
        return { ok: false, reason: 'Native IAP not configured yet' };
      }

      let message = 'Stub purchase saved on this device.';

      if (product.kind === 'subscription') {
        // Renew from current expiry if still active; otherwise from now
        const base =
          this.entitlements.passExpiresAt &&
          new Date(this.entitlements.passExpiresAt).getTime() > Date.now()
            ? new Date(this.entitlements.passExpiresAt)
            : new Date();
        base.setDate(base.getDate() + 30);
        this.entitlements.passExpiresAt = base.toISOString();
        this.entitlements.clarityPassActive = true;
        const days = this.passDaysRemaining();
        message =
          days != null
            ? `Clarity Pass stub active (~${days} days). Wire StoreKit / Play before submit.`
            : 'Clarity Pass stub active. Wire StoreKit / Play before submit.';
      } else if (product.kind === 'nonconsumable') {
        this.entitlements.ownedCosmetics.push(product.id);
        message = `${product.title} unlocked on this device (cosmetic only).`;
      } else if (product.kind === 'consumable' && product.clarityGrant) {
        this.entitlements.pendingClarity += product.clarityGrant;
        message = `+${product.clarityGrant} Clarity waiting — opens on next mindscape session.`;
      }

      this.recordStubPurchase(product);
      await this.persist();
      return { ok: true, product, entitlements: this.getEntitlements(), message };
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Purchase failed';
      this.lastError = reason;
      return { ok: false, reason };
    } finally {
      this.inFlight = null;
    }
  }

  async restore(): Promise<{ entitlements: Entitlements; summary: string }> {
    // Stub: re-read + refresh expiry. Native: RNIap.getAvailablePurchases / Purchases.restorePurchases
    this.refreshPassExpiry();
    await this.persist();
    const entitlements = this.getEntitlements();
    return {
      entitlements,
      summary: this.stubMode
        ? `Stub restore · ${this.describeEntitlements()}`
        : this.describeEntitlements(),
    };
  }

  async consumePendingClarity(): Promise<number> {
    const amount = this.entitlements.pendingClarity;
    if (amount <= 0) return 0;
    this.entitlements.pendingClarity = 0;
    await this.persist();
    return amount;
  }

  /** Dev helper — clear stub purchases */
  async resetStub(): Promise<Entitlements> {
    this.entitlements = {
      ...DEFAULT_ENTITLEMENTS,
      ownedCosmetics: [],
      stubPurchases: [],
      stubPurchaseLog: [],
      pendingClarity: 0,
    };
    this.lastError = null;
    await this.persist();
    return this.getEntitlements();
  }
}

export const iapService = new IapService();
