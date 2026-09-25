# Slow Orbit

Tiny planet + moonlet. Walk the curve. Collect orbit beads. Gravity sticks you to whichever body you're near.

## Play

```bash
cd games/slow-orbit
rojo build -o SlowOrbit.rbxl
rojo serve
```

## Loop (v0.2)

- Spawn on the main planet
- Beads leave colored trails (blue on planet, violet on moonlet)
- Cross the tether to the moonlet for violet beads
- Camera sticks to radial up with smooth body handoff
- **RMB / touch-drag** to orbit · **scroll** to zoom
- Soft complete at target bead count — no fail state
