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

## State

- Version: **mobile 1.3.3** (settings + privacy polish; builds on 1.3.2 home)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/4
- Tip: `25dd665` (overnight stop wake note)
- Hourly timer: **`thought-defense-mobile-hourly`** (retire mistargeted `thought-defense-hourly` Roblox payload)
- Night envelope: **STOPPED** after 05:00 UTC 2026-10-02 · resume **23:00 UTC** via `overnight-daily-resume`
- Stop timer: **`overnight-stop-5am-utc`** — do not re-arm until next night resume
- Blocked on Femmy: Apple/Play accounts · bundle ids · IAP products · EAS projectId · legal URLs · Clarity Pass price confirm (default **$2.99**) · **RevenueCat vs RNIap**
- Next (23:00): native IAP once Femmy picks stack · store screenshots · EAS preview · or Femmy RC/RNIap / Pass price reply
