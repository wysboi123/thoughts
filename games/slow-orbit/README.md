# Slow Orbit

Tiny planet. You walk the curve. Collect orbit beads. Gravity pulls toward the core.

## Play

```bash
cd games/slow-orbit
rojo build -o SlowOrbit.rbxl
rojo serve
```

## Loop (v0)

- Spawn on the planet surface
- Walk — gravity sticks you to the sphere
- Collect glowing orbit beads
- Soft win state: HUD says “orbit complete” at bead target (no pressure, beads respawn)
