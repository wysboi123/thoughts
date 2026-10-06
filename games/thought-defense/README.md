# Thought Defense (v0.2.1)

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
3. Soft welcome + soft goals appear — plant, clear, survive, upgrade
4. Pick Affirmation / Gratitude / Humor → click empty **pads** to plant
5. Press **Begin wave 1** when ready
6. Click a planted pad to **upgrade** (L1–L3) · **Sell** mode refunds 50% Clarity
7. Between waves: Start next wave early, or wait for auto-start
8. After win/lose: **Try again** restarts the run

## Workspace layout (Rojo ↔ Studio)

| Studio path | Role |
| --- | --- |
| `Workspace.ThoughtWorld.Path` | Path segments + waypoints |
| `Workspace.ThoughtWorld.Pads` | Build pads (click to place / upgrade) |
| `Workspace.ThoughtWorld.Towers` | Planted positive thoughts |
| `Workspace.ThoughtWorld.Enemies` | Active negative thoughts |
| `Workspace.ThoughtWorld.Decor` | Floor, clouds, Peace Core, spawn |

## Loop

| Resource | Meaning |
| --- | --- |
| **Calm** | Lives — leaks drain Calm |
| **Clarity** | Currency — clear thoughts / spend on plant & upgrade |

## Design defaults (open for Femmy)

See `docs/DESIGN_CONSULT.md` — **Upgrade UI mockup vote A/B/C** still open. Research nudge: lean **B**.
