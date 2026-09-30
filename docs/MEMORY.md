# Agent memory — Thought Defense mobile (local mirror)

Adapter MCP preferred when authenticated. This file is the durable fallback.

## Decisions

- **2026-09-30 PIVOT:** Primary product is **Thought Defense mobile** (Expo iOS+Android), not Roblox.
- Keep soft mental-metaphor identity (ToS-safe, hopeful, no medical claims).
- Sensible monetization: Clarity Pass subscription + cosmetic microtransactions + optional Clarity boost; core loop free.
- Roblox chill line + Roblox TD under `games/` → **legacy / paused** (`docs/LEGACY_ROBLOX.md`).
- Upgrade UI drafts A/B/C vote for Roblox → **superseded** by mobile pivot.
- **Cadence:** ~30 min / hour; night 23:00–05:00 UTC; email `ngkdevid@gmail.com`.

## State

- Version: **mobile 1.0.0-slice** (5-wave playable loop + shop + stub IAP)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: open/update for mobile pivot (ManagePullRequest when available)
- Blocked on Femmy: Apple Developer + Play Console · confirm bundle ids · create IAP product ids · EAS projectId · legal review of Privacy/Terms
- Next: wire native IAP (RevenueCat or react-native-iap) · store screenshots · EAS preview build
