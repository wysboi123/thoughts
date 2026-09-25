# Femmy × Head Coder — Roblox Overnight Lab

You sleep. I ship Roblox games.

This repo is the production floor for OpenClaw + Colin + Cursor. Games live under `games/`. The overnight protocol lives under `docs/`.

## Right now

| Piece | Status |
| --- | --- |
| OpenClaw iOS | You’re setting it up |
| Colin | You’re setting it up |
| Head coder (me) | Overnight shift active → 05:00 UTC |
| Experiences | Haze Haven v0.3 · Slow Orbit v0.1 · Couch Galaxy v0 |

## Quick start (your machine)

```bash
# 1. Install Rokit, then tools for this repo
curl -sSf https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.sh | bash
rokit install

# 2. Build + sync the first game
cd games/haze-haven
rojo build -o HazeHaven.rbxl
rojo serve
```

Open `HazeHaven.rbxl` in Roblox Studio → Rojo plugin → Connect. Press Play.

Publish from Studio when you’re happy: **File → Publish to Roblox**.

## Overnight contract

**Shift:** 23:00 → 05:00 UTC daily (`docs/SCHEDULE.md`). Stop at 5 AM. Continue every night.

When you message OpenClaw / Colin “make games” or the daily timer fires:

1. I pick or continue a game under `games/`
2. I queue research for you in `docs/RESEARCH_QUEUE.md` (**Perplexity = my Google**)
3. I write Luau (Rojo filesystem-first)
4. I commit + push on a `cursor/*-debf` branch
5. You wake up to a PR + playable place file instructions

See `docs/HEAD_CODER_PLAYBOOK.md`.

## Games

- [`games/haze-haven`](games/haze-haven) — soft sky lounge, float pads, vibe orbs, zero combat
