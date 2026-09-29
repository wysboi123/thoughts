# Studio publish checklist (Femmy)

Use this when you're ready to put experiences live on Roblox.

## First 10 minutes — Haze Haven (recommended)

```bash
cd games/haze-haven
rojo build -o HazeHaven.rbxl
rojo serve
```

1. Open `HazeHaven.rbxl` in Roblox Studio → Rojo plugin → **Connect**
2. Press **Play** — sit a cushion, float pad, loft hammock, emote 1/2/3
3. Confirm spawn **WelcomeSign** + SoftWelcome toast (Haze 1.0+ publish beat) before Stop
4. Stop Play → **File → Publish to Roblox** (create new experience if prompted)
5. Paste title + description from [`EXPERIENCE_COPY.md`](EXPERIENCE_COPY.md) → Haze Haven
6. Genre: Hangout (or Adventure). Access: **Friends** for soft launch
7. Capture one soft screenshot for thumbnail (no ToS-risk framing)
8. Paste place URL + place id into [`PUBLISH_STATUS.md`](PUBLISH_STATUS.md)

That’s enough for first soft launch. Overnight agents track the live place after you paste URL + place id into `PUBLISH_STATUS.md`.

## One-time setup

1. Install [Rokit](https://github.com/rojo-rbx/rokit) + Rojo Studio plugin
2. Create a Roblox experience (or one per game) under your account
3. Optional later: Open Cloud API key for CLI upload (Perplexity Q-003) — store only in OpenClaw secrets

## Per game (same pattern)

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
7. Paste URL into [`PUBLISH_STATUS.md`](PUBLISH_STATUS.md)
8. Use titles/descriptions from [`EXPERIENCE_COPY.md`](EXPERIENCE_COPY.md)

## Game slugs (active)

| Slug | Pitch |
| --- | --- |
| `haze-haven` | Chill loft lounge — **good first publish** |
| `couch-galaxy` | Apartment roof → night sky |
| `bus-stop-forever` | Infinite calm bus stop |
| `star-porch` | Night porch + fireflies |

## Don't commit

- `.ROBLOSECURITY` / Open Cloud keys
- Cookie secrets

## After publish

Update `PUBLISH_STATUS.md` + ping OpenClaw so overnight work can target live places later.
