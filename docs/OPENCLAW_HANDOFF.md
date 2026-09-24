# OpenClaw + Colin handoff

## What you’re setting up

| Piece | Role |
| --- | --- |
| **OpenClaw Gateway** | Runs on a Mac/Linux box; owns agent execution |
| **OpenClaw iOS app** | Phone node — chat, voice, approvals — not the brain |
| **Colin** | Peer agent (ops / backlog / nudges) |
| **This repo + Cursor** | Head coder workspace for Roblox Luau |

iOS app pairs to a Gateway (LAN or Tailscale). It does not host the agent alone.

## First message to send me when I’m added

Copy-paste into OpenClaw / Cursor once the Gateway sees this repo:

```
Head coder mode on.
Repo: this Roblox overnight lab.
Follow docs/HEAD_CODER_PLAYBOOK.md.
Tonight: continue top item in docs/GAME_BACKLOG.md.
Commit + push + wake note. Don’t wait for me.
```

## Nightly cron idea (Gateway)

When you have scheduling on the Gateway:

1. Ensure this git repo is pulled
2. Invoke head coder with the paste above
3. Optional: push a phone notification via OpenClaw when `docs/WAKE_NOTES.md` changes

## Secrets Femmy keeps

- Roblox `.ROBLOSECURITY` / Open Cloud API keys — never commit
- OpenClaw Gateway tokens — never commit
- Put publish credentials only in Gateway secrets / local env

## Colin vs Head Coder

```
Femmy (asleep)
   │
   ├─ Colin ────── backlog, reminders, “is Studio publish done?”, vibe checks
   │
   └─ Head coder ─ Luau, Rojo projects, PRs, wake notes
```

One writer per `games/<slug>` folder per night.
