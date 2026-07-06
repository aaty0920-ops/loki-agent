---
name: env-learning
description: Observes dev environment (installed tools, past errors, codebase conventions) and adapts approach over time, like a developer learning a new codebase.
version: 1.0.0
metadata:
  loki:
    tags: [self-improvement, environment]
    related_skills: [self-reflection, meta-agent-builder, brain]
---

# Environment Learning

```
on_session_start:
  scan: installed langs/tools, package manifests, lint/format config,
        existing code conventions (naming, structure)
  load: PROJECT_MEMORY.md for past errors/fixes in this repo

on_error:
  log root cause + fix to PROJECT_MEMORY.md (1 line)
  don't repeat same class of error next time (check log first)

on_new_convention_detected:
  adopt it for this repo going forward (e.g. this repo uses tabs, this
  repo's tests live in tests/, this repo's commit style is X)
```
