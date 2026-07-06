# Loki Capabilities Map

| Claimed capability | Maps to |
|---|---|
| Advanced reasoning | model choice (`loki model`) - not a skill, pick a stronger model |
| Expert coding | github-code-review, systematic-debugging, subagent-driven-development |
| Long-running agents, error recovery | orchestrator, self-reflection, brain |
| Large context / doc analysis | ocr-and-documents, book-learning |
| Research/synthesis | research-paper-writing skill + web_search |
| Financial analysis | india-markets |
| Tool use / deciding when to search | brain (routes via orchestrator) |
| Adaptive depth | model's own behavior, not configurable via skill |
| Self-checking | self-reflection |
| Planning | orchestrator plan step |
| Computer-use/terminal | computer-use, bash/terminal already in cli.py |

Note: context window is whatever the underlying model provides (currently
up to ~1M tokens on some models, not 1B, not 10M) — not something this
repo can change. Don't advertise a token count Loki doesn't control.
