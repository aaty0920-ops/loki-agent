---
name: market-intelligence
description: Full AI Market OS - equities/MF/F&O/macro data + web/browser research engine + sentiment/narrative + fundamental/technical/quant engines. Extends india-markets. Load for deep company/market research requests.
version: 1.0.0
metadata:
  loki:
    tags: [trading, research, web-intelligence, sentiment]
    related_skills: [india-markets, site-audit, book-learning, orchestrator]
---

# Market Intelligence Engine

Reuses existing infra, doesn't duplicate: browser_tool (site-audit skill),
web_search, ocr-and-documents (filings/PDFs), orchestrator (multi-step),
book-learning pattern (distill not dump), openrouter_rotation.py (LLM calls).

## Data tiers (source credibility)
```
Tier 1 (primary, trust first): company IR pages, NSE/BSE/SEBI/RBI/AMFI filings, AMC scheme docs
Tier 2 (context): Reuters, ET Markets/Moneycontrol/Mint/CNBC
Tier 3 (low-weight): broker notes, blogs, social/forum sentiment
Rule: Tier 1 overrides Tier 2/3 on conflict. Always show source+timestamp.
```

## Engines (each = a distinct decide-step in orchestrator plan)
```
1. Market Data      -> OHLCV, depth, VWAP, OI, corporate actions (broker API/yfinance)
2. Fundamental       -> financials, ratios, red-flag detector, company scorecard
3. Technical         -> full indicator set (see india-markets) + market structure
4. F&O               -> option chain, Greeks, IV/IV-rank, OI buildup classification
5. Mutual Fund       -> overlap, style drift, rolling returns, factsheet parse
6. Web/Browser Research -> company site, filings, transcripts, news (browser_tool)
7. Sentiment/Narrative  -> news/social tone, company-vs-market narrative divergence
8. Portfolio/Risk    -> VaR, drawdown, concentration, factor exposure
9. Macro            -> CPI/repo/GDP/policy -> sector impact mapping
```

## Research modes
```
quick        -> DB/cache only
verified     -> DB + recent cached docs/news
deep         -> live browse: IR page -> filings -> transcripts -> news -> peers
             -> output: Company Intelligence Pack (business summary, quarter
                highlights, guidance change, risks, bull/bear thesis)
```

## "Why did it move" workflow
price/volume/OI move -> check filings (same day) -> check news -> check
sector/peer move -> check macro calendar -> rank probable causes by confidence

## Storage (distilled, not raw — same principle as book-learning)
```
source_registry   : known IR/filing/AMC URLs per entity (don't re-search from zero)
web_documents      : fetched doc metadata + clean_text (not full HTML dump)
document_events    : extracted event+sentiment+confidence, not raw article
entity_timelines   : chronological events per company/fund/sector
research_runs      : query, sources used, answer, confidence (audit trail)
```
Store facts + citations, discard raw scraped bulk after extraction.

## Output format (always)
```
Snapshot: trend, confidence%, valuation, event risk
Fundamental view / Technical view / F&O view (as applicable)
Key triggers, Risk factors (incl. invalidating conditions)
Facts vs AI interpretation, kept separate
```

## Guardrails
- Official filing > news article on any conflict.
- Never fabricate undisclosed data — say "not disclosed."
- No auto-execution from headlines/sentiment alone (decision-support only).
- Probabilistic language only ("likely", "X% historical win rate") — never
  certainty claims. Not financial advice.

## Config
```yaml
market_intel:
  llm_provider: openrouter          # uses providers/openrouter_rotation.py
  search_api: tavily                # or serpapi - set SEARCH_API_KEY in .env
  research_default_mode: verified
```
