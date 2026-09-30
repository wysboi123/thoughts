/**
 * Store product catalog — StoreKit / Play Billing IDs.
 * Replace placeholder IDs in App Store Connect / Play Console before submit.
 *
 * Monetization principles (Femmy pivot):
 * - Core calm loop stays free — never paywalled abusively
 * - Clarity Pass = comfort (no between-run soft ads, themes, restore)
 * - Microtransactions = cosmetics + optional one-time Clarity boost (not required to progress)
 * - No fake urgency, no dark patterns, no medical claims
 */

export type ProductKind = 'subscription' | 'nonconsumable' | 'consumable';

export type StoreProduct = {
  /** Shared logical id used in app code */
  id: string;
  /** App Store product id */
  iosProductId: string;
  /** Google Play product id */
  androidProductId: string;
  kind: ProductKind;
  title: string;
  blurb: string;
  /** Display price hint until store prices resolve */
  priceHint: string;
  clarityGrant?: number;
};

export const PRODUCTS: StoreProduct[] = [
  {
    id: 'clarity_pass_monthly',
    iosProductId: 'com.femmy.thoughtdefense.clarity_pass.monthly',
    androidProductId: 'clarity_pass_monthly',
    kind: 'subscription',
    title: 'Clarity Pass',
    blurb:
      'Monthly comfort: hide soft between-run notes, unlock Dawn & Lantern themes, thank-you badge. Core play stays free.',
    priceHint: '$2.99 / month',
  },
  {
    id: 'cosmetic_dawn',
    iosProductId: 'com.femmy.thoughtdefense.cosmetic.dawn',
    androidProductId: 'cosmetic_dawn',
    kind: 'nonconsumable',
    title: 'Dawn Path pack',
    blurb: 'Warm sunrise path + Peace Core glow. Cosmetic only.',
    priceHint: '$1.99',
  },
  {
    id: 'cosmetic_lantern',
    iosProductId: 'com.femmy.thoughtdefense.cosmetic.lantern',
    androidProductId: 'cosmetic_lantern',
    kind: 'nonconsumable',
    title: 'Lantern Towers pack',
    blurb: 'Soft lantern skins for Affirmation, Gratitude, and Humor. Cosmetic only.',
    priceHint: '$1.99',
  },
  {
    id: 'clarity_boost_small',
    iosProductId: 'com.femmy.thoughtdefense.boost.clarity_small',
    androidProductId: 'clarity_boost_small',
    kind: 'consumable',
    title: 'Small Clarity boost',
    blurb: '+80 Clarity once — optional comfort, never required to clear waves.',
    priceHint: '$0.99',
    clarityGrant: 80,
  },
];

export const SUBSCRIPTION_GROUP = 'clarity_pass';
