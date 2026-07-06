---
name: india-markets
description: TradingView charts, Angel One API orders, risk calc, trade journal, backtesting for NSE/BSE.
version: 1.0.0
metadata:
  loki:
    tags: [trading, tradingview, angelone, backtest]
---

# India Markets Trading

- Charts/indicators: TradingView widget embed or `tvdatafeed` for OHLC pull
- Orders: Angel One SmartAPI (`smartapi-python`), auth via TOTP+API key
- Risk calc: position_size = (account_risk% * capital) / (entry - stoploss)
- Trade journal: append each trade {time, symbol, entry, exit, pnl, reason} to trades.csv/SQLite
- Backtest: vectorbt or backtrader against historical OHLC, report win_rate/sharpe/max_drawdown
- News/sentiment: reuse existing web_search + news skill, no new tool needed

## Config
```yaml
trading.broker: angelone
trading.paper_mode: true       # default; live orders need explicit confirm
trading.ui_mode: false         # true = browse broker/TradingView UI via browser_tool
                                #        for charts/screener/watchlist/analysis only,
                                #        never clicks Buy/Sell regardless of paper_mode
```

## Extra
- F&O: option-chain pull + Greeks (delta/theta/vega) via mibian/py_vollib
- Multi-broker fallback: Zerodha Kite / Upstox if AngelOne API down
- Price/indicator alerts -> cron skill -> gateway delivery (Telegram/Discord)
- Portfolio correlation check before new trade (avoid overexposure to same sector)

## Data sources (web + APIs)
- Live OHLCV/depth/OI: broker API (AngelOne/Zerodha/Upstox) or yfinance/nsepy fallback
- News/sentiment: web_search + news skill + Fear&Greed index scrape
- Fundamentals (P/E, EPS, debt, insider/institutional): screener.in / moneycontrol via browser_tool scrape when no API
- Economic calendar/earnings: investing.com or tradingeconomics scrape via browser_tool
- Social sentiment: X/Twitter search tool

## Indicators (compute via pandas-ta/ta-lib)
RSI, MACD, EMA(20/50/100/200), SMA, Bollinger, Supertrend, ATR, ADX,
StochRSI, Ichimoku, PSAR, OBV, CMF, MFI, CCI, Donchian, Keltner

## Price action / SMC / ICT
Support/resistance, trendlines, channels, breakout+retest, HH/LL,
swing points, liquidity zones, order blocks, FVG, liquidity sweep,
BOS/CHoCH, equal highs/lows, premium/discount zones, kill zones, OTE

## Candlestick patterns
Doji, Hammer, Shooting Star, Engulfing, Morning/Evening Star, Harami,
3 White Soldiers/Black Crows, Pin Bar (via TA-Lib pattern functions)

## Elliott Wave + Fibonacci
Auto wave count + Fib validation; retracement/extension/time-zone/fan tools

## Volume
Volume profile, delta volume, CVD, volume spikes/imbalance

## Multi-timeframe
Run full stack across 1m/5m/15m/1H/4H/D/W/M, weight higher TF more

## ML layer
LSTM/Transformer/XGBoost/RandomForest/RL ensemble -> trend + probability
+ confidence score; retrain periodically on new trade outcomes (continuous learning)

## Explainable output (required format)
```
Trend, Confidence%, Entry, SL, Target1/2, R:R
Reasons: [indicator/pattern hits that support it]
Risks: [invalidating conditions, upcoming events, volatility]
Suggested Action
```
No certainty claims — probabilistic estimate only, always show invalidation conditions.

## Psychology assistant
Flag revenge-trading/overtrading patterns from trade journal; periodic performance review

## Backtesting
Historical + walk-forward + Monte Carlo via vectorbt/backtrader; compare strategies

