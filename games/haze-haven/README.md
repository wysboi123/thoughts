# Haze Haven

Chill float hangout. Soft dusk energy, loft, sit spots, emote bar, proximity glow. No combat.

## Play in Studio

```bash
cd games/haze-haven
rojo build -o HazeHaven.rbxl
rojo serve
```

1. Open `HazeHaven.rbxl` in Roblox Studio  
2. Rojo plugin → **Connect**  
3. Press **Play**

## Loop (v0.2)

- Spawn on the lounge pad → walk or float up the ramp to the **loft**
- Touch **float pads** (cyan) for soft boosts
- Collect **vibe orbs** (magenta) — count on HUD + nameplate
- Sit on cushions or press **2 / Sit**
- Emotes: **1 Wave · 2 Sit · 3 Float** (bar at bottom)
- Stand near a friend → soft purple proximity glow

## Layout

| Path | Role |
| --- | --- |
| `src/shared/` | Config, Remotes, Emotes |
| `src/server/` | WorldBuilder, Orb/Float/Emote/Nameplate services |
| `src/client/` | Hud, EmoteWheel, ProximityGlow, FloatFx |
