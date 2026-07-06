---
name: governance
description: Audit log, run history, approval gates, cost/budget awareness - closes the observability/governance gaps common in autonomous agent stacks.
version: 1.0.0
metadata:
  loki:
    tags: [audit, safety, observability]
    related_skills: [orchestrator, secrets-management, self-reflection]
---

# Governance

## Audit log (every run)
```
run_id, timestamp, task, tools_called, files_changed, cost_estimate,
outcome, confidence -> append to PROJECT_MEMORY.md or logs/runs.jsonl
```

## Approval gates (already true elsewhere, consolidated here)
- Destructive/credentialed actions (deploy, delete, payment, live trade
  order, first-time site login) -> confirm first, every time.
- IAM/infra/network changes if ever added -> always confirm, no exception.

## Cost awareness
- If any cloud/API usage has per-call cost (LLM tokens, paid APIs):
  estimate + log cost per run; flag if a single task exceeds a
  configurable threshold before continuing.

## Failure visibility
On error: log root cause (not just "failed"), which step, what was
tried, so next run doesn't repeat blind.
