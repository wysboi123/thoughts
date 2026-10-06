# Agent research — Thought Defense upgrade UI + soft goals

Date: 2026-09-30  
Sources: Context.dev web-search (not Perplexity). Femmy can still paste Perplexity answers for Q-001–005.

## Upgrade UI findings

Roblox TD creators commonly put **inspect → explicit Upgrade** in a dedicated panel or bar rather than silent click-to-upgrade ([TD Upgrade UI feedback](https://devforum.roblox.com/t/feedback-needed-for-td-upgrade-ui/3295956); [unit selection GUI walkthrough](https://www.youtube.com/watch?v=AwwldSvvDhI); [working upgrade button walkthrough](https://www.youtube.com/watch?v=aTohMm0JSfA)). Feedback also stresses **clear first-session indications** so players are not confused at spawn ([TD game feedback](https://devforum.roblox.com/t/feedback-on-my-tower-defense-game/4066259)).

Mobile guidance: prefer press-down registration and familiar control placement ([mobile buttons](https://devforum.roblox.com/t/the-correct-way-to-design-mobile-buttons/2494558)).

### Recommendation for Femmy’s A/B/C vote

Prefer **B — Context bar** as default if she wants a quick call:
- Least HUD churn (matches “UI button ok” without a heavy side panel)
- Cost/level sit next to the existing tray
- Still leaves room to grow into A (full panel) later

A is better if she wants stats education on first select. C is fine if she wants zero new chrome.

## Soft goals / retention findings

Short, visible session goals and a clear first action in the opening seconds improve stickiness ([first 2 minutes hook](https://www.spaceport.xyz/blog/how-to-hook-players-in-the-first-2-minutes-game-retention-tips-for-roblox-devs); [session time suggestions](https://devforum.roblox.com/t/suggestions-to-improve-average-session-time-day-1-retention/2935525); [retention tracking anecdote](https://www.reddit.com/r/robloxgamedev/comments/1sakqj4/i_tracked_retention_on_my_roblox_game_for_3/)). SoftGoals checklist is the chill-line fit for Thought Defense without combat pressure.

## Applied in code (this batch)

- SoftWelcome + SoftGoals on Thought Defense client
- GoalProgress remotes for plant / clear / wave1 / upgrade / clearMind
- RestartRun after win/lose (“Try again”)

## Still blocked

Upgrade **chrome** for A/B/C — waiting on Femmy vote.
