# Design consult — Thought Defense

Femmy asked to be consulted periodically on design choices.  
**Shipped defaults are marked ✅ — reply with overrides anytime.**

## Open decisions (need your call)

### 1. Title
Working title: **Thought Defense**  
Alternates: Mind Garden · Clarity Lane · Soft Siege · Kind Fortress  
**Your pick?**

### 2. Tone
✅ Soft / pastel / hopeful (current)  
□ Slightly darker “storm in the head” drama  
□ Arcade / punchy / score-chaser  

### 3. Placement
✅ Pad-only (12 pads beside the path — clearer for v0)  
□ Free grid placement  
□ Mix: pads early, free placement later  

### 4. Session mode
✅ Fixed **8 waves** then win  
□ Endless with rising score  
□ Both (campaign + endless unlock)  

### 5. Multiplayer
✅ Solo first (one gardener of thoughts)  
□ Co-op shared Calm / Clarity  
□ Versus (attack each other’s Peace Core) — later, careful framing  

### 6. Metaphor depth
✅ Light labels only (Doubt / Worry / Affirmation…)  
✅ Short flavor lines on enemy billboards (v0.2 polish — ToS-safe one-liners)  
□ Journal / reflection prompts between waves (opt-in)  

### 7. Difficulty
Current: Calm 20, Clarity 140 start, 8 waves.  
**Too easy / too hard / about right?** (after you Play-test once)

---

## Mockup vote — Upgrade UI button (THIS BATCH)

You said click-to-upgrade via a **UI button** is okay. Three concepts are ready — **no Luau yet** until you pick.

| Vote | Name | One-liner |
| --- | --- | --- |
| **A** | Selection panel | Tap tower → side/bottom panel with stats + Upgrade + Sell |
| **B** | Context bar | Select tower → floating Upgrade bar above tray (cost/level) |
| **C** | Tray dual-mode | Tray swaps to Upgrade/Sell; Plant cards dim |

**Specs:** [UI_MOCKUPS.md](UI_MOCKUPS.md)  
**Gallery (open locally):** [mockups/index.html](mockups/index.html)  
**Drafts:** [A](mockups/draft-a-selection-panel.jpg) · [B](mockups/draft-b-context-bar.jpg) · [C](mockups/draft-c-tray-dual-mode.jpg)


**Your pick?** Reply **A / B / C** (or a hybrid, e.g. “B + keep pad-click upgrade”) in chat, email to the agent, or by editing this file.  
Open the gallery locally or view PNGs in the repo if images do not render in email/PR.  
Implementation of final chrome is blocked on this answer.

### Research nudge (2026-09-30)
Agent web research leans **B (Context bar)** for least HUD churn + mobile clarity — see `docs/research/TD-upgrade-ui-soft-goals-2026-09-30.md`. Not a decision until you confirm.

---

## Locked for now (ToS / playbook)

- No medical claims, therapy framing, or “cure” language  
- Chill metaphor only — positive vs negative thoughts as game pieces  
- No invented audio asset ids until Perplexity Q-004 / your paste  

## Next consult triggers

- [x] Tower upgrades (v0.2 shipped — L1→L3, sell 50%)
- [ ] Upgrade **button** UX (mockups ready — waiting on Mockup vote)
- [ ] Second map
- [ ] Boss “thought spiral”
- [ ] Monetization

### Previous batch question (superseded by Mockup vote)
~~Upgrade feel: click-to-upgrade vs button?~~ → Femmy: UI button OK → mockups A/B/C above.
