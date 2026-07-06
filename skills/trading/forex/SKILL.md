---
name: forex
description: Forex-specific engine - currency strength, session model, central bank tone, event surprise, correlation, playbooks. Extends market-intelligence for FX pairs.
version: 1.0.0
metadata:
  loki:
    tags: [forex, fx, macro]
    related_skills: [market-intelligence, india-markets]
---

# Forex

Reuses market-intelligence's 9 engines (data/fundamental/technical/sentiment/
macro/risk) + india-markets indicators. This adds FX-only layers.

## Currency strength engine
Per currency: policy rate path, inflation/growth surprise, CB tone,
yield differential, risk-sensitivity -> single strength score.
Pair bias = strength(base) - strength(quote).

## Central bank tone classifier
Fed/ECB/BOE/BOJ/RBA/RBNZ/SNB/BOC statements -> hawkish/dovish/neutral +
shift-vs-last-meeting, via web_search + browser_tool on official CB sites.

## Event surprise model
actual vs forecast (CPI/NFP/GDP/PMI) -> surprise magnitude -> currency impact map.

## Session model
Sydney/Tokyo/London/NY/overlap -> per-pair typical behavior + breakout
probability by session (learned from backtest, not assumed).

## Correlation/exposure monitor
Flag hidden same-currency exposure across multiple open "different" pairs
(e.g. long EUR/USD + GBP/USD + AUD/USD = triple short USD).

## Strategy families (start with 3, not all)
trend-pullback, breakout, event-driven-macro (session/mean-reversion/regime-hybrid = later)

## Score model (100pt, reuse pattern from india-markets)
macro 30 + technical 25 + session/vol 10 + sentiment 10 + risk 10 + pattern 15
A-grade 80+, tradable 65-79, watchlist 50-64, avoid <50

## Output (FACT vs INTERPRETATION, mandatory)
```
FACT: price, session, trend, S/R, event calendar next 24h, indicator state
INTERPRETATION: bias, why, invalidation, strategy fit, confidence
TRADE PLAN: entry/SL/TP1/TP2, RR, event warnings
NO-TRADE: spread wide / event in <30min / range unbroken
```

## App use (view-only, like india-markets ui_mode)
Browse MT4/MT5/TradingView/broker FX app via browser_tool for charts/
calendar/quotes - never places orders unless explicit live-mode confirm.

## Guardrails
No trade sizing/execution advice presented as certain; probabilistic only.
Position sizing always risk-gated (fixed-fractional %, daily/weekly caps).
