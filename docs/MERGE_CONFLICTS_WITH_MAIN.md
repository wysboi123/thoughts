# Merge conflicts: `cursor/roblox-overnight-pipeline-debf` × `main`

Fetched `origin/main` at `4eb6957` (Thought Defense v0.2 + Upgrade UI mockups, PR #2).
Conflict review while merging `main` into PR #1’s branch.

## Simple (resolved)

These were **add/add** or content conflicts where overnight Night 6 work is a strict superset of `main`. Kept **ours** (PR #1):

| File | Resolution |
| --- | --- |
| `games/*/Config.luau` (Haze 1.8, Couch 1.5, Bus 1.7, Porch 1.6) | Keep higher Night 6 versions |
| `games/bus-stop-forever/.../init.server.luau` | Keep dual-roof / bench pulse polish |
| `games/couch-galaxy/.../init.server.luau` | Keep bookshelf / couch fabric pulse |
| `games/haze-haven/.../AtmosphereService.luau` + `OrbService.luau` | Keep loft warm / candle / table / orb light |
| `games/star-porch/.../init.server.luau` | Keep house wall / deck / fire-pit polish |
| Parked READMEs (`slow-orbit`, `puddle-mirror`, `lantern-drift`) | Keep “Parked for later” banners |
| `docs/RESEARCH_QUEUE.md` | Kept overnight queue **+** added `Q-005` + TD agent note from `main` |
| `docs/WAKE_NOTES.md` | **Merged both** histories (newest first; deduped headings) |

Also took all non-conflicting additions from `main` (Thought Defense Roblox game under `games/thought-defense/`, `DESIGN_CONSULT.md`, `MEMORY.md`, research note).

## Complicated — conflicting intents (needs Femmy)

These are **not** mechanical. Overnight and `main` disagree on product/ops intent. For this merge commit, **overnight (ours) was kept** so PR #1 stays coherent; `main`’s alternate text is **not** applied. Decide below before treating the merge as final.

### 1. Schedule / email policy — `docs/SCHEDULE.md`

| Overnight (kept) | `main` (Thought Defense hourly) |
| --- | --- |
| Night window 23:00→05:00 UTC | Same night envelope **plus** hourly ~30‑min batches |
| **One** digest email at 05:00 only | Email after **each** hourly batch |
| Timers: stop + daily resume | Adds `thought-defense-hourly` cron |

**Conflict:** quiet overnight vs continuous hourly TD shipping + email cadence.

### 2. Active vs parked lineup — `docs/GAMES.md`, `docs/GAME_BACKLOG.md`, `docs/EXPERIENCE_COPY.md`

| Overnight (kept) | `main` |
| --- | --- |
| Active: Haze / Couch / Bus / Porch (Night 6 versions) | All 7 chill games listed active at older versions |
| Parked: Slow Orbit / Puddle / Lantern (Femmy 2026‑09‑29) | No parked split |
| No Thought Defense in gallery | Adds `thought-defense` 0.2.4 |

**Conflict:** Femmy’s focus cut + park order vs `main`’s flat gallery that also introduces TD. Code for TD **is** in the tree now; docs still describe hangout-only active set.

### 3. README status strip — `README.md`

| Overnight (kept) | `main` |
| --- | --- |
| “4 active + 3 parked” | “7 chill games” |
| Games table matches park split | Flat list + Thought Defense |

Same lineup intent conflict as (2).

### 4. Publish docs — `docs/PUBLISH_CHECKLIST.md`, `docs/PUBLISH_STATUS.md`

| Overnight (kept) | `main` |
| --- | --- |
| Active / parked slug tables | Flat slug list + Thought Defense first‑10‑minutes + status row |

**Conflict:** whether TD is a first-class publish target alongside Haze, and whether parked games stay labeled.

## Recommended Femmy decisions

1. **Ops:** overnight-only quiet email **or** hourly TD batches (or dual-track: hangout nights vs TD hourlies on separate branches/PRs).
2. **Lineup:** keep Active/Parked split **and** add Thought Defense as its own track (docs), or flatten all games again.
3. **Publish:** whether TD joins the “first publish” candidates next to Haze.

Until then: PR #1 merge commit preserves Night 6 hangout docs; TD **code** from `main` is present under `games/thought-defense/`.

## Not conflicting

- PR #4 (`cursor/mobile-thought-defense-5a0d` → `main`): **MERGEABLE / CLEAN** (already contains `main`).
- `cursor/roblox-hourly-batch-5a0d` → `main`: merges cleanly (auto).
