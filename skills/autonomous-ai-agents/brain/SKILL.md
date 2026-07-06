---
name: brain
description: Always-active default layer - every command auto-routes through orchestrator (plan/decide) + auto-capability (fill gaps) + self-reflection (check/retry), no explicit skill invocation needed.
version: 1.0.0
metadata:
  loki:
    tags: [core, always-on, default]
    related_skills: [orchestrator, auto-capability, self-reflection, meta-agent-builder]
---

# Brain (default layer, always loaded)

```
on_any_input:
  1. orchestrator.plan(input)      -> decompose if multi-step
  2. auto-capability.check(plan)   -> build missing skill if gap found
  3. dispatch(plan)                -> subagents / direct tool calls
  4. self-reflection.score(output) -> retry once if below threshold
  5. respond                       -> minimal, no meta-narration
```

No per-task "which skill should I use" step for the user — this layer
picks and chains skills itself. User just states the goal.

Still bounded by: no destructive/credentialed action without confirm,
no exploit/malware code, no safety-check removal — same as every
other skill in this repo.
