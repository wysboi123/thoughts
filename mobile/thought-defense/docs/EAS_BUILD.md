# EAS Build & Submit

Thought Defense ships with Expo Application Services. Secrets are **not** in this repo.

## One-time Femmy setup

1. Install EAS CLI: `npm i -g eas-cli` (or use `npx eas-cli@latest`)
2. `eas login` with Expo account
3. From `mobile/thought-defense`: `eas init` → paste project id into `app.json` → `extra.eas.projectId`
4. Confirm bundle / package ids (defaults: `com.femmy.thoughtdefense`)
5. Apple: App Store Connect app + IAP products (see `src/iap/products.ts`)
6. Google: Play Console app + same product ids (Android column)
7. Optional: RevenueCat or `react-native-iap` — set `IapService.stubMode = false` after wiring

## Profiles (`eas.json`)

| Profile | Use |
| --- | --- |
| `development` | Dev client + iOS simulator |
| `preview` | Internal APK / device builds for testers |
| `production` | Store AAB / IPA; autoIncrement |

## Build

```bash
cd mobile/thought-defense
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest build --platform android --profile production
# or
npx eas-cli@latest build --platform all --profile production
```

## Submit

```bash
npx eas-cli@latest submit --platform ios --profile production
npx eas-cli@latest submit --platform android --profile production
```

Android submit expects `secrets/google-play-service-account.json` (gitignored).  
iOS submit needs App Store Connect API key via `eas credentials` or `ascAppId` in `eas.json`.

## IAP before review

- Create subscription group **Clarity Pass** + monthly product
- Create non-consumables Dawn / Lantern
- Create consumable Clarity boost
- Sandbox / license testers: purchase + **Restore purchases**
- Replace Privacy / Terms placeholders with final legal URLs in store listing

## Local without credentials

Stub IAP persists entitlements on device. Do **not** submit a build that only supports stub mode.
