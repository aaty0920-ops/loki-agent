---
name: meta-agent-builder
description: Builds/improves subagents better than current one — generates skill/orchestrator configs, benchmarks, keeps winners. Load for "build a better agent" requests.
version: 1.0.0
metadata:
  loki:
    tags: [meta, self-improvement, agent-generation]
    related_skills: [orchestrator, self-reflection, skill-creator]
---

# Meta Agent Builder

```
1. baseline   -> run current orchestrator+skills on eval task set, record score
2. generate   -> propose N variant configs (new skill combos, different
                  decision policy in orchestrator, new subagent roles)
3. test       -> run each variant on same eval set (skill-creator eval pattern)
4. select     -> keep variant(s) beating baseline; discard rest
5. promote    -> write winning config as new skill/orchestrator version,
                  log diff to PROJECT_MEMORY.md
6. repeat     -> loop with new baseline = latest winner
```

Bound: still can't self-authorize destructive/credentialed actions (see
orchestrator decision policy) — improvement loop only touches skill
configs/prompts/code, never removes existing safety checks.
