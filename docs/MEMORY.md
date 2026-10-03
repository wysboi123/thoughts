# Agent memory — Thought Defense mobile (local mirror)

Adapter MCP preferred when authenticated. This file is the durable fallback.

## Decisions

- **2026-09-30 PIVOT:** Primary product is **Thought Defense mobile** (Expo iOS+Android).
- **2026-09-30 UX lock:** Upgrade UI = **Draft C (Tray dual-mode)**. A/B discarded. No more “waiting on vote.”
- Soft mental-metaphor; no medical claims; sensible IAP (Clarity Pass + cosmetics + optional boost).
- Roblox under `games/` → legacy/paused.
- Play: **top-down plan view** + **walking enemies** (Reanimated path tweens).
- Soft goals journal screen + wave-result modal.
- **2026-10-01 night:** Clarity Pass price still unanswered → keep **$2.99**; tonight’s consult = **RevenueCat vs react-native-iap** (not A/B/C).
- **2026-10-02 ~00:30:** Wave balance v1.2.9 — softer mid/late pacing + next-wave preview + Settings replay welcome.
- **2026-10-02 ~01:30:** Lose/retry soft copy v1.3.0 — Gentle rest badge · cool mist orbs · peak-aware lead · Try again gently.
- **2026-10-02 ~02:15:** Shop UX polish v1.3.1 — free-forever strip · Pass perks · look swatches · section accents · soft card enter · buy/restore haptics.
- **2026-10-02 ~03:15:** Home polish v1.3.2 — mindscape vignette · loop chips · staggered CTAs · Pass badge.
- **2026-10-02 ~04:15:** Settings + privacy polish v1.3.3 — comfort strip · section accents · privacy sections · haptics.
- **2026-10-02 ~23:00 night resume:** Cosmetic looks in play v1.3.4 — Dawn path + Lantern rims; Pass unlocks both themes (product blurb).
- **2026-10-03 ~01:15:** Home/settings look polish v1.3.6 — preview + Active looks mirror play entitlements.
- **2026-10-03 ~02:15:** Soft goals journal polish v1.3.7 — progress · stagger · accents · Dawn · comfort strip.

## State

- Version: **mobile 1.3.7** (soft goals journal polish)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/4
- Tip: `d1529aa` (v1.3.7)
- Hourly timer: **`thought-defense-mobile-hourly`**
- Night envelope: **ACTIVE** 23:00→05:00 UTC · stop armed `overnight-stop-5am-utc`
- Blocked on Femmy: Apple/Play accounts · bundle ids · IAP products · EAS projectId · legal URLs · Clarity Pass price confirm (default **$2.99**) · **RevenueCat vs RNIap**
- Next: native IAP once Femmy picks stack · store screenshots · EAS preview · or Femmy RC/RNIap / Pass price reply
