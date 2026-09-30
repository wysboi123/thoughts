# Chill shared packages

Reusable Luau helpers for Femmy’s hangout games. Wire into a Rojo game via `default.project.json`:

```json
"ReplicatedStorage": {
  "Shared": { "$path": "src/shared" },
  "Chill": { "$path": "../../packages/chill" }
}
```

Then: `local SoftGoals = require(ReplicatedStorage.Chill.SoftGoals)`

| Module | Job |
| --- | --- |
| `PartFactory` | Anchored part builder + clear Baseplate |
| `RemoteFolder` | Server-create / client-wait RemoteEvents |
| `SoftGoals` | Low-pressure session checklist HUD |
| `Proximity` | Soft PointLight glow for nearby players |
| `SoftWelcome` | One-shot slide-in welcome toast |
| `SoftSit` | Bottom-center sit-status line for friends |
| `SoftWireSeats` | Seat.Occupant → RemoteEvent for SoftSit |
| `SoftCompany` | Nearby-player “soft company” co-play HUD |

Do not invent Roblox audio asset ids here — wait for Perplexity Q-004 / Femmy paste.
