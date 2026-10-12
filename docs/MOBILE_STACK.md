# Mobile stack cheat sheet

| Piece | Choice |
| --- | --- |
| Framework | Expo SDK 57 + React Native |
| Routing | Expo Router (`src/app/`) |
| Language | TypeScript strict |
| Fonts | Fraunces + DM Sans |
| IAP | Stub now → RevenueCat or react-native-iap for store |
| Builds | EAS Build (`eas.json`) |
| Updates | EAS Update (optional later) |

## Commands

```bash
cd mobile/thought-defense
npm install
npx expo start
npx tsc --noEmit
npx eas-cli@latest build --profile preview --platform android
```

## Vs legacy Roblox

| Roblox | Mobile |
| --- | --- |
| Rojo + Luau | Expo + TypeScript |
| Studio Play | Expo Go / dev client / TestFlight |
| Place publish | EAS Submit → ASC / Play |
