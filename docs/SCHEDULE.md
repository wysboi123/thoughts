# Overnight + hourly schedule — **CANCELLED**

**Femmy order (2026-10-17 ~23:17 UTC): cancel schedule.**

All overnight / hourly / resume / stop timers are **off**. Do **not** re-arm:

- `thought-defense-mobile-hourly`
- `overnight-daily-resume`
- `overnight-stop-5am-utc`
- legacy `thought-defense-hourly` (Roblox)

## If a timer still fires

1. **Idle** — no code, no polish, no email digest required beyond a one-line wake note that schedule is cancelled
2. **Unsubscribe** every timer via `cursor-subscriptions` `list_subscriptions` → `unsubscribe`
3. End turn

## Historical (retired)

| Was | Job |
| --- | --- |
| `thought-defense-mobile-hourly` | cron `15 * * * *` — 30-min mobile batches |
| `overnight-stop-5am-utc` | once → 05:00 — hard stop |
| `overnight-daily-resume` | cron `0 23 * * *` — night resume |

Night envelope was 23:00→05:00 UTC on `mobile/thought-defense` (PR #4). That cadence is **stopped** until Femmy explicitly re-arms.
