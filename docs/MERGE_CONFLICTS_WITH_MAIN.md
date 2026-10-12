# Merge conflicts: `cursor/roblox-overnight-pipeline-debf` × `main`

Fetched latest `origin/main` at `c938505` (Thought Defense mobile Expo PR **#4** squash-merged into `main`).

Conflict review while merging `main` into PR **#1**’s overnight branch (`cursor/resolve-pr1-main-conflicts-5a0d`).

## Simple (resolved)

| File | Resolution |
| --- | --- |
| `docs/WAKE_NOTES.md` | **Merged both** histories under labeled tracks (chill overnight PR #1/#3 · mobile PR #4), then shared earlier notes. Newest-first within each track. |
| Non-conflict adds from `main` | Took `mobile/thought-defense/**`, `docs/APP_BACKLOG.md`, `docs/LEGACY_ROBLOX.md`, `docs/MOBILE_STACK.md`, and related auto-merges (`AGENTS.md`, `MEMORY.md`, `RESEARCH_QUEUE.md`, etc.) |

## Complicated — conflicting intents (needs Femmy)

These are **not** mechanical. Overnight hangout ops and `main`’s **mobile-primary** pivot disagree. For this merge commit, **overnight (ours) was kept** on these files so PR #1 stays coherent. Mobile **code** from `main` is in the tree under `mobile/thought-defense/`; docs below still describe chill-first overnight work.

### 1. Product / README — `README.md`

| Overnight (kept) | `main` (after PR #4) |
| --- | --- |
| OpenClaw / Colin / Head coder overnight strip | Thought Defense mobile product strip (Expo · IAP · EAS) |
| Games list: 4 active + 3 parked chill | Quick start → `mobile/thought-defense`; no chill gallery |

**Conflict:** Is this repo still a Roblox overnight hangout lab, or a mobile TD lab?

### 2. Schedule / email / timers — `docs/SCHEDULE.md`

| Overnight (kept) | `main` |
| --- | --- |
| Quiet night 23:00→05:00 · **one** digest at stop | Hourly ~30‑min **mobile** batches + email each batch |
| Timers: stop + daily resume | Adds `thought-defense-mobile-hourly`; retires Roblox hourly |

**Conflict:** quiet overnight vs continuous mobile hourlies (and which timers are authoritative).

### 3. Gallery / backlog / copy — `docs/GAMES.md`, `docs/GAME_BACKLOG.md`, `docs/EXPERIENCE_COPY.md`

| Overnight (kept) | `main` |
| --- | --- |
| Active: Haze / Couch / Bus / Porch (Night 18 versions) | Primary: Thought Defense **mobile** |
| Parked: Slow Orbit / Puddle / Lantern | Chill + Roblox TD marked **paused / legacy** |
| Full Studio experience paste copy | Mobile store listing primary; Roblox copy archived |

**Conflict:** Femmy’s active-four chill focus vs mobile-as-canonical product.

### 4. Publish docs — `docs/PUBLISH_CHECKLIST.md`, `docs/PUBLISH_STATUS.md`

| Overnight (kept) | `main` |
| --- | --- |
| Haze First-10 Studio publish · active/parked slug tables | EAS / App Store / Play checklist · IAP sandbox rows |

**Conflict:** next publish target — Roblox Haze vs Expo Thought Defense.

## Recommended Femmy decisions

1. **Canonical product:** keep overnight chill on PR #1 **or** close/park PR #1 and treat mobile (`main` / former PR #4) as the only active track.
2. **Ops:** quiet overnight-only email **or** mobile hourlies (or dual-track on separate branches — already partially true).
3. **Docs truth:** after (1), rewrite README / SCHEDULE / GAMES / PUBLISH_* to one story (do not leave dual intent).

Until then: this merge preserves Night 18 hangout docs; mobile app from `main` is present under `mobile/thought-defense/`.

## Other PRs (this fetch)

| PR | vs `main` | Notes |
| --- | --- | --- |
| **#4** mobile Thought Defense | **MERGED** into `main` at `c938505` | No further conflict work |
| **#3** Chill USPs → overnight base | CLEAN vs its base (`cursor/roblox-overnight-pipeline-debf`) | Stacked on PR #1 |
| **#1** overnight pipeline → `main` | Was CONFLICTING; this merge addresses content conflicts | Intent items above still open |

## Not silently rewritten

Complicated files were **not** rewritten to `main`’s mobile-first wording. Choosing `main`’s side would redefine PR #1’s purpose without Femmy.
