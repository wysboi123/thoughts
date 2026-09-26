# Studio publish checklist (Femmy)

Use this when you're ready to put experiences live on Roblox.

## One-time setup

1. Install [Rokit](https://github.com/rojo-rbx/rokit) + Rojo Studio plugin
2. Create a Roblox experience (or one per game) under your account
3. Optional later: Open Cloud API key for CLI upload (see Perplexity Q-003) — store only in OpenClaw secrets

## Per game

```bash
cd games/<slug>
rojo build -o <Name>.rbxl
rojo serve
```

1. Open the `.rbxl` in Studio → Rojo **Connect**
2. Press **Play** — walk the loop once
3. **File → Publish to Roblox** (or Publish as → new place)
4. Set experience name, description, genre (hangout / adventure)
5. Thumbnail: sit/float screenshot, soft lighting — no ToS-risk imagery
6. Access: Public when ready; Friends for soft launch is fine

## Game slugs tonight

| Slug | Pitch |
| --- | --- |
| `haze-haven` | Chill loft lounge, emotes, vibe board |
| `slow-orbit` | Walk a tiny planet + moonlet |
| `couch-galaxy` | Apartment roof → night sky |
| `puddle-mirror` | Puddles open secret nooks |
| `bus-stop-forever` | Infinite calm bus stop |

## Don't commit

- `.ROBLOSECURITY` / Open Cloud keys
- Published place IDs with secrets attached

## After publish

Paste place URLs into `docs/WAKE_NOTES.md` or OpenClaw so overnight work can target live places later.
