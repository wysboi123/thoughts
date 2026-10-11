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
| `SoftGoals` | Soft checklist · OnLinger · optional re-pulse · `nudgeOptional` return/depart (open or sealed) |
| `Proximity` | Soft PointLight glow (scales with nearby count + `setBoost`) |
| `SoftWelcome` | One-shot toast (replaces prior; optional accent colors) |
| `SoftSit` | Sit-status line · `EmptyTextFn` · empty-copy flip pulse · `refresh` |
| `SoftWireSeats` | Seat.Occupant → RemoteEvent for SoftSit |
| `SoftCompany` | Nearby co-play HUD · Depart/AfterDepart/Return/AfterReturn · OnDeparted/OnReturned · `refresh` |

Do not invent Roblox audio asset ids here — wait for Perplexity Q-004 / Femmy paste.
