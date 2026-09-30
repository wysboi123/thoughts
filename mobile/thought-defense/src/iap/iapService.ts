import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PRODUCTS, type StoreProduct } from './products';

const STORAGE_KEY = 'td.iap.entitlements.v1';

export type Entitlements = {
  clarityPassActive: boolean;
  ownedCosmetics: string[];
  /** Stub mode records simulated purchases for local testing */
  stubPurchases: string[];
  passExpiresAt: string | null;
  /** Consumable Clarity waiting to apply on next play session */
  pendingClarity: number;
};

const DEFAULT_ENTITLEMENTS: Entitlements = {
  clarityPassActive: false,
  ownedCosmetics: [],
  stubPurchases: [],
  passExpiresAt: null,
  pendingClarity: 0,
};

export type PurchaseResult =
  | { ok: true; product: StoreProduct; entitlements: Entitlements }
  | { ok: false; reason: string };

/**
 * Client IAP abstraction.
 * - Expo Go / missing credentials → stub purchases (persisted locally)
 * - Dev / production builds: wire react-native-iap or RevenueCat behind the same API
 *   (see docs/EAS_BUILD.md). Do not ship stub-only to stores.
 */
export class IapService {
  private entitlements: Entitlements = { ...DEFAULT_ENTITLEMENTS };
  private ready = false;
  /** true until native IAP module + store credentials are configured */
  readonly stubMode = true;

  async init(): Promise<Entitlements> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.entitlements = { ...DEFAULT_ENTITLEMENTS, ...JSON.parse(raw) };
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

  getEntitlements(): Entitlements {
    return { ...this.entitlements, ownedCosmetics: [...this.entitlements.ownedCosmetics] };
  }

  getStoreProductId(product: StoreProduct): string {
    return Platform.OS === 'ios' ? product.iosProductId : product.androidProductId;
  }

  listProducts(): StoreProduct[] {
    return PRODUCTS;
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

  async purchase(productId: string): Promise<PurchaseResult> {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return { ok: false, reason: 'Unknown product' };

    // Native path placeholder — replace with RNIap.requestPurchase / Purchases.purchasePackage
    if (!this.stubMode) {
      return { ok: false, reason: 'Native IAP not configured yet' };
    }

    if (product.kind === 'subscription') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      this.entitlements.passExpiresAt = expires.toISOString();
      this.entitlements.clarityPassActive = true;
    } else if (product.kind === 'nonconsumable') {
      if (!this.entitlements.ownedCosmetics.includes(product.id)) {
        this.entitlements.ownedCosmetics.push(product.id);
      }
    } else if (product.kind === 'consumable' && product.clarityGrant) {
      this.entitlements.pendingClarity += product.clarityGrant;
    }
    if (!this.entitlements.stubPurchases.includes(product.id)) {
      this.entitlements.stubPurchases.push(product.id);
    }
    await this.persist();
    return { ok: true, product, entitlements: this.getEntitlements() };
  }

  async restore(): Promise<Entitlements> {
    // Stub: re-read local entitlements. Native: RNIap.getAvailablePurchases / Purchases.restorePurchases
    this.refreshPassExpiry();
    await this.persist();
    return this.getEntitlements();
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
      pendingClarity: 0,
    };
    await this.persist();
    return this.getEntitlements();
  }
}

export const iapService = new IapService();
