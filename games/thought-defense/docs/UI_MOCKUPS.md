# Thought Defense — Upgrade UI mockups (vote before build)

**Status:** Specs + visual mockups ready. **Luau implementation blocked** until Femmy picks A / B / C (or a hybrid).

**Constraint:** Soft pastel ScreenGui · mobile touch · ToS-safe hopeful tone · no medical claims.

**Current HUD (audit):** Top bar (title + Calm / Clarity / Wave) · toast · Begin/Start wave · bottom tray (Affirmation / Gratitude / Humor Plant + Sell). v0.2 already upgrades on **pad click** server-side; Femmy OK’d an explicit **Upgrade button** instead of (or in addition to) silent pad-click upgrade.

**Visuals:** [mockups/index.html](mockups/index.html) · PNGs below.

---

## A — Selection panel

**One-liner:** Tap a planted thought → a side (or bottom-sheet on phone) panel with stats, Upgrade, and Sell.

### Interaction flow
1. Player taps a planted pad / tower (select, do **not** auto-upgrade).
2. Soft highlight ring on the tower.
3. Selection panel opens: name, level, range/damage blurb, **Upgrade · N Clarity**, **Sell**.
4. Tap Upgrade → spend Clarity, level up (toast “Deepened to L2”).
5. Tap empty ground / Back / X → deselect; panel closes; plant tray stays available.

### Layout
- Desktop: left or right floating panel (~240–280px), rounded pastel card, above the tray.
- Mobile: bottom sheet above tray (or replaces tray briefly) so thumbs reach Upgrade.
- Top bar + toast unchanged; plant tray stays visible but secondary.

### Pros
- Clearest stats + intentional upgrade (no accidental deepen).
- Room for flavor line / level preview.
- Matches common TD “inspect tower” pattern.

### Cons
- Extra UI surface to build and animate.
- Can crowd small phones if not a bottom sheet.

### Mobile notes
Prefer bottom sheet (≥44px tap targets). Avoid edge-hug on notched devices (`IgnoreGuiInset` already on).

### HUD pieces that change
- **New:** Selection panel (+ highlight ring).
- **Change:** Pad click = select when occupied (upgrade only via button).
- **Keep:** Top bar, toast, plant tray, Begin/Start, Sell still reachable from panel (tray Sell can stay for mode toggle or defer to panel).

**Mockup:** [mockups/mockup-01-selection-panel.png](mockups/mockup-01-selection-panel.png)

---

## B — Context bar

**One-liner:** Select a tower → a slim floating bar just above the plant tray with Upgrade (cost + level) and Deselect.

### Interaction flow
1. Tap planted tower → select + highlight.
2. Context bar appears above tray: `Affirmation · L2` · `Upgrade 75 Clarity` · Deselect.
3. Tap Upgrade → deepen; bar updates level/cost or shows “Maxed”.
4. Deselect or tap empty → bar hides; plant mode resumes.

### Layout
- Centered bar (~420–520px wide, ~52–64px tall) between Start button zone and tray.
- Tray unchanged (Plant + Sell still there).
- Minimal chrome — one primary CTA.

### Pros
- Smallest change to current HUD.
- Fast to ship; Upgrade affordance is obvious without a full inspector.
- Keeps plant cards always visible for mid-wave planting.

### Cons
- Little room for stats/flavor.
- Two upgrade-adjacent UIs near tray (bar + Sell) can feel busy if copy is long.

### Mobile notes
Full-width bar with large Upgrade tap target; keep ≥12px gap above tray so mis-taps don’t hit Plant cards.

### HUD pieces that change
- **New:** Context bar (+ highlight).
- **Change:** Occupied pad click = select (not silent upgrade).
- **Keep:** Tray layout, top bar, toast, Start.

**Mockup:** [mockups/mockup-02-context-bar.png](mockups/mockup-02-context-bar.png)

---

## C — Tray dual-mode

**One-liner:** Selecting a tower swaps the bottom tray into Upgrade / Sell focus; Plant cards dim until Back.

### Interaction flow
1. Tap planted tower → tray title becomes `Selected · Gratitude L1`.
2. Plant cards dim; primary actions become **Upgrade · cost** and **Sell**; **Back to plant** chip restores plant mode.
3. Upgrade spends Clarity; tray refreshes level/cost.
4. Back / empty tap → plant cards bright again.

### Layout
- Same tray footprint (centered bottom ~480×118+).
- Mode A (default): Plant ×3 + Sell.
- Mode B (selected): dim Plant row + Upgrade + Sell + Back.
- No extra floating panels.

### Pros
- Reuses familiar tray; no new screen region.
- Strong “one job” focus — can’t plant and upgrade at once by accident.
- Sell and Upgrade live together when a tower is selected (matches Femmy’s button ask).

### Cons
- Hides plant affordances while selected (need obvious Back).
- Mode swap needs clear animation/title change so players aren’t lost.

### Mobile notes
Excellent for thumbs — everything stays in the bottom safe zone. Dimmed plant cards should still be non-interactive (or Back-only).

### HUD pieces that change
- **Change:** Tray becomes dual-mode; occupied pad click selects into mode B.
- **Maybe retire:** Always-visible Sell-as-mode toggle (Sell becomes selected-tower action), or keep both carefully labeled.
- **Keep:** Top bar, toast, Start.

**Mockup:** [mockups/mockup-03-tray-dual-mode.png](mockups/mockup-03-tray-dual-mode.png)

---

## Agent recommendation (non-binding)

**B (Context bar)** for fastest clear Upgrade button with least HUD churn; **A** if Femmy wants stats/flavor on select; **C** if she wants zero new chrome and tray-centric UX.

**Hybrid option:** B’s floating Upgrade + keep pad-click upgrade as shortcut (document in tray hint).

---

## Vote

Reply with **A**, **B**, **C**, or a short hybrid (e.g. “B + keep pad-click upgrade”).  
Implementation ships only after your pick — see design consult Mockup vote section.
