---
name: game-play
description: Play games (chess, ludo, GTA-style, Minecraft, battle royale) via computer_use vision+input loop. Load for "play <game>" requests.
version: 1.0.0
metadata:
  loki:
    tags: [gaming, computer-use, vision]
    related_skills: [computer-use, orchestrator]
---

# Game Play

## Generic loop (reused across all games)
```
1. capture   -> computer_use(action="capture", mode="vision")
2. state     -> parse frame: board/HUD/inventory/health/position
3. decide    -> game-specific policy (below)
4. act       -> computer_use(action="key"/"click"/"drag", ...)
5. verify    -> re-capture, confirm expected state change
loop until game_over or user stops
```

## Per-game policy
- **Chess**: parse board -> FEN -> external engine (stockfish if available,
  else move-heuristic) -> best move -> click piece, click target square
- **Ludo**: parse dice+token positions -> rule-based (prioritize: capture >
  safe-square > farthest-along-safe > random)
- **GTA-style / open-world**: HUD (health/ammo/map) + nearest-objective
  detection -> pathing via minimap -> keyboard(WASD)+mouse(aim) actions
- **Minecraft**: parse hotbar/health/hunger + surroundings -> task queue
  (mine/build/craft/fight) -> keyboard+mouse actions
- **Battle royale**: priority = survive > loot > position (safe zone) >
  engage only if favorable (health/weapon advantage)

## Limits
- Turn-based games (chess/ludo): fully autonomous fine.
- Real-time games: latency-bound by capture+decide+act loop; expect
  reaction time worse than a human at fast reflexes, competitive at
  planning/strategy.
- Respects each game's ToS re: automation/bots — user's responsibility
  to check before use in multiplayer/ranked modes.
