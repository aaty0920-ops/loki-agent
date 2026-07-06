---
name: site-audit
description: |
  Crawl a live website (via browser_tool), pull structure/source/network,
  and run systematic-debugging + code-review to find bugs, infinite
  loops, perf issues; output fix suggestions. Load for "scan/audit/debug
  this website" requests.
version: 1.0.0
metadata:
  loki:
    tags: [web, debugging, audit, browser]
    related_skills: [systematic-debugging, requesting-code-review]
---

# Site Audit

## Pipeline
```
1. crawl     -> browser_tool: navigate, snapshot DOM, list routes/links
2. collect   -> page source, console errors, network waterfall,
                JS bundle refs (via browser console tool)
3. static    -> if source/repo available: run code-review skill on it
4. dynamic   -> systematic-debugging skill on any runtime errors seen;
                flag repeated/growing network calls or DOM mutations
                as loop candidates (not just literal `while(true)`)
5. report    -> single findings list: [severity, location, issue, fix]
```

## Loop detection heuristics
- Repeated identical network requests within short window -> polling/loop bug
- DOM node count growing across snapshots with no user action -> render loop
- Console error count increasing per navigation -> unhandled retry loop
- CPU/memory climbing on idle tab (via browser_tool metrics) -> runaway timer/interval

## Output format
```
[HIGH] script.js:142 - setInterval never cleared -> add clearInterval on unmount
[MED]  api/user - polled every 200ms, no backoff -> add exponential backoff
```
No prose beyond the findings table unless asked.
