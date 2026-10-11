# Thought Defense — mobile

Cross-platform **Expo / React Native** app (iOS + Android) for Femmy’s soft mindscape tower defense.

Metaphor only — plant positive thoughts, clear noise, protect the Peace Core. **Not** therapy or medical advice.

## Quick start

```bash
cd mobile/thought-defense
npm install
npx expo start
```

- Press `w` for web preview, or scan QR with Expo Go.
- Native IAP needs a **dev client / EAS build** (stub purchases work in Expo Go).

## What’s in this slice

| Area | Status |
| --- | --- |
| Home / Play / Shop / Settings | Done |
| Soft TD loop (5 waves, 3 towers, upgrades, sell) | Playable vertical slice |
| Clarity Pass subscription + cosmetics + boost | Product IDs + stub IAP |
| Privacy / Terms placeholders | In-app + `docs/` |
| EAS Build / Submit path | `eas.json` + `docs/EAS_BUILD.md` |

Full 8-wave Roblox parity, richer FX, and native StoreKit/Play Billing wiring remain on the backlog (`docs/APP_BACKLOG.md` at repo root docs).

## Monetization (sensible)

- **Core loop free** — never paywalled abusively
- **Clarity Pass** (`clarity_pass_monthly`) — comfort: hide soft between-run notes, thank-you, theme unlocks
- **Dawn Path / Lantern Towers** — cosmetic packs only
- **Small Clarity boost** — optional +80 Clarity; not required to progress
- Restore purchases in Settings

See `src/iap/products.ts` for StoreKit / Play product IDs.

## Identifiers (placeholders — Femmy confirm)

| | |
| --- | --- |
| iOS bundle | `com.femmy.thoughtdefense` |
| Android package | `com.femmy.thoughtdefense` |
| EAS projectId | set in `app.json` → `extra.eas.projectId` |

## Publish

1. Apple Developer + Google Play Console accounts
2. Create IAP products matching `src/iap/products.ts`
3. `npx eas-cli@latest build --platform all --profile production`
4. `npx eas-cli@latest submit --platform ios|android --profile production`

Details: [`docs/EAS_BUILD.md`](docs/EAS_BUILD.md) · Store copy: [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)
