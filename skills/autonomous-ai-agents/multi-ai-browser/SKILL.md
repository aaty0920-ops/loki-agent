---
name: multi-ai-browser
description: Uses browser_tool to submit prompts to claude.ai/chatgpt.com/aistudio.google.com/gemini.google.com web UIs, copy responses back, offloading work to save local tokens.
version: 1.0.0
metadata:
  loki:
    tags: [browser, multi-ai, token-saving]
    related_skills: [computer-use]
---

# Multi-AI Browser

```
1. open target (claude.ai / chatgpt.com / aistudio.google.com / gemini.google.com) via browser_tool
2. paste prompt into input
3. wait for response render
4. copy response text
5. paste into local file / feed into current task
```

## Use when
Large one-off generation (long doc draft, big code dump) that doesn't
need Loki's tool access - do it there, paste result back, saves tokens
here for orchestration/decision work instead.

## Limits
- Each site's own ToS applies to automated use of its consumer web UI -
  check each provider's terms before running this unattended/at scale;
  this skill doesn't bypass logins, CAPTCHAs, or rate limits.
- Not a substitute for API calls when you need structured/reliable output.
