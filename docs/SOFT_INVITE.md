# Soft invite prompt (post-publish only)

Prep note for intentional co-play days. **Do not wire in live places until Femmy pastes a Place URL into `PUBLISH_STATUS.md`.**

## Why

Creator Hub ranks **intentional co-play days** as Important for Recommended for You. SoftCompany already rewards friends who are near. Soft invite helps friends join on purpose (join / invite / private server) — not matchmaking.

## Gate

1. First Studio publish of at least one active place (Haze recommended)
2. Place URL + Place ID in `PUBLISH_STATUS.md`
3. Then implement SoftInvite behind an explicit enable flag

## Planned API (do not invent Notification assets yet)

Shared module sketch (future `packages/chill/SoftInvite.luau`):

- Call only after soft-complete or SoftCompany **first-arrive** (not OnDeparted — leave is for stay toast)
- Use `SocialService:CanSendGameInviteAsync` / `PromptGameInvite` patterns from Creator Hub
- Soft copy only — never spam; once per session max
- No hologram / hard CTA clutter in first viewport
- Prefer after SoftCompany company-welcomed toast fades (~4s), not stacked with DepartTextFn

## Copy hooks (when enabled)

- Haze: “vibes sync softer with a friend nearby”
- Bus: “waiting together is nicer with company”
- Porch: “the jar remembers company”
- Couch: “two worlds · invite someone soft”

## Blocked until

- Femmy first publish
- Optional: Perplexity Q-001 social UX notes if pasted
