# Agent memory — Thought Defense mobile (local mirror)

Adapter MCP preferred when authenticated. This file is the durable fallback.

## Decisions

- **2026-09-30 PIVOT:** Primary product is **Thought Defense mobile** (Expo iOS+Android).
- **2026-09-30 UX lock:** Upgrade UI = **Draft C (Tray dual-mode)**. A/B discarded. No more “waiting on vote.”
- Soft mental-metaphor; no medical claims; sensible IAP (Clarity Pass + cosmetics + optional boost).
- Roblox under `games/` → legacy/paused.
- Play: **top-down plan view** + **walking enemies** (Reanimated path tweens).
- Soft goals journal screen + wave-result modal.

## State

- Version: **mobile 1.2.6** (win celebration; builds on 1.2.5 SoftActionToast)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/4
- Tip: `68369ea`
- Hourly timer: **`thought-defense-mobile-hourly`** (retire mistargeted `thought-defense-hourly` Roblox payload)
- Night envelope: **STOPPED** after 05:00 UTC 2026-10-01 · resume **23:00 UTC** via `overnight-daily-resume`
- Stop timer: **`overnight-stop-5am-utc`** — do not re-arm until next night resume
- Blocked on Femmy: Apple/Play accounts · bundle ids · IAP products · EAS projectId · legal URLs · Clarity Pass price confirm (default **$2.99**)
- Next (23:00): native IAP · store screenshots capture · EAS preview · or Femmy Clarity Pass price reply
