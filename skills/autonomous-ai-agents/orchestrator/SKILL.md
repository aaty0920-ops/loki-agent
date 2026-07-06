---
name: orchestrator
description: |
  One command -> decompose into subtasks -> spawn parallel subagents ->
  merge results -> decide next step. Load for any multi-step/"do
  everything" request instead of asking user to sequence it.
version: 1.0.0
metadata:
  loki:
    tags: [subagent, planning, autonomy]
    related_skills: [subagent-driven-development, human-loop]
---

# Orchestrator

## Loop
```
1. plan    -> break command into independent subtasks (DAG, not list)
2. spawn   -> subagent per independent branch (existing subagent RPC)
3. gate    -> each subagent returns: result, confidence, blockers
4. decide  ->
     confidence high + no blockers -> merge, continue
     blockers exist               -> spawn fix-subagent, retry once
     confidence low                -> surface single question, else pick
                                       safest default and proceed
5. merge   -> combine outputs, dedupe overlapping edits
6. log     -> append 1-line summary per subtask to PROJECT_MEMORY.md
```

## Decision policy
- Prefer parallel over sequential when subtasks don't share files.
- Serialize subtasks touching the same file to avoid merge conflicts.
- Max 1 retry per failed subtask before surfacing to user.
- Never spawn a subagent for anything requiring credentials/destructive
  action (deploy, delete, payment) without explicit confirm.

## Command
```
run(command) -> plan[] -> dispatch -> decide -> report: "<N> subtasks, <M> done, <K> blocked: <reason>"
```
