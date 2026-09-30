# Publish checklist — Thought Defense mobile (Femmy)

Replace the old Roblox Studio checklist. Goal: App Store + Google Play.

## First 30 minutes — accounts

1. Apple Developer Program enrollment (paid)
2. Google Play Console enrollment (paid one-time)
3. Expo account + `eas login`
4. Confirm bundle / package: `com.femmy.thoughtdefense` (or your choice — tell agents)

## Create store apps

1. App Store Connect → new app → name **Thought Defense**
2. Play Console → create app → same name
3. Paste listing copy from [`EXPERIENCE_COPY.md`](EXPERIENCE_COPY.md) + `mobile/thought-defense/docs/STORE_LISTING.md`

## IAP products (exact ids)

| Logical | iOS product id | Android product id | Type |
| --- | --- | --- | --- |
| Clarity Pass | `com.femmy.thoughtdefense.clarity_pass.monthly` | `clarity_pass_monthly` | Auto-renewable sub |
| Dawn Path | `com.femmy.thoughtdefense.cosmetic.dawn` | `cosmetic_dawn` | Non-consumable |
| Lantern Towers | `com.femmy.thoughtdefense.cosmetic.lantern` | `cosmetic_lantern` | Non-consumable |
| Clarity boost | `com.femmy.thoughtdefense.boost.clarity_small` | `clarity_boost_small` | Consumable |

## EAS

```bash
cd mobile/thought-defense
npx eas-cli@latest init   # paste projectId into app.json
npx eas-cli@latest build --platform all --profile preview
# after sandbox IAP works:
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios --profile production
npx eas-cli@latest submit --platform android --profile production
```

Full notes: `mobile/thought-defense/docs/EAS_BUILD.md`

## Before submit

- [ ] Host Privacy + Terms HTTPS URLs
- [ ] Screenshots (phone + optional tablet)
- [ ] Native IAP (not stub-only)
- [ ] Restore purchases tested in sandbox
- [ ] Age rating / content questionnaire
- [ ] Paste store URLs into [`PUBLISH_STATUS.md`](PUBLISH_STATUS.md)

## Don't commit

- ASC API keys, Play service accounts, `.p8` / `.jks`, `.env` secrets
