# Overnight + hourly schedule (mobile pivot)

Femmy order (2026-09-30): **Pivot to mobile app** with sensible microtransactions + basic subscription. iOS + Android publish path.

Prior order still applies for cadence: **~30 minutes every hour**, night envelope 23:00→05:00 UTC, email progress to `ngkdevid@gmail.com`.

## Hourly batch mode (active)

| | |
| --- | --- |
| **Work** | ~30 minutes shipping on `mobile/thought-defense` |
| **Rest** | ~30 minutes idle (timer wakes next batch) |
| **Focus** | Playable loop · store assets · IAP testing · EAS · listing copy |
| **Consult** | Ask Femmy only when blocked (bundle ids, store accounts, legal) |
| **Email** | Progress note to `ngkdevid@gmail.com` at end of each batch (and 05:00 stop) |
| **Limits** | If approaching Cursor usage limits: commit+push, lengthen rest |

### Timers (cursor-subscriptions) — retargeted

| Name | Type | Job |
| --- | --- | --- |
| `thought-defense-mobile-hourly` | cron `15 * * * *` | Start next 30-min mobile batch |
| `overnight-stop-5am-utc` | once → 05:00 | Hard stop + digest if inside night window |
| `overnight-daily-resume` | cron `0 23 * * *` | Night envelope resume |

**Retire:** `thought-defense-hourly` (Roblox TD / Upgrade UI vote loops). Do not re-arm Roblox-only timers.

## Night envelope

| | |
| --- | --- |
| **Shift** | 23:00 → 05:00 **UTC** |
| **Stop** | 05:00 UTC — commit, push, wake note, digest email |
| **Resume** | Daily 23:00 UTC |

## Batch checklist

1. Read `docs/APP_BACKLOG.md` + `docs/DESIGN_CONSULT.md`
2. Ship one vertical slice in Expo app (code → typecheck → commit → push → PR)
3. Append wake note
4. Remember decisions in Adapter (when auth ok) / `docs/MEMORY.md`
5. Email update
6. Confirm `thought-defense-mobile-hourly` timer; **end turn**

## Out of scope this pivot

- Roblox Studio / Rojo hourly TD (paused)
- Upgrade chrome mockup A/B/C Luau (superseded)
