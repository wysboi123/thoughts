# Roblox two-game rollout plan — 2026-10-12

**Status:** Femmy override — planning + Claude Code prompt for **two new** Roblox experiences.  
**Does not** un-pause Thought Defense Roblox Upgrade UI A/B/C (`docs/LEGACY_ROBLOX.md`).  
**Mobile Thought Defense** remains the overnight primary path unless Femmy reassigns timers.

**Prompt for Claude Code:** [`docs/CLAUDE_CODE_ROBLOX_PROMPT.md`](../CLAUDE_CODE_ROBLOX_PROMPT.md)

---

## 1. Market snapshot (what is winning now)

### Platform context

- Roblox FY2025: ~**$4.9B revenue** (+36% YoY), **$6.8B bookings**; creators earned **>$1.5B** collectively. Breakouts *Grow a Garden* and *Steal a Brainrot* drove record CCU and bookings upside ([PocketGamer.biz](https://www.pocketgamer.biz/roblox-revenue-up-36-yy-as-grow-a-garden-and-steal-a-brainrot-drive-multiple-milestones/), Feb 2026).
- Fastest-growing mechanic clusters: **steal-and-defend tycoons**, **idle-grow simulators**, co-op horror, anime fighters, fashion social ([Game-Ace](https://game-ace.com/blog/roblox-trends-in-gaming/), updated Jun 2026).
- Simulators remain the most **reliably profitable** mid-skill genre; fighting is high upside / high production cost ([KitsBlox](https://kitsblox.com/blog/popular-roblox-game-genres-2026/), Mar 2026).

### Winning product #1 pattern — Idle-grow (*Grow a Garden*)

| Signal | Evidence |
| --- | --- |
| Loop | **Plant → Wait → Harvest → Sell → Upgrade**; offline growth; rare crops; weather; pets deepen without friction ([Max Power Gaming](https://www.maxpowergaming.co/post/why-grow-a-garden-is-winning-and-what-you-can-learn-from-it/), Jul 2025; [Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)) |
| Social | Steal/gift crops → mischief + mentorship stories |
| LiveOps | Weekly themed drops + countdowns → appointment play / CCU spikes |
| Discovery | Shareable moments → YouTube/TikTok flywheel → Discover rank |
| Scale | Peaked **22.3M+ CCU**; 35B+ visits class; industry-record concurrent for a time ([Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)) |
| Caution | Heavy monetization / loot-box pets drew criticism after studio investment — **we will not copy dark patterns** |

### Winning product #2 pattern — Steal-and-defend tycoon (*Steal a Brainrot*)

| Signal | Evidence |
| --- | --- |
| Loop | Own a base → collect meme units that print cash → **steal others’ units** → defend → upgrade |
| Monetisation | Gamepasses (speed, storage, abilities) + dev products (boosters) ([Game-Ace genre table](https://game-ace.com/blog/roblox-trends-in-gaming/)) |
| Virality | Steal moments are clip-native; codes/events keep return visits |
| Scale | Multi-billion visit class; competed with GaG for 20M+ CCU records ([PocketGamer](https://www.pocketgamer.biz/roblox-revenue-up-36-yy-as-grow-a-garden-and-steal-a-brainrot-drive-multiple-milestones/); Rolimons listed 70B+ visits class) |
| Caution | Community criticism of aggressive kid-targeting monetisation — ship **fair, transparent** IAP only |

### Monetisation rails that convert (without dark patterns)

1. **GamePasses** — one-time quality-of-life / cosmetics / capacity (not required to win).
2. **Developer Products** — optional timed boosts; never gate the core loop.
3. **Premium Payouts** — design for session length / retention (Premium subscribers).
4. **UGC / limiteds** — phase 2 after CCU is stable.
5. **Weekly LiveOps** — content as marketing (new seeds / critters / weather), not fake urgency banners.

**Hard rules for this lab:** soft/hopeful tone where themed; **no medical claims**; **no dark patterns** (no fake countdowns, no paywalling basic progress, no deceptive odds); core loop free forever.

### Why these two lanes for *immediate* rollout

| Lane | Ship speed | Monetisation clarity | Trend heat | Solo/small-team fit |
| --- | --- | --- | --- | --- |
| Idle-grow | Fast (days→2 weeks MVP) | High | Highest | Excellent |
| Steal-defend tycoon | Fast–medium | High | Highest | Good (needs server auth) |
| Co-op horror / fighters | Slower | Medium–high | High | Poor for day-1 Claude Code |

Emerging underserved genres (narrative, rhythm, sports) are interesting later ([ROLearn Q2 2026](https://rolearn.dev/trend-reports/emerging-roblox-game-genres-q2-2026/)) but are **not** immediate-MVP choices.

---

## 2. Game A — **Glowgrove**

### One-liner

Cozy **night-bloom idle garden**: plant glowing seeds, harvest under shifting weather moods, trade/gift blooms, light “borrow” mischief — *Grow a Garden* loop with original soft IP.

### Unique selling points

1. **Night-bloom identity** — moon phases + weather moods change growth rates and rare drops (appointment play without FOMO spam).
2. **Soft social** — gift blooms freely; “borrow” (steal) has **telegraph + cooldown + return-to-owner window** so clips stay fun, not toxic.
3. **Mobile-first plot UI** — one-thumb plant/harvest; 30-second teachable loop.
4. **Creator-clip bait** — rare bloom reveal FX, weather transitions, gift beams.
5. **Ethical economy** — no loot-box pets in v1; collectibles are **earnable**; Robux = convenience + looks.

### Core loop (MVP)

```
Buy seed → Plant on plot → Wait (or offline grow) → Harvest → Sell to Bloom Broker
→ Unlock better seeds / expand pads → Optional: gift / borrow → Repeat
```

### MVP content budget (shippable)

| System | Scope |
| --- | --- |
| Plots | 1 personal plot, 6 plant pads (expand to 9 via pass) |
| Seeds | 8 types across Common→Mythic (CarrotGlow → Starlotus) |
| Weather | Clear / Mist / Moonshower (server cycle every 3–5 min) |
| Economy | Soft currency **Petals**; seed shop with rotating stock |
| Social | Gift to nearby player; Borrow with 45s steal window + 90s immunity after |
| Persist | DataStore: petals, unlocked seeds, pad contents, owned cosmetics |
| HUD | Petals, weather chip, seed tray, sell button |

### Monetisation (Glowgrove)

| Product | Type | Price band (Robux) | Role |
| --- | --- | --- | --- |
| Extra Pads (+3) | GamePass | 199–349 | Capacity, not power |
| Auto-Mist (AFK water) | GamePass | 149–249 | Convenience |
| 2× Harvest (30 min) | DevProduct | 49–99 | Optional speed |
| Petal Pack (S/M/L) | DevProduct | 49 / 149 / 399 | Soft currency — **never** required for next seed tier |
| Dawn Theme / Lantern Theme | GamePass or product | 99–199 | Cosmetic plot looks |
| Premium | Platform | — | Slight offline grow bonus (retention → Premium Payouts) |

**Pay-to-win guardrails:** mythic seeds unlock via play milestones; Robux packs cannot skip more than one rarity tier; borrow tools are free (cooldown-based).

### LiveOps cadence (post-MVP)

- Weekly **weather event** (new rare bloom + thumbnail + Discord/group post).
- Biweekly seed rotation in shop.
- Monthly cosmetic drop (UGC phase 2).

### Success metrics (first 14 days)

| Metric | Target |
| --- | --- |
| D1 retention | ≥35% |
| Session length median | ≥8 min |
| Free→payer conversion | ≥1.5% |
| Steal/gift actions per session | ≥1 (social proof) |
| Like:dislike | ≥80% |

### Tech / folder

`games/glowgrove/` — Rojo layout per `docs/ROBLOX_STACK.md`.

---

## 3. Game B — **Critter Claim**

### One-liner

**Steal-and-defend tycoon**: claim cute critters from a rotating runway, park them on your base to print coins, raid rivals’ pens, defend yours — *Steal a Brainrot* energy with original, store-safe critter IP.

### Unique selling points

1. **Readable runway** — shared spawn carpet with rarity telegraphs (color + audio sting) → instant “I gotta grab that” moments.
2. **Defend toys that are skillful** — alarm bells, sticky mud, decoy crates — **earned**, not locked behind the only good pass.
3. **Cute-not-cruel IP** — soft shapes, hopeful comedy; no gore / no gambling aesthetic.
4. **Clip engine** — failed steals, clutch defenses, mythic runway spawns.
5. **Fair monetisation** — speed/storage passes; core income curve beatable F2P in ~same sessions as light spenders.

### Core loop (MVP)

```
Stand near runway → Claim freestanding critter → Carry to your pen → Critter drops Coins
→ Buy upgrades / better pens → Sneak into rival base → Steal → Escape → Defend
```

### MVP content budget

| System | Scope |
| --- | --- |
| Map | Hub + runway + 8 player bases (or dynamic claim pads) |
| Critters | 10 species × 4 rarities (Common→Legendary) |
| Income | Critter $/s by rarity; stacking soft-caps |
| Steal | Pick up rival critter (carry slow); drop on catch / timeout |
| Defend | Alarm (highlight thief 5s); Mud puddle (slow); Lock gate (30s CD) |
| Upgrades | Pen capacity, walk speed tier 1–3 (soft), income multiplier soft-cap |
| Persist | DataStore: coins, owned critters, upgrades, cosmetics |

### Monetisation (Critter Claim)

| Product | Type | Price band | Role |
| --- | --- | --- | --- |
| Runner Shoes (+walk) | GamePass | 199–299 | Convenience — F2P still gets mid speed via play |
| Extra Pen Slots (+2) | GamePass | 249–349 | Capacity |
| Lucky Runway (15 min higher rare weight) | DevProduct | 79–149 | Optional RNG **boost**, odds shown in UI |
| Coin Pack S/M/L | DevProduct | 49 / 149 / 399 | Soft currency |
| Critter Skins pack | GamePass | 149–249 | Cosmetic |
| VIP Nametag + trail | GamePass | 99–149 | Status flex |

**Anti-abuse:** server-authoritative carry/steal; anti-teleport; rate-limit claims; no paid “instant win steal.”

### LiveOps cadence

- Weekend **mythic runway hour** (transparent schedule in HUD).
- Weekly new critter species.
- Seasonal map dressing (Autumn pen, etc.).

### Success metrics (first 14 days)

| Metric | Target |
| --- | --- |
| D1 retention | ≥30% |
| Steals per hour per server | Healthy social graph (≥20) without toxic reports spike |
| Payer conversion | ≥2% |
| Average session | ≥10 min |
| Like:dislike | ≥75% |

### Tech / folder

`games/critter-claim/` — Rojo layout per `docs/ROBLOX_STACK.md`.

---

## 4. Immediate rollout capability (how to ship this week)

### Day-0 prerequisites (Femmy)

1. Roblox **Group** (or personal) for experiences + GamePasses.
2. Enable **Studio** + Rojo plugin on a machine that can publish (Cloud VM cannot GUI-publish — see `docs/ROBLOX_STACK.md`).
3. Create empty experiences: *Glowgrove*, *Critter Claim*; note PlaceIds.
4. Paste [`docs/CLAUDE_CODE_ROBLOX_PROMPT.md`](../CLAUDE_CODE_ROBLOX_PROMPT.md) into Claude Code locally (or a Studio-capable agent).

### Parallel build order (Claude Code)

```
Phase 0 (shared)   Scaffold both games from haze-haven Rojo template
Phase 1 (A+B)      Config + Remotes + DataStore stub + placeholder world
Phase 2A           Glowgrove plant/harvest/sell + weather + HUD
Phase 2B           Critter Claim runway/claim/pen income + HUD
Phase 3A           Gift + borrow + 3 GamePass hooks (PromptGamePassPurchase)
Phase 3B           Steal/defend + 3 GamePass hooks
Phase 4            Monetisation receipts + soft UI + soft onboarding tip
Phase 5            Thumbnails copy + README publish steps + analytics prints
```

### Definition of Done — MVP soft launch

- [ ] `rojo build` succeeds for both games
- [ ] Server authority on economy + steal/borrow
- [ ] DataStore save/load round-trips
- [ ] ≥3 GamePasses + ≥2 DevProducts wired (can ship disabled until Femmy sets IDs)
- [ ] First-session tutorial ≤45s
- [ ] No paywalled core loop
- [ ] README with Studio play + publish checklist

### Soft launch funnel

1. Friends-only → 20 playtesters  
2. Public uncopylocked=false, Discover tags: `Simulator` / `Tycoon`  
3. TikTok/Shorts: 15s steal/rare-bloom clips  
4. Weekly update #1 within 7 days of public (algorithm + retention)

### Risk register

| Risk | Mitigation |
| --- | --- |
| Clone saturation | Strong visual IP + soft social rules; weekly LiveOps |
| Exploit steal/dupe | Server authority; remotes validated; inventory checksums |
| Dark-pattern accusations | Published odds; no forced ads; free path documented in UI |
| Agent over-scope | MVP tables above are hard caps — no pets/lootboxes v1 |

---

## 5. Portfolio fit

| Existing | Relation |
| --- | --- |
| Chill hangouts (`haze-haven` …) | Aesthetic DNA (soft lighting, hopeful) — **reuse WorldBuilder patterns** |
| Roblox Thought Defense | Still paused — do not resume Upgrade UI |
| Mobile Thought Defense | Remains primary overnight product |

---

## 6. Sources

- [Roblox trends in gaming — Game-Ace](https://game-ace.com/blog/roblox-trends-in-gaming/) (Dec 2025 / Jun 2026)
- [Popular Roblox game genres 2026 — KitsBlox](https://kitsblox.com/blog/popular-roblox-game-genres-2026/) (Mar 2026)
- [Emerging genres Q2 2026 — ROLearn](https://rolearn.dev/trend-reports/emerging-roblox-game-genres-q2-2026/) (Mar 2026)
- [Why Grow a Garden is winning — Max Power Gaming](https://www.maxpowergaming.co/post/why-grow-a-garden-is-winning-and-what-you-can-learn-from-it/) (Jul 2025)
- [Grow a Garden — Wikipedia](https://en.wikipedia.org/wiki/Grow_a_Garden)
- [Roblox revenue / GaG + Steal a Brainrot milestones — PocketGamer.biz](https://www.pocketgamer.biz/roblox-revenue-up-36-yy-as-grow-a-garden-and-steal-a-brainrot-drive-multiple-milestones/) (Feb 2026)
