# Thought Defense — Upgrade UI mockups

**Status (2026-09-30):** **Vote decided = Draft C (Tray dual-mode).**  
Implemented on **mobile** (`mobile/thought-defense`). Roblox Luau chrome is **not** shipping — legacy paused.

## Locked: C — Tray dual-mode

**One-liner:** Selecting a tower swaps the bottom tray into Upgrade / Sell focus; Plant cards dim until Back.

### Interaction (shipped)
1. Tap planted tower → tray title `Selected · Gratitude L1` (etc.).
2. Plant cards dim + non-interactive; actions: **Upgrade · cost**, **Sell 50%**, **Back**.
3. Upgrade spends Clarity; tray refreshes level/cost (or Maxed).
4. Back / empty board tap → plant cards bright again.

### Layout
- Same bottom tray footprint.
- Mode A: Plant ×3 (Affirmation / Gratitude / Humor).
- Mode B: dim Plant row + Upgrade + Sell + Back.
- No floating inspector panels (A/B rejected).

### Archive drafts (not shipping)
- A — Selection panel · [draft-a](mockups/draft-a-selection-panel.jpg)
- B — Context bar · [draft-b](mockups/draft-b-context-bar.jpg)
- C — Tray dual-mode · [draft-c](mockups/draft-c-tray-dual-mode.jpg) ← **chosen**
