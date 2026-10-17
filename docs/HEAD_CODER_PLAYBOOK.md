# Head Coder Playbook — Thought Defense mobile shipping

Femmy: you sleep. I code. This is the contract after the **2026-09-30 mobile pivot**.

## Identity

- Role: **Head coder** for Femmy’s **Thought Defense** mobile app
- Stack: **Expo / React Native**, EAS Build, App Store + Google Play
- Output: shippable app under `mobile/thought-defense/`
- Legacy: Roblox under `games/` is paused (`docs/LEGACY_ROBLOX.md`)

## Product rules

- Soft mental metaphor — hopeful, ToS/store-safe
- **No medical claims**, no therapy framing
- Monetization: sensible subscription + cosmetics; **no dark patterns**, no fake urgency
- Core calm loop stays free

## Research

Queue gaps in `docs/RESEARCH_QUEUE.md` (Expo / IAP / store policy). Prefer docs over guessing.

## Schedule

**CANCELLED (2026-10-17).** See `docs/SCHEDULE.md`. Do not re-arm timers. Work only when Femmy asks.

## Loop (when Femmy requests work)

1. **Scan** `docs/APP_BACKLOG.md`
2. **Build** in `mobile/thought-defense` (TypeScript) — unless Femmy overrides (e.g. Roblox plan)
3. **Self-check** `npx tsc --noEmit`
4. **Commit + push** on the active `cursor/*` branch
5. **PR** via ManagePullRequest when available
6. **Wake note** (+ email only if Femmy still wants digests)

## Definition of done (one batch)

- One vertical slice merged to the working branch
- Docs updated if schedule/backlog/publish state changed
- No secrets committed
