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
| `Proximity` | Soft PointLight glow (scales with nearby count + `setBoost`) |
| `SoftWelcome` | One-shot toast (replaces prior; optional accent colors) |
| `SoftSit` | Bottom-center sit-status line (fade in/out) |
| `SoftWireSeats` | Seat.Occupant → RemoteEvent for SoftSit |
| `SoftCompany` | Nearby-player co-play HUD (arrive pulse + dynamic copy) |
| `SoftGoals` | Soft checklist · `Optional` · OnSessionSealed · OnLinger · optional-row linger pulse |

Do not invent Roblox audio asset ids here — wait for Perplexity Q-004 / Femmy paste.
