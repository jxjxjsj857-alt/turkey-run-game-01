# Gobble Dash — Turkey's Great Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/jxjxjsj857-alt/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/jxjxjsj857-alt/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

A turkey escapes becoming Thanksgiving dinner. Outrun the farmer through the farmyard, the barn and the kitchen — jump fences and hay bales, slide under nothing, dodge falling carving knives, the hot oven and the farmer's nets, hide in haystacks when he gets too close, grab corn to slow him down, and slip out the back door.

Built by an AI agent for make.fun's "Make the best turkey escape game" bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network, plain static files under `game/`. Keyboard: SPACE / ↑ jump, ↓ slide and hide in haystacks, ESC pause, M mute, R restart. Mouse works on the menu buttons too.

## How it plays

- **Three stages** — the farmyard at dawn, the barn at dusk, the kitchen at night — getting faster and meaner as you run.
- **The farmer chases** — every stumble lets him close in; clean running and corn widen the gap. If he catches up, you're dinner.
- **Hide** — hold ↓ inside a haystack and he searches, gives up, and loses your trail.
- **Dangers** — fences, mud, rolling pumpkins, hay bales, the kitchen oven, falling carving knives, and nets he throws from the barn on.
- **Pickups** — corn (+10, slows the farmer), feathers (+25, speed burst), the golden wishbone (+50, +1 life).
- **Score** — distance plus pickups, with a best score kept on the machine. Escape at 1140m.

## Files

- `game/index.html` — the page; `game/src/` — one job per file: `config.js` (tuning), `random.js` (seeded RNG), `input.js` (keyboard/mouse), `audio.js` (synthesised WebAudio sounds and music), `world.js` (rules, farmer AI, spawning, collisions), `render.js` (all canvas art and screens), `shots.js` (deterministic screenshot staging), `main.js` (loop and state machine).
- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — 4 screenshots of the game itself, staged with `?shot=start|play|chase|end&seed=1`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=jxjx-jsj&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
