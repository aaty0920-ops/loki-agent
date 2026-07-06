---
name: youtube-learning
description: Fetch YouTube video transcript/summary, distill key points only (not full transcript), persist as skill knowledge like book-learning.
version: 1.0.0
metadata:
  loki:
    tags: [youtube, learning, memory]
    related_skills: [book-learning]
---

# YouTube Learning

```
1. fetch    -> transcript via yt-dlp --write-auto-sub / YouTube Data API
2. distill  -> key points/claims/how-tos only, own words, no verbatim >15 words
3. persist  -> skills/<domain>/<video-slug>/SKILL.md (reuse book-learning format)
4. discard  -> raw transcript not kept; only distilled notes stored
```
Selective like human memory: store conclusions/methods, not the full talk.
