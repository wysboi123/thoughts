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

## State

- Version: **mobile 1.4.13** (HomeMindscapePreview polish)
- Path: `mobile/thought-defense`
- Branch: `cursor/mobile-thought-defense-5a0d`
- PR: https://github.com/wysboi123/thoughts/pull/4
- Tip: *(update after push)*
- Hourly timer: **`thought-defense-mobile-hourly`** (daytime = idle / apply Femmy answers only)
- Night envelope: **OPEN** until ~05:00 · `overnight-stop-5am-utc` armed (`sub_35b53331…`)
- Blocked on Femmy: Apple/Play accounts · bundle ids · IAP products · EAS projectId · legal URLs · Clarity Pass price confirm (default **$2.99**) · **RevenueCat vs RNIap**
- Next: overnight stop ~05:00 · or Femmy RC/RNIap / Pass price reply
