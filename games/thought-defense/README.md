# Thought Defense (v0.2)

Plant **positive thoughts** as towers. Clear **negative thoughts** before they reach your Peace Core.

Metaphor only — chill framing, no medical claims, Roblox Community Standards clean.

## Studio (first Play)

```bash
cd games/thought-defense
rojo build -o ThoughtDefense.rbxl
rojo serve
```

1. Open `ThoughtDefense.rbxl` in Roblox Studio  
2. Rojo plugin → **Connect** (same project / port as `rojo serve`)  
3. Press **Play** (client + server)  
4. Tray: pick **Affirmation / Gratitude / Humor** → click an empty **pad** to plant  
5. Press **Begin wave 1** when your pads look ready (prep is manual)  
6. Occupied pad click → **upgrade** (up to L3) · tray **Sell** → 50% Clarity refund  
7. Between waves: **Start** early, or wait for auto-start  

**Still waiting on Femmy:** Upgrade **button** UX mockup vote **A / B / C** — see `docs/DESIGN_CONSULT.md` and `docs/mockups/`. Pad-click upgrade stays until that lands.

**Recent polish (while waiting):** wave toasts show what’s coming + intermission countdown; pads get a soft hover glow (SelectionBox).

## Workspace layout (Rojo ↔ Studio)

| Studio path | Role |
| --- | --- |
| `Workspace.ThoughtWorld.Path` | Path segments + soft rails + waypoints |
| `Workspace.ThoughtWorld.Pads` | Build pads (click to place / upgrade) |
| `Workspace.ThoughtWorld.Towers` | Planted positive thoughts |
| `Workspace.ThoughtWorld.Enemies` | Active negative thoughts (+ flavor billboards) |
| `Workspace.ThoughtWorld.Decor` | Floor, clouds, Peace Core + halo, spawn |

## Loop

| Resource | Meaning |
| --- | --- |
| **Calm** | Lives — leaks drain Calm |
| **Clarity** | Currency — clear thoughts / spend on plant & upgrade |

| Negative thought | Feel |
| --- | --- |
| Doubt | Basic — soft “what if…?” lines |
| Worry | Fast / fragile |
| Self-Critic | Slow tank |

| Positive thought | Role |
| --- | --- |
| Affirmation | Single-target DPS |
| Gratitude | Slow aura |
| Humor | Splash |

## Design defaults (open for Femmy)

See `docs/DESIGN_CONSULT.md` — **only open ask this batch:** mockup vote A/B/C. Title/tone/etc. still welcome anytime.
