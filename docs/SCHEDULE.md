# Overnight schedule

Femmy order (2026-09-24): **Run until 5 AM. Stop and continue daily.**

## Window

| | |
| --- | --- |
| **Shift** | 23:00 → 05:00 **UTC** |
| **Stop** | 05:00 UTC — commit, push, wake note, **one** digest email, no new features |
| **Resume** | Daily at 23:00 UTC (timer `overnight-daily-resume`) |

If Femmy meant a different timezone for “5 AM”, say so and we retarget the timers.

## Email (Femmy 2026-09-27)

**No mid-shift emails.** Do not send Gmail (or other digests) after each commit/push/PR update.

At **05:00 stop only**, send **one** email to `ngkdevid@gmail.com` with:
- night number / date
- full commit list for the shift (`git log` since 23:00 UTC)
- PR link
- what’s blocked / next night

Mid-shift: batch work quietly; update the PR at most at checkpoints/stop, not after every commit.

## Timers (cursor-subscriptions)

| Name | Type | Job |
| --- | --- | --- |
| `overnight-stop-5am-utc` | once / delay to 05:00 | Hard stop + wrap-up + **one digest email** |
| `overnight-daily-resume` | cron `0 23 * * *` | Start next night shift |

At each resume: re-arm a fresh `overnight-stop-5am-utc` once-timer for that night.

## During the shift

1. Backlog → code → **batch** commit/push (not after every tiny edit)
2. Queue Perplexity gaps in `docs/RESEARCH_QUEUE.md`
3. Append `docs/WAKE_NOTES.md` at stop (and sparingly at major checkpoints)
4. **One** digest email at stop only

## Outside the window

Do not start new game features. Answer Femmy if pinged; otherwise wait for daily resume.
