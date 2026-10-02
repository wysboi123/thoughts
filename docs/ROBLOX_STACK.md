# Roblox stack (this repo)

## Why filesystem-first

OpenClaw / Cursor agents edit files. Roblox Studio is still required to Play-test visually and publish. **Rojo** bridges both.

```
Agent edits Luau on disk  →  rojo serve  →  Studio plugin sync  →  Play / Publish
```

## Toolchain

| Tool | Job |
| --- | --- |
| [Rokit](https://github.com/rojo-rbx/rokit) | Pin Rojo / Wally / Lune versions |
| [Rojo](https://rojo.space) | Sync `src/` ↔ Studio DataModel |
| [Wally](https://wally.run) (optional) | Luau packages |
| [Selene](https://kampfkarren.github.io/selene/) | Lint |
| [StyLua](https://github.com/JohnnyMorganz/StyLua) | Format |
| Roblox Studio | Build maps, Play, Publish |

## Project layout (every game)

```
games/<slug>/
  default.project.json   # Rojo tree → DataModel
  rokit.toml             # tool pins
  README.md              # play / publish steps
  src/
    shared/              # ModuleScripts (ReplicatedStorage)
    server/              # Scripts (ServerScriptService)
    client/              # LocalScripts (StarterPlayerScripts)
```

## Luau rules we follow

- Prefer `.luau` extensions
- Use `task.wait` / `task.spawn` / `task.delay` (never legacy `wait` / `spawn`)
- Server = authority; client = input + presentation
- Remotes live in a single `Remotes` module under shared
- Type-annotate public module APIs when it helps clarity

## Publish path

1. `rojo build -o Game.rbxl` (or live `rojo serve`)
2. Studio → **File → Publish to Roblox**
3. Optional later: Open Cloud API key for CLI upload (`rojo upload`) — Femmy holds secrets

## Agent limits in this Cloud VM

No GUI Studio here. I ship complete source + build instructions. Femmy (or a future Studio-capable node) presses Play and Publish.
