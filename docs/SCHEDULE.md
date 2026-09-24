# Overnight schedule

Femmy order (2026-09-24): **Run until 5 AM. Stop and continue daily.**

## Window

| | |
| --- | --- |
| **Shift** | 23:00 → 05:00 **UTC** |
| **Stop** | 05:00 UTC — commit, push, wake note, no new features |
| **Resume** | Daily at 23:00 UTC (timer `overnight-daily-resume`) |

If Femmy meant a different timezone for “5 AM”, say so and we retarget the timers.

## Timers (cursor-subscriptions)

| Name | Type | Job |
| --- | --- | --- |
| `overnight-stop-5am-utc` | once / delay to 05:00 | Hard stop + wrap-up |
| `overnight-daily-resume` | cron `0 23 * * *` | Start next night shift |

At each resume: re-arm a fresh `overnight-stop-5am-utc` once-timer for that night.

## During the shift

1. Backlog → code → commit/push → PR update (continuous)
2. Queue Perplexity gaps in `docs/RESEARCH_QUEUE.md`
3. Append `docs/WAKE_NOTES.md` at stop (and after each major slice)

## Outside the window

Do not start new game features. Answer Femmy if pinged; otherwise wait for daily resume.
