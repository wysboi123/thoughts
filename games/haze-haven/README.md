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

## Loop (v3.14)

- Spawn on the lounge pad → walk or float up the ramp to the **loft**
- Soft session goals (top-right): 3 vibes · sit · float · vibe sync — optional, no fail
- Touch **float pads** (cyan) for soft boosts
- Collect **vibe orbs** — HUD + nameplate + **tonight's vibes** board
- Sit on cushions, loft seats, or the **hammock** (warms when vibes sync)
- Emotes: **1 Wave · 2 Sit · 3 Float**
- Stand near a friend → soft purple glow + **vibe sync** toast + SoftCompany + WelcomeSign
- Lighting gently pulses dusk↔deeper night
- Audio: set `Config.Audio.*` rbxassetids when you have tracks (Perplexity Q-004)

**USP:** Vibe sync — tonight’s vibes feel softer when friends are near.


## Layout

| Path | Role |
| --- | --- |
| `src/shared/` | Config, Remotes, Emotes |
| `src/server/` | WorldBuilder, Orb/Float/Emote/Nameplate services |
| `src/client/` | Hud, EmoteWheel, ProximityGlow, FloatFx |
