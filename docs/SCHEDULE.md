# Overnight + hourly schedule

Femmy order (2026-09-29): **Batch work — ~30 minutes every hour.** Respect usage limits; slow down before limits. Periodically consult on design. Email progress updates.

Earlier order (2026-09-24): night window 23:00→05:00 UTC still applies as the outer envelope when overnight shipping.

## Hourly batch mode (active)

| | |
| --- | --- |
| **Work** | ~30 minutes of focused shipping |
| **Rest** | ~30 minutes idle (timer wakes next batch) |
| **Consult** | Ask Femmy on open design choices each batch (or when blocked) |
| **Email** | Progress note to `ngkdevid@gmail.com` at end of each batch (and at 05:00 stop) |
| **Limits** | If approaching Cursor usage limits: skip polish, commit+push, lengthen rest, shorter next batch |

### Timers (cursor-subscriptions)

| Name | Type | Job |
| --- | --- | --- |
| `thought-defense-hourly` | cron `15 * * * *` | Start next 30-min batch |
| `overnight-stop-5am-utc` | once → 05:00 | Hard stop + digest if inside night window |
| `overnight-daily-resume` | cron `0 23 * * *` | Night envelope resume |

## Night envelope (still honored)

| | |
| --- | --- |
| **Shift** | 23:00 → 05:00 **UTC** |
| **Stop** | 05:00 UTC — commit, push, wake note, digest email |
| **Resume** | Daily 23:00 UTC |

Outside 23:00–05:00: only run hourly batches if Femmy asked for daytime work; otherwise wait.

## Email

To: `ngkdevid@gmail.com`  
Each hourly batch: short progress (what shipped, design questions, next batch).  
05:00 stop: fuller digest (commits, PR, blockers).

## During a batch

1. Read `docs/DESIGN_CONSULT.md` + backlog  
2. Ship one vertical slice (code → commit → push → PR update)  
3. Append wake note  
4. Remember decisions in Adapter (when auth ok) / `docs/`  
5. Email update  
6. Arm / confirm hourly timer; **end turn**
