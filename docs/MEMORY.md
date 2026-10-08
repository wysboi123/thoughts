# Agent memory — Thought Defense mobile (local mirror)

Adapter MCP preferred when authenticated. This file is the durable fallback.

## Decisions

- **2026-09-30 PIVOT:** Primary product is **Thought Defense mobile** (Expo iOS+Android).
- **2026-09-30 UX lock:** Upgrade UI = **Draft C (Tray dual-mode)**. A/B discarded. No more “waiting on vote.”
- Soft mental-metaphor; no medical claims; sensible IAP (Clarity Pass + cosmetics + optional boost).
- Roblox under `games/` → legacy/paused.
- Play: **top-down plan view** + **walking enemies** (Reanimated path tweens).
- Soft goals journal screen + wave-result modal.
- **2026-10-01 night:** Clarity Pass price still unanswered → keep **$2.99**; tonight’s consult = **RevenueCat vs react-native-iap** (not A/B/C).
- **2026-10-02 ~00:30:** Wave balance v1.2.9 — softer mid/late pacing + next-wave preview + Settings replay welcome.
- **2026-10-02 ~01:30:** Lose/retry soft copy v1.3.0 — Gentle rest badge · cool mist orbs · peak-aware lead · Try again gently.
- **2026-10-02 ~02:15:** Shop UX polish v1.3.1 — free-forever strip · Pass perks · look swatches · section accents · soft card enter · buy/restore haptics.
- **2026-10-02 ~03:15:** Home polish v1.3.2 — mindscape vignette · loop chips · staggered CTAs · Pass badge.
- **2026-10-02 ~04:15:** Settings + privacy polish v1.3.3 — comfort strip · section accents · privacy sections · haptics.
- **2026-10-02 ~23:00 night resume:** Cosmetic looks in play v1.3.4 — Dawn path + Lantern rims; Pass unlocks both themes (product blurb).
- **2026-10-03 ~01:15:** Home/settings look polish v1.3.6 — preview + Active looks mirror play entitlements.
- **2026-10-03 ~02:15:** Soft goals journal polish v1.3.7 — progress · stagger · accents · Dawn · comfort strip.
- **2026-10-03 ~03:15:** Pause overlay polish v1.3.8 — breath orb · snapshot pills · goals strip · Dawn · phase chip.
- **2026-10-03 ~04:15:** Wave preview chip polish v1.3.9 — soft enter · totals · plant hints · Dawn · Reduce Motion.
- **2026-10-03 ~23:00 night resume:** SoftWelcomeSheet polish v1.4.0 — page accents · step · Dawn · comfort strip · page fade.
- **2026-10-03 ~23:30:** SoftPlayHud polish v1.4.1 — Calm/Clarity/Wave pills · soft enter · Dawn · low-Calm warn.
- **2026-10-04 ~00:30:** FirstRunTipChip polish v1.4.2 — tip fade · dots · Dawn · pause tip · accent border.
- **2026-10-04 ~01:30:** SoftActionToast polish v1.4.3 — accent bar · badge pill · scale pop · soft settle · Dawn.
- **2026-10-04 ~02:15:** DualModeTray polish v1.4.4 — mode chip · Clarity labels · select banner · Dawn · soft unaffordable (Draft C locked).
- **2026-10-04 ~03:30:** Privacy screen polish v1.4.5 — SoftBlockEnter · accents · Dawn · comfort strip · date sync.
- **2026-10-04 ~04:15:** Terms screen polish v1.4.6 — SoftBlockEnter · section cards · Dawn · free-core strip · date sync.
- **2026-10-04 ~23:00 night resume:** WalkingEnemy polish v1.4.7 — soft glow/shadow · HP track · low-HP warn · label chip · softened tag.
- **2026-10-04 ~23:30:** WaveResultModal polish v1.4.8 — stat pills · progress bar · accent goal rows · Dawn tint · comfort strip · scroll.
- **2026-10-05 ~00:30:** SoftFxLayer polish v1.4.9 — dual rings · plant/clear spark · longer life · Reduce Motion soft flash.
- **2026-10-05 ~01:30:** PeaceCore polish v1.4.10 — outer halo · soft enter · still/soft-hold sub · calm-low chip · Dawn rim.
- **2026-10-05 ~02:30:** PadDisc polish v1.4.11 — empty aura · select ring · plant hint · inner sheen · Dawn empty tint · soft enter.
- **2026-10-05 ~03:30:** SoftButton polish v1.4.12 — accent bar · top sheen · press wash · soft/ghost borders · primary shadow.
- **2026-10-05 ~04:20:** HomeMindscapePreview polish v1.4.13 — mist · soft walker · ground · look chip · caption chip · Peace still (last slice before ~05:00 stop).
- **2026-10-05 ~23:00 night resume:** PauseOverlay polish v1.4.14 — outer halo · accent bar · animated goals bar · calm-soft chip · comfort strip · pill stagger.
- **2026-10-05 ~23:30:** WavePreviewChip polish v1.4.15 — stagger pills · share mini-bars · total chip · tip chip · soft scale enter.
- **2026-10-06 ~00:30:** Atmosphere polish v1.4.16 — third orb · mid haze band · edge washes · soft content enter · Dawn tints.
- **2026-10-06 ~01:30:** Shop polish v1.4.17 — Dawn Atmosphere · Pass live chip · Active looks · card accents · comfort strip · soft enter.
- **2026-10-06 ~02:30:** GameBoard polish v1.4.18 — path glow · soft range ring · entrance breath · legend chips · Dawn lawn.
- **2026-10-06 ~03:30:** Settings polish v1.4.19 — version chip · look chips · Pass live · Dawn cards · metaphor footer.
- **2026-10-06 ~04:30:** SoftActionToast polish v1.4.20 — accent dot · soft shadow · countdown bar (last slice before ~05:00 stop).
- **2026-10-06 ~05:00 OVERNIGHT STOP:** Hard stop after night ship v1.4.14→v1.4.20. Did **not** re-arm overnight-stop. Next resume 23:00 UTC.
- **2026-10-06 ~23:00 night resume:** SoftWelcomeSheet polish v1.4.21 — accent bar · card shadow · orb halo · progress bar · step chip · scale enter · Next sheen.
- **2026-10-06 ~23:15:** SoftPlayHud polish v1.4.22 — accent bar · pill dots/sheen · scale enter · calm-soft pulse · mindscape footer · soft-chip.
- **2026-10-07 ~02:15:** FirstRunTipChip polish v1.4.23 — Soft tip badge · glow · progress · scale enter · visited dots · Got it sheen.
- **2026-10-07 ~03:15:** DualModeTray polish v1.4.24 — accent bar · shadow · mode-chip dot · soft enter · card sheen · Draft C footer.
- **2026-10-07 ~04:15:** SoftFxLayer polish v1.4.25 — outer halo · soft motes · longer plant/clear life · richer spark (last slice before ~05:00 stop).
- **2026-10-07 ~05:00 OVERNIGHT STOP:** Hard stop after night ship v1.4.21→v1.4.25. Did **not** re-arm overnight-stop. Next resume 23:00 UTC.
- **2026-10-07 ~23:15 night:** PeaceCore polish v1.4.26 — mid halo · sheen · status dot · soft shadow · holding-gently chip. Re-armed stop + daily-resume (resume timer had expired).
- **2026-10-08 ~00:15:** PadDisc polish v1.4.27 — dual empty aura · top accent · plant chip · filled sheen accent.
- **2026-10-08 ~01:20:** SoftButton polish v1.4.28 — soft enter · primary lead dot · bottom glow · richer soft shadow.
- **2026-10-08 ~02:25:** HomeMindscapePreview polish v1.4.29 — accent bar · path glow · walker trail · look-chip · metaphor caption.
- **2026-10-08 ~03:20:** PauseOverlay polish v1.4.30 — card shadow · top sheen · status dots · calm-soft chip · snapshot dots.
- **2026-10-08 ~04:25:** WavePreviewChip polish v1.4.31 — top accent · soft shadow · wave progress track · tip dot (last slice before ~05:00 stop).
- **2026-10-08 ~05:00 OVERNIGHT STOP:** Hard stop after night ship v1.4.26→v1.4.31. Did **not** re-arm overnight-stop. Next resume 23:00 UTC.
- **2026-10-08 ~23:20 night resume:** Atmosphere polish v1.4.32 — orb halos · soft haze band · side washes · center glow · soft content enter. Re-armed overnight-stop (`sub_4db7d021…`).

## State

- Version: **mobile 1.4.32** (Atmosphere polish)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/4
- Tip: `0548461` (v1.4.32 Atmosphere)
- Hourly timer: **`thought-defense-mobile-hourly`** (daytime = idle / apply Femmy answers only)
- Night envelope: **OPEN** until ~05:00 · `overnight-stop-5am-utc` armed (`sub_4db7d021…`) · `overnight-daily-resume` armed (`sub_d6468578…`)
- Blocked on Femmy: Apple/Play accounts · bundle ids · IAP products · EAS projectId · legal URLs · Clarity Pass price confirm (default **$2.99**) · **RevenueCat vs RNIap**
- Next: night hourlies · overnight stop ~05:00 · or Femmy RC/RNIap / Pass price reply
