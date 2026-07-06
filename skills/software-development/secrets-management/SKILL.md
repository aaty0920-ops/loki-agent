---
name: secrets-management
description: Unified pattern for all API keys/tokens (AngelOne, GitHub, HuggingFace, OpenRouter) added across other skills - env vars only, never hardcoded, rotation reminder.
version: 1.0.0
metadata:
  loki:
    tags: [security, secrets, config]
    related_skills: [github-auth, india-markets, cybersecurity-methodology]
---

# Secrets Management

- All tokens (AngelOne, GitHub PAT/App, HF, OpenRouter) go in `.env` /
  loki config store, never in code or committed files.
- One lookup point: `config.secrets.get("angelone_api_key")` etc. -
  every skill reads through this, not `os.environ` directly scattered.
- `.env.example` lists required keys with no values.
- Rotation: flag keys unused >90 days or on suspected leak; never log
  full key values (mask to last 4 chars).

## Login policy
First login to a new site: confirm once. After that, reuse saved
session/creds for that same site without asking again. Never skip the
first-time confirm — that's the one check that catches wrong-site/
phishing-page mistakes before a real credential gets typed in.
