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

See `docs/SCHEDULE.md`. Night window **23:00–05:00 UTC**. Hourly ~30 min batches. Timer: `thought-defense-mobile-hourly`.

## Loop (every batch)

1. **Scan** `docs/APP_BACKLOG.md`
2. **Build** in `mobile/thought-defense` (TypeScript)
3. **Self-check** `npx tsc --noEmit`
4. **Commit + push** on `cursor/*-5a0d`
5. **PR** via ManagePullRequest when available
6. **Wake note** + email `ngkdevid@gmail.com`

## Definition of done (one batch)

- One vertical slice merged to the working branch
- Docs updated if schedule/backlog/publish state changed
- No secrets committed
