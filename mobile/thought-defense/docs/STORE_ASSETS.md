# Store listing assets — placeholders

Fill these before App Store / Play submit. Paths are under `mobile/thought-defense/assets/` unless noted.

## App icon & splash (Expo already wired in `app.json`)

| Asset | Spec | Status |
| --- | --- | --- |
| `assets/icon.png` | 1024×1024 app icon | placeholder — replace with final art |
| `assets/splash-icon.png` | centered mark on `#D8E8E4` | placeholder |
| `assets/android-icon-foreground.png` | adaptive foreground | placeholder |
| `assets/android-icon-background.png` | adaptive background | placeholder |
| `assets/android-icon-monochrome.png` | Android 13+ monochrome | placeholder |
| `assets/favicon.png` | web favicon | placeholder |

## Screenshots (capture per `SCREENSHOTS.md`)

| Slot | Device frame | File placeholder |
| --- | --- | --- |
| 1 Home brand | iPhone 6.7" / Pixel | `store/screenshots/01-home.png` (to capture) |
| 2 Mid-wave board | same | `store/screenshots/02-play.png` |
| 3 Clarity shop | same | `store/screenshots/03-shop.png` |
| 4 Settings + Restore | same | `store/screenshots/04-settings.png` |

Create `assets/store/screenshots/` when capturing; do not commit medical/therapy framing.

## Feature graphic / promo (Play)

| Asset | Spec | Status |
| --- | --- | --- |
| Play feature graphic | 1024×500 | TODO — soft mint path + Peace Core |
| App Store promo video | optional | skip for v1 |

## Copy links

- Listing text → `STORE_LISTING.md`
- Privacy / Terms → host public HTTPS URLs (stubs in-repo)
- Bundle id confirm → Femmy (`com.femmy.thoughtdefense`)
