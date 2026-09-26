# Perplexity research queue

Femmy runs Perplexity as the head coder’s Google. Agents **do not invent citations** — they queue questions here, Femmy pastes into Perplexity, then drops answers under `docs/research/`.

## Protocol

1. Agent appends a **Query** block (paste-ready) to **Open** below
2. Femmy runs it in Perplexity (Pro / Deep Research ok)
3. Femmy pastes the answer into `docs/research/<slug>.md` (or replies in chat)
4. Agent marks the query **Done** and applies findings in code

### Query format (always use this)

```
### Q-<id> — <short title>
Status: Open | Done
Needed for: <game / decision>
Paste into Perplexity:

"""
<full prompt>
"""
```

---

## Open

### Q-001 — Roblox hangout UX that retains
Status: Open  
Needed for: Haze Haven v0.1 / chill line  
Paste into Perplexity:

"""
Research best practices for Roblox social hangout / chill experiences in 2025–2026 that keep players returning without combat or tycoon loops.

Focus on:
1. Session length and soft goals that feel rewarding but low-pressure
2. Proximity / social features that work in small maps
3. Lighting, atmosphere, and sound design patterns used by successful vibe / lounge games
4. Monetization that doesn't kill the chill vibe (if any)
5. Common ToS / moderation pitfalls for “trippy / dreamy / haze” aesthetics

Cite Roblox Creator Hub docs, DevForum posts, and real published experiences where possible. Prefer concrete mechanics over generic advice.
"""

### Q-002 — Sit / emote / proximity glow in Luau
Status: Open  
Needed for: Haze Haven v0.1–v0.2  
Paste into Perplexity:

"""
For Roblox Luau (2026), what's the recommended way to implement:
1. Sit spots / Seat or custom sit poses that work with modern Humanoid
2. A simple client emote wheel (wave, sit, float) with server replication so others see it
3. A soft proximity glow when two players are near each other

Prefer patterns compatible with Rojo filesystem projects (ModuleScripts in ReplicatedStorage, RemoteEvents). Call out deprecated APIs. Include short code sketches or links to official docs / solid DevForum examples.
"""

### Q-003 — Open Cloud publish from CI / agent
Status: Open  
Needed for: overnight auto-publish later  
Paste into Perplexity:

"""
How do you publish a Rojo-built Roblox place using Open Cloud API keys in 2026? Cover:
1. Creating the API key + required scopes
2. Uploading a .rbxl / place version from CLI (rojo upload or Open Cloud endpoints)
3. Security: what Femmy should store in OpenClaw Gateway secrets vs never commit
4. Whether unattended overnight publish is allowed / recommended vs manual Studio publish

Cite official Roblox Open Cloud documentation.
"""

### Q-004 — Roblox free ambient audio asset ids (ToS-safe)
Status: Open  
Needed for: Haze Haven audio hooks / Bus Stop rain  
Paste into Perplexity:

"""
Find currently usable Roblox audio asset IDs (2026) suitable for chill hangout games:
1. Soft ambient pad / night ambience (loopable)
2. Light rain loop
3. Soft UI / collectible blip
4. Distant bus / soft whoosh

Prefer free Creator Store / Roblox-provided audio that is allowed for public experiences. List the rbxassetid numbers, titles, and license notes. Flag anything deprecated or removed.
"""

---

## Done

_(none yet)_
