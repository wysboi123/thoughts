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

## Loop (v0.5)

- Spawn on the lounge pad → walk or float up the ramp to the **loft**
- Soft session goals (top-right): 3 vibes · sit · float — optional, no fail
- Touch **float pads** (cyan) for soft boosts
- Collect **vibe orbs** — HUD + nameplate + **tonight's vibes** board
- Sit on cushions, loft seats, or the **hammock**
- Emotes: **1 Wave · 2 Sit · 3 Float**
- Stand near a friend → soft purple proximity glow
- Lighting gently pulses dusk↔deeper night
- Audio: set `Config.Audio.*` rbxassetids when you have tracks (Perplexity Q-004)


## Layout

| Path | Role |
| --- | --- |
| `src/shared/` | Config, Remotes, Emotes |
| `src/server/` | WorldBuilder, Orb/Float/Emote/Nameplate services |
| `src/client/` | Hud, EmoteWheel, ProximityGlow, FloatFx |
