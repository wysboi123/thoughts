# Overnight + hourly schedule (mobile pivot)

Femmy order (2026-09-30): **Pivot to mobile app** with sensible microtransactions + basic subscription. iOS + Android publish path.

Prior order still applies for cadence: night envelope 23:00→05:00 UTC. **Email policy (2026-09-27):** no mid-shift emails; **one** digest at 05:00 stop only to `ngkdevid@gmail.com`.

## Hourly batch mode (active)

| | |
| --- | --- |
| **Work** | ~30 minutes shipping on `mobile/thought-defense` |
| **Rest** | ~30 minutes idle (timer wakes next batch) |
| **Focus** | Playable loop · store assets · IAP testing · EAS · listing copy |
| **Consult** | Ask Femmy only when blocked (bundle ids, store accounts, legal) |
| **Email** | **One** digest to `ngkdevid@gmail.com` at **05:00 stop only** (no mid-shift / per-batch mail) |
| **Limits** | If approaching Cursor usage limits: commit+push, lengthen rest |

### Timers (cursor-subscriptions) — retargeted

| Name | Type | Job |
| --- | --- | --- |
| `thought-defense-mobile-hourly` | cron `15 * * * *` | Start next 30-min **mobile** batch (`mobile/thought-defense`) |
| `overnight-stop-5am-utc` | once → 05:00 | Hard stop + **one** digest email |
| `overnight-daily-resume` | cron `0 23 * * *` | Night envelope resume |

**Retire / do not re-arm:** `thought-defense-hourly` — legacy Roblox payload (`games/thought-defense`, Upgrade chrome). If it still fires, **ignore Roblox instructions** and run the mobile checklist below; then unsubscribe it and ensure `thought-defense-mobile-hourly` is the only hourly.

**Correct hourly prompt must say:** app `mobile/thought-defense` · Draft C locked · no Roblox TD.

## Night envelope

| | |
| --- | --- |
| **Shift** | 23:00 → 05:00 **UTC** |
| **Stop** | 05:00 UTC — commit, push, wake note, **one** digest email, no new features |
| **Resume** | Daily at 23:00 UTC (timer `overnight-daily-resume`) |

If Femmy meant a different timezone for “5 AM”, say so and we retarget the timers.

## Email (Femmy 2026-09-27)

**No mid-shift emails.** Do not send Gmail after each commit/push/PR update or each hourly batch.

At **05:00 stop only**, send **one** email to `ngkdevid@gmail.com` with:
- night number / date
- full commit list for the shift (`git log` since 23:00 UTC)
- PR link
- what’s blocked / next night

Mid-shift: batch work quietly; update the PR at most at checkpoints/stop, not after every commit.

## Batch checklist

1. Read `docs/APP_BACKLOG.md` + `docs/DESIGN_CONSULT.md`
2. Ship one vertical slice in Expo app (code → typecheck → commit → push → PR)
3. Append wake note
4. Remember decisions in Adapter (when auth ok) / `docs/MEMORY.md`
5. Confirm timers; **end turn** (email only at 05:00 stop)

## Out of scope this pivot

- Roblox Studio / Rojo hourly TD (paused)
- Overnight Roblox chill USP polish (paused — see `docs/LEGACY_ROBLOX.md`)
- Upgrade chrome mockup A/B/C Luau (superseded)
