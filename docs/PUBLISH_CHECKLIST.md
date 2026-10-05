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
3. **WelcomeSign verify (Haze 3.1 USP beat)** before Stop:
   - World part named `WelcomeSign` near spawn
   - SurfaceGui `WelcomeTitle` = **Haze Haven**
   - SurfaceGui `WelcomeBody` = tagline *float soft. vibes sync when friends are near.*
   - SoftWelcome toast holds ~6s + SoftCompany line at bottom-left
   - SoftGoals top-right: vibes · sit · float · vibe sync (◦ optional — solo soft-complete OK; “company still open”)
   - After ~48s soft-complete: SoftGoals title “still here · soft” + linger toast (playtime stay)
4. Optional second player / alt: vibe sync toast + WelcomeBody flips · board/orb/HUD/hammock/nameplate tint when near
5. Stop Play → **File → Publish to Roblox** (create new experience if prompted)
6. Paste title + description from [`EXPERIENCE_COPY.md`](EXPERIENCE_COPY.md) → Haze Haven
7. Genre: Hangout (or Adventure). Access: **Friends** for soft launch
8. Capture one soft screenshot for thumbnail (lounge + WelcomeSign, no ToS-risk framing)
   - Prefer dusk lighting, WelcomeSign readable, SoftCompany line optional in frame
   - Avoid cluttered UI overlays; sit a cushion for a calm pose
9. Paste place URL + place id into [`PUBLISH_STATUS.md`](PUBLISH_STATUS.md)

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
   - **Haze:** lounge + WelcomeSign at dusk
   - **Couch:** apartment couch or skylight portal
   - **Bus:** shelter + timetable under soft rain light
   - **Porch:** jar + string lights + rocker
6. Access: Public when ready; Friends for soft launch is fine
7. Paste URL into [`PUBLISH_STATUS.md`](PUBLISH_STATUS.md)
8. Use titles/descriptions from [`EXPERIENCE_COPY.md`](EXPERIENCE_COPY.md)

## Game slugs

### Active

| Slug | Pitch |
| --- | --- |
| `haze-haven` | Chill loft lounge — **good first publish** |
| `couch-galaxy` | Apartment roof → night sky |
| `bus-stop-forever` | Infinite calm bus stop |
| `star-porch` | Night porch + fireflies |

### Parked for later (files kept — do not erase)

| Slug | Pitch |
| --- | --- |
| `slow-orbit` | Purple-dusk planet + moonlet |
| `puddle-mirror` | Puddles open secret nooks |
| `lantern-drift` | Fog lake raft + lanterns |

## Don't commit

- `.ROBLOSECURITY` / Open Cloud keys
- Cookie secrets

## After publish

Update `PUBLISH_STATUS.md` + ping OpenClaw so overnight work can target live places later.
