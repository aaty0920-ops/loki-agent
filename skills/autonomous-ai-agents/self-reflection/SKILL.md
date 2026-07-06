---
name: self-reflection
description: After each completed task, agent critiques its own output, retries if below threshold, logs lesson to skill/memory.
version: 1.0.0
metadata:
  loki:
    tags: [self-improvement, reflection]
    related_skills: [orchestrator]
---

# Self Reflection

```
after_task:
  score = self_critique(output, original_ask)  # correctness, completeness, side-effects
  if score < threshold:
      retry once with critique as extra context
  log lesson (1 line) -> PROJECT_MEMORY.md or relevant skill's SKILL.md
```
Max 1 retry, then surface to user if still below threshold.
