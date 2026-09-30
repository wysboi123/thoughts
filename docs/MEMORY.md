# Agent memory — Thought Defense (local mirror)

Adapter MCP preferred when authenticated. This file is the durable fallback.

## Decisions

- **2026-09-29:** Primary game is Thought Defense (enemies = negative thoughts, towers = positive thoughts).
- **Cadence:** ~30 min work every hour; respect usage limits; email Femmy progress each batch.
- **Consult:** Ask Femmy on design choices periodically (`docs/DESIGN_CONSULT.md`).
- **Defaults until overridden:** soft pastel tone, pad-only placement, 8-wave campaign, solo, title "Thought Defense".
- **2026-09-30 v0.2:** Manual prep Begin button; pad click upgrades to L3; Sell mode 50% refund; intermission auto-start with early Start.
- **2026-09-30:** Femmy OK with click-to-upgrade via **UI button**. Mockups A/B/C shipped; **Luau upgrade UI blocked** until she votes.

## State

- **2026-09-30 05:00 UTC — OVERNIGHT STOP** (Thought Defense night). No new features at wrap.
- Version: **0.2** (still 0.2 until Upgrade UI Luau lands after vote)
- Path: `games/thought-defense`
- Branch: `cursor/roblox-hourly-batch-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/2
- Blocked on: **Mockup vote A/B/C** (Upgrade UI) — last checked overnight stop 05:00 UTC, no reply
- Open consult (blocking): Mockup vote — A Selection panel / B Context bar / C Tray dual-mode
- Specs: `games/thought-defense/docs/UI_MOCKUPS.md`
- Gallery: `games/thought-defense/docs/mockups/index.html`
- Also open (not blocking Luau): title/tone/placement/mode/MP/difficulty; audio ids (Q-004)
- Overnight polish while waiting: flavor billboards · path rails · Peace Core halo · wave toast/hover · Calm leak cue · plant pop · pad ring breath
- Next: implement Upgrade UI only after Femmy A/B/C; hourly timer may continue daytime if she wants
