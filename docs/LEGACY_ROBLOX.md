# Legacy Roblox (paused)

**2026-09-30:** Femmy pivoted the overnight/hourly workflow to a **mobile** Thought Defense app.

## Status

- Existing `games/*` Roblox experiences (chill hangouts + Thought Defense) are **paused / legacy**.
- Do **not** implement Roblox Thought Defense Upgrade UI A/B/C.
- Do **not** re-arm Roblox-only hourly timers for legacy titles.
- Code remains in-repo for reference / possible future un-pause.
- **2026-10-12 Femmy override:** planning/scaffolding **new** experiences (`glowgrove`, `critter-claim`) is allowed via `docs/research/ROBLOX_TWO_GAME_ROLLOUT_2026-10-12.md` + `docs/CLAUDE_CODE_ROBLOX_PROMPT.md`. That override does **not** resume TD Upgrade UI or chill-hangout hourlies.

## What moved

| Was (Roblox) | Now (mobile) |
| --- | --- |
| `games/thought-defense` | `mobile/thought-defense` |
| Rojo + Studio publish | Expo + EAS + App Store / Play |
| Clarity as in-game currency only | Clarity currency + **Clarity Pass** subscription / cosmetics |
| `docs/GAME_BACKLOG.md` | `docs/APP_BACKLOG.md` |

Theme (soft mental metaphor, Peace Core, Affirmation / Gratitude / Humor) is **kept** on mobile.
