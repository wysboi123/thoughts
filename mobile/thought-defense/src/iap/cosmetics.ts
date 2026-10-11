import type { Entitlements } from './iapService';

/**
 * Visual looks only — never change damage / range / Clarity costs.
 * Clarity Pass includes Dawn & Lantern themes (product blurb); packs own them permanently.
 */
export type ActiveLooks = {
  dawn: boolean;
  lantern: boolean;
};

export function activeLooksFromEntitlements(e: Entitlements): ActiveLooks {
  const packs = e.ownedCosmetics;
  const pass = e.clarityPassActive;
  return {
    dawn: pass || packs.includes('cosmetic_dawn'),
    lantern: pass || packs.includes('cosmetic_lantern'),
  };
}

/** Soft lantern rim / fill accents per planted thought — cosmetics only. */
export const LANTERN_RIM: Record<string, string> = {
  Affirmation: '#E8D48A',
  Gratitude: '#F0C878',
  Humor: '#F2B090',
};

export const LANTERN_GLOW: Record<string, string> = {
  Affirmation: 'rgba(232, 212, 138, 0.45)',
  Gratitude: 'rgba(240, 200, 120, 0.42)',
  Humor: 'rgba(242, 176, 144, 0.4)',
};
