# Haze Haven

Chill float hangout. Soft dusk skybox energy, float pads, vibe orbs. No combat.

## Play in Studio

```bash
cd games/haze-haven
# if needed: rokit install
rojo build -o HazeHaven.rbxl
rojo serve
```

1. Open `HazeHaven.rbxl` in Roblox Studio  
2. Rojo plugin → **Connect**  
3. Press **Play**

## Loop

- Spawn on the lounge pad
- Touch **float pads** (cyan) to get a soft upward boost
- Collect **vibe orbs** (magenta) — server tracks your count
- HUD shows orb count bottom-left

## Files

| Path | Role |
| --- | --- |
| `src/shared/Config.luau` | Tunables |
| `src/shared/Remotes.luau` | RemoteEvent bootstrap |
| `src/server/init.server.luau` | World build + orb authority |
| `src/client/init.client.luau` | HUD + float FX |
| `src/world/` | Static world markers (built at runtime too) |

## Next slices

See repo `docs/GAME_BACKLOG.md` — loft area, sit spots, emote wheel.
