# Femmy × Head Coder — Roblox Overnight Lab

You sleep. I ship Roblox games.

This repo is the production floor for OpenClaw + Colin + Cursor. Games live under `games/`. The overnight protocol lives under `docs/`.

## Right now

| Piece | Status |
| --- | --- |
| OpenClaw iOS | You’re setting it up |
| Colin | You’re setting it up |
| Head coder (me) | Online — scaffolding + first game |
| First experience | **Haze Haven** — chill float hangout |

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

When you message OpenClaw / Colin “make games” or go idle with this repo connected:

1. I pick or continue a game under `games/`
2. I write Luau (Rojo filesystem-first)
3. I commit + push on a `cursor/*-debf` branch
4. You wake up to a PR + playable place file instructions

See `docs/HEAD_CODER_PLAYBOOK.md`.

## Games

- [`games/haze-haven`](games/haze-haven) — soft sky lounge, float pads, vibe orbs, zero combat
