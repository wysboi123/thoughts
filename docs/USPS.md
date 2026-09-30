# Unique selling points — chill line

Research basis (2025–2026 hangout patterns): Roblox rewards **intentional co-play**, soft shared activities, and atmosphere-as-loop — not combat/grind. Sources: Creator Hub “design for Roblox”, DevForum hangout discovery threads, Context scan 2026-09-30 (`docs/research/hangout-usps-2026-09-30.md`).

**Active focus:** Haze · Couch · Bus · Porch. **Parked (keep files):** Orbit · Puddle · Lantern.

## Line USP

| USP | Pitch | Status |
| --- | --- | --- |
| **Soft company** | Nearby friends get a soft presence signal (glow + “soft company · N nearby”) — hangout without VC pressure | ✅ Shared `Chill.SoftCompany` on all four |

## Per-game USPs (priority order)

| Priority | Game | USP | Why it sells | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| **P0** | Haze Haven | **Vibe sync** | Board + orbs feel better when friends are near | Soft company toast on first nearby | ✅ v1.9 |
| **P0** | Bus Stop Forever | **Waiting together** | Timetable live sit count — “whenever” becomes shared | Timetable `waiting: N together` + SoftCompany | ✅ v1.8 |
| **P0** | Star Porch | **Jar that fills** | Fireflies return; jar visibly fills as you collect | `JarGlow` scales with session fill | ✅ v1.7 |
| **P1** | Couch Galaxy | **Two worlds, one couch** | Clear home ↔ galaxy identity | Place line + SoftWelcome + SoftCompany | ✅ v1.6 |
| **P2** | Haze Haven | Shared vibe board | Soft ranks without competition toxicity | Already: VibeBoard | ✅ |
| **Later** | Parked trio | Resume USPs when Femmy unparks | Files kept | — | Parked |

## Implementation order (done this pass)

1. Shared `SoftCompany` package  
2. Haze vibe-sync toast  
3. Bus timetable waiting count + SoftCompany  
4. Porch jar fill + SoftCompany  
5. Couch two-worlds copy + SoftCompany  

## Copy hooks (thumbnails / description)

- Haze: “float soft. vibes sync when friends are near.”
- Couch: “couch first. skylight second. two worlds.”
- Bus: “the bus will come. you don’t have to. wait together.”
- Porch: “fireflies drift back. the jar remembers.”

## Do not invent

Audio asset ids still blocked on Perplexity Q-004.
