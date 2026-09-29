# Thought Defense (v0.1)

Plant **positive thoughts** as towers. Clear **negative thoughts** before they reach your Peace Core.

Metaphor only — chill framing, no medical claims, Roblox Community Standards clean.

## Studio

```bash
cd games/thought-defense
rojo build -o ThoughtDefense.rbxl
rojo serve
```

1. Open the `.rbxl` in Roblox Studio → Rojo plugin → **Connect**
2. Press **Play**
3. Pick Affirmation / Gratitude / Humor in the tray
4. Click a soft green **pad** beside the path to plant
5. Survive 8 waves

## Workspace layout (Rojo ↔ Studio)

| Studio path | Role |
| --- | --- |
| `Workspace.ThoughtWorld.Path` | Path segments + waypoints |
| `Workspace.ThoughtWorld.Pads` | Build pads (click to place) |
| `Workspace.ThoughtWorld.Towers` | Planted positive thoughts |
| `Workspace.ThoughtWorld.Enemies` | Active negative thoughts |
| `Workspace.ThoughtWorld.Decor` | Floor, clouds, Peace Core, spawn |

Runtime scripts fill these folders on server start (`WorldBuilder`).

## Loop

| Resource | Meaning |
| --- | --- |
| **Calm** | Lives — leaks drain Calm |
| **Clarity** | Currency — earned by clearing thoughts, spent on towers |

| Negative thought | Feel |
| --- | --- |
| Doubt | Basic |
| Worry | Fast / fragile |
| Self-Critic | Slow tank |

| Positive thought | Role |
| --- | --- |
| Affirmation | Single-target DPS |
| Gratitude | Slow aura |
| Humor | Splash |

## Design defaults (open for Femmy)

See `docs/DESIGN_CONSULT.md` — tone, title, multiplayer, placement rules, win mode.
