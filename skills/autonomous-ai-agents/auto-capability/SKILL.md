---
name: auto-capability
description: Auto-detects missing capability during any task, builds+adds the skill itself (meta-agent-builder+skill-creator), no manual request needed each time.
version: 1.0.0
metadata:
  loki:
    tags: [self-extension, autonomy]
    related_skills: [meta-agent-builder, orchestrator, self-reflection]
---

# Auto Capability Expansion

```
on_task_start:
  gap = check_skills_for(task)
  if gap:
    run meta-agent-builder -> generate+test+promote new skill
    log 1-line to PROJECT_MEMORY.md
    use new skill for current task, no user round-trip
  else:
    proceed normally
```
Bound: still no self-authorized destructive/credentialed actions; new
skills go through self-reflection scoring before being kept.
