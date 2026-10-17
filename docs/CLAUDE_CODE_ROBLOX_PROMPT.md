# Claude Code prompt — Glowgrove + Critter Claim (paste-ready)

Copy everything inside the fenced `PROMPT` block below into Claude Code.  
Plan context: `docs/research/ROBLOX_TWO_GAME_ROLLOUT_2026-10-12.md`  
Stack: `docs/ROBLOX_STACK.md`  
Reference scaffold: `games/haze-haven/` (Rojo + Luau layout)

```text
PROMPT
-----
You are Femmy’s Roblox head implementer for TWO new experiences in this monorepo.
Do NOT touch `mobile/thought-defense` or resume Thought Defense Roblox Upgrade UI.
Do NOT implement dark-pattern monetisation, fake urgency, medical claims, or loot-box pets in v1.

## Mission
Scaffold and implement playable MVPs for:

1) games/glowgrove/     — idle-grow night garden (Grow a Garden–class loop, original soft IP)
2) games/critter-claim/ — steal-and-defend tycoon (Steal a Brainrot–class loop, cute critter IP)

Read first:
- docs/research/ROBLOX_TWO_GAME_ROLLOUT_2026-10-12.md (design + monetisation + MVP caps)
- docs/ROBLOX_STACK.md
- games/haze-haven/ (copy Rojo/project layout patterns: default.project.json, rokit.toml, src/{shared,server,client})

## Non-negotiable product rules
- Soft, hopeful, ToS/store-safe tone
- Core loop FREE forever; Robux = convenience + cosmetics only
- Server is authority for currency, inventory, steal/borrow, purchases
- Use .luau; task.wait/task.spawn; typed public APIs where helpful
- Remotes only via shared/Remotes.luau
- PromptGamePassPurchase / MarketplaceService for IAP; Config holds placeholder asset IDs (0) Femmy will fill
- No secrets in repo

## Game A — Glowgrove (MVP scope HARD CAP)
Loop: Buy seed → Plant → Wait (offline-capable growth tick) → Harvest → Sell Petals → Unlock seeds / expand pads
Must ship:
- WorldBuilder: hub + personal plot with 6 plant pads (expand target 9 via GamePass flag)
- 8 seed types Common→Mythic in Config; seed shop with simple rotating stock
- Weather cycle Clear/Mist/Moonshower every 3–5 min (affects growth rate)
- Currency Petals; DataStore save/load
- Gift bloom to nearby player; Borrow (steal) with telegraph + cooldown + short immunity
- HUD: Petals, weather, seed tray, sell
- Monetisation hooks (IDs in Config = 0 OK): Extra Pads, Auto-Mist, 2× Harvest 30m, Petal packs S/M/L, Dawn Theme cosmetic
- First-run tip chip ≤45s
- README with rojo build/serve + publish steps

## Game B — Critter Claim (MVP scope HARD CAP)
Loop: Claim critter from runway → Place in pen → Passive Coins → Upgrade → Steal from rivals → Defend
Must ship:
- WorldBuilder: shared runway + N claimable bases/pens (start with 6–8 pads)
- 10 critter species × 4 rarities; $/s by rarity; soft income caps
- Carry/steal server-validated; drop on timeout/catch
- Defend tools (free): Alarm highlight, Mud slow, Lock gate — cooldowns
- DataStore: coins, critters, upgrades, cosmetics
- HUD: Coins, pen slots, runway rarity ping
- Monetisation hooks: Runner Shoes, Extra Pen Slots, Lucky Runway 15m, Coin packs, Critter Skins, VIP trail
- Anti-exploit basics: validate distances, rate-limit claims, reject client-declared currency
- README with rojo build/serve + publish steps

## Implementation order
1. Scaffold both games from haze-haven Rojo template (rename places, Config, empty services)
2. Glowgrove vertical slice until plant/harvest/sell works offline-persist
3. Critter Claim vertical slice until claim/pen income works
4. Social steal/borrow + defense for each
5. Wire MarketplaceService prompts + owned-pass checks (stub IDs)
6. Polish HUD/FX lightly; ensure selene-clean where configured
7. Append a short note to docs/WAKE_NOTES.md describing what shipped

## Out of scope (do not build in this pass)
- Pets loot boxes, trading marketplace UI beyond gift/borrow, UGC catalog
- Chat systems, admin abuse panels, complex pathfinding AI
- Thought Defense / chill hangout rewrites
- Publishing for Femmy (she publishes from Studio); you leave build artefacts instructions only

## Done criteria
- rojo build -o <Game>.rbxl succeeds in each folder
- Two players in Studio can demonstrate gift/borrow (Glowgrove) and steal/defend (Critter Claim) with server authority
- F2P can progress full MVP without any purchase
- Config documents every GamePass/DevProduct name + placeholder ID field
- No TODO that blocks Play; optional polish left as clearly marked -- later

Start by creating both game folders and Config/Remotes, then implement Glowgrove Phase 2 before Critter Claim Phase 2. Commit in logical chunks with clear messages.
-----
END PROMPT
```

## How Femmy uses this

1. Open this repo in Claude Code on a machine with Roblox Studio + Rojo.
2. Paste the `PROMPT` block as the first message (or `@` the file).
3. After MVP: create GamePasses in Creator Dashboard → paste IDs into each game’s `Config.luau`.
4. `rojo build` → Studio → Publish → soft-launch friends-only.
5. Schedule weekly LiveOps per the research doc.
