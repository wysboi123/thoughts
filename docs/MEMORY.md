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

## State

- Version: **mobile 1.2.8** (soft-goals expand + pause snapshot; builds on 1.2.7 IAP/welcome)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/4
- Tip: `0dd242e`
- Hourly timer: **`thought-defense-mobile-hourly`** (retire mistargeted `thought-defense-hourly` Roblox payload)
- Night envelope: **OPEN** 23:00→05:00 UTC 2026-10-01/02 · stop via `overnight-stop-5am-utc`
- Stop timer: **`overnight-stop-5am-utc`** — keep armed (~05:00 UTC)
- Blocked on Femmy: Apple/Play accounts · bundle ids · IAP products · EAS projectId · legal URLs · Clarity Pass price confirm (default **$2.99**) · **RevenueCat vs RNIap**
- Next: native IAP once Femmy picks stack · store screenshots · EAS preview
