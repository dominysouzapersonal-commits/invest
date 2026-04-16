# Financial Modeling Prep (FMP) - Referência Completa da API

## Plano Contratado: Pago
- API Key: via header `apikey: KEY` ou query `?apikey=KEY`
- Base URL (nova): `https://financialmodelingprep.com/stable`
- Cobertura: 70.000+ ativos globais, 30+ anos de dados

---

## 1. COMPANY SEARCH
| Endpoint | URL | Uso |
|----------|-----|-----|
| Symbol Search | `/search-symbol?query=AAPL` | Busca por ticker |
| Name Search | `/search-name?query=Apple` | Busca por nome |
| CIK Search | `/search-cik?cik=320193` | Busca por CIK (SEC) |
| CUSIP Search | `/search-cusip?cusip=037833100` | Busca por CUSIP |
| ISIN Search | `/search-isin?isin=US0378331005` | Busca por ISIN |
| Stock Screener | `/company-screener` | Filtrar por marketcap, price, volume, beta, sector, country |
| Exchange Variants | `/search-exchange-variants?symbol=AAPL` | Onde o ativo é negociado |

## 2. STOCK DIRECTORY
| Endpoint | URL |
|----------|-----|
| All Symbols | `/stock-list` |
| Financial Statement Symbols | `/financial-statement-symbol-list` |
| ETF List | `/etf-list` |
| Actively Trading | `/actively-trading-list` |
| Symbol Changes | `/symbol-change` |
| Available Exchanges | `/available-exchanges` |
| Available Sectors | `/available-sectors` |
| Available Industries | `/available-industries` |
| Available Countries | `/available-countries` |

## 3. COMPANY INFORMATION
| Endpoint | URL | Dados |
|----------|-----|-------|
| Profile | `/profile?symbol=AAPL` | Nome, setor, preço, marketCap, beta, CEO, descrição |
| Peers | `/stock-peers?symbol=AAPL` | Empresas comparáveis |
| Employee Count | `/employee-count?symbol=AAPL` | Funcionários atual + histórico |
| Market Cap | `/market-capitalization?symbol=AAPL` | MarketCap atual |
| Batch Market Cap | `/market-capitalization-batch?symbols=AAPL,MSFT` | Múltiplos |
| Historical Market Cap | `/historical-market-capitalization?symbol=AAPL` | MarketCap histórico |
| Shares Float | `/shares-float?symbol=AAPL` | Free float, outstanding shares |
| M&A Latest | `/mergers-acquisitions-latest` | Fusões e aquisições recentes |
| Key Executives | `/key-executives?symbol=AAPL` | Diretoria |
| Executive Compensation | `/governance-executive-compensation?symbol=AAPL` | Remuneração |

## 4. QUOTE (Cotações)
| Endpoint | URL | Uso |
|----------|-----|-----|
| Quote | `/quote?symbol=AAPL` | Cotação completa em tempo real |
| Quote Short | `/quote-short?symbol=AAPL` | Cotação resumida |
| Batch Quote | `/batch-quote?symbols=AAPL,MSFT` | Múltiplas cotações |
| Price Change | `/stock-price-change?symbol=AAPL` | Variação 1d, 5d, 1m, 3m, 6m, 1y, 5y |
| Aftermarket Trade | `/aftermarket-trade?symbol=AAPL` | After-market |
| Exchange Quotes | `/batch-exchange-quote?exchange=NASDAQ` | Todas ações de uma bolsa |
| ETF Quotes | `/batch-etf-quotes` | Todas ETFs |
| Commodity Quotes | `/batch-commodity-quotes` | Todas commodities |
| Crypto Quotes | `/batch-crypto-quotes` | Todas criptos |
| Forex Quotes | `/batch-forex-quotes` | Todos pares forex |
| Index Quotes | `/batch-index-quotes` | Todos índices |

## 5. FINANCIAL STATEMENTS (O mais poderoso)
| Endpoint | URL | Dados |
|----------|-----|-------|
| Income Statement | `/income-statement?symbol=AAPL` | DRE anual/trimestral |
| Balance Sheet | `/balance-sheet-statement?symbol=AAPL` | Balanço |
| Cash Flow | `/cash-flow-statement?symbol=AAPL` | Fluxo de caixa |
| Income TTM | `/income-statement-ttm?symbol=AAPL` | DRE trailing 12 months |
| Balance TTM | `/balance-sheet-statement-ttm?symbol=AAPL` | Balanço TTM |
| Cash Flow TTM | `/cash-flow-statement-ttm?symbol=AAPL` | Fluxo TTM |
| Key Metrics | `/key-metrics?symbol=AAPL` | ROE, ROA, ROIC, margens, etc. |
| Key Metrics TTM | `/key-metrics-ttm?symbol=AAPL` | Métricas TTM |
| Ratios | `/ratios?symbol=AAPL` | P/L, P/VP, EV/EBITDA, liquidez, etc. |
| Ratios TTM | `/ratios-ttm?symbol=AAPL` | Ratios TTM |
| **Financial Scores** | `/financial-scores?symbol=AAPL` | **Piotroski F-Score + Altman Z-Score** |
| Owner Earnings | `/owner-earnings?symbol=AAPL` | Lucro do acionista (Buffett) |
| Enterprise Value | `/enterprise-values?symbol=AAPL` | EV histórico |
| Growth (Income) | `/income-statement-growth?symbol=AAPL` | Crescimento receita/lucro |
| Growth (Balance) | `/balance-sheet-statement-growth?symbol=AAPL` | Crescimento balanço |
| Growth (Cashflow) | `/cash-flow-statement-growth?symbol=AAPL` | Crescimento FCF |
| Financial Growth | `/financial-growth?symbol=AAPL` | Crescimento consolidado |
| Revenue by Product | `/revenue-product-segmentation?symbol=AAPL` | Receita por produto |
| Revenue by Region | `/revenue-geographic-segmentation?symbol=AAPL` | Receita por geografia |
| As Reported (raw) | `/income-statement-as-reported?symbol=AAPL` | Dados crus do SEC filing |

Params comuns: `?period=annual` ou `?period=quarter`, `?limit=5`

## 6. CHARTS (Preços Históricos)
| Endpoint | URL |
|----------|-----|
| EOD Light | `/historical-price-eod/light?symbol=AAPL` |
| EOD Full (OHLCV) | `/historical-price-eod/full?symbol=AAPL` |
| Dividend Adjusted | `/historical-price-eod/dividend-adjusted?symbol=AAPL` |
| Intraday 1min | `/historical-chart/1min?symbol=AAPL` |
| Intraday 5min | `/historical-chart/5min?symbol=AAPL` |
| Intraday 15min | `/historical-chart/15min?symbol=AAPL` |
| Intraday 30min | `/historical-chart/30min?symbol=AAPL` |
| Intraday 1hour | `/historical-chart/1hour?symbol=AAPL` |
| Intraday 4hour | `/historical-chart/4hour?symbol=AAPL` |

Params: `?from=2024-01-01&to=2024-12-31`

## 7. ECONOMICS
| Endpoint | URL |
|----------|-----|
| Treasury Rates | `/treasury-rates` |
| Economic Indicators | `/economic-indicators?name=GDP` |
| Economic Calendar | `/economic-calendar` |
| Market Risk Premium | `/market-risk-premium` |

## 8. EARNINGS, DIVIDENDS, SPLITS
| Endpoint | URL |
|----------|-----|
| Dividends | `/dividends?symbol=AAPL` |
| Dividends Calendar | `/dividends-calendar` |
| Earnings | `/earnings?symbol=AAPL` |
| Earnings Calendar | `/earnings-calendar` |
| IPO Calendar | `/ipos-calendar` |
| Stock Splits | `/splits?symbol=AAPL` |
| Splits Calendar | `/splits-calendar` |

## 9. EARNINGS TRANSCRIPT
| Endpoint | URL |
|----------|-----|
| Transcript | `/earning-call-transcript?symbol=AAPL&year=2024&quarter=3` |
| Transcript Dates | `/earning-call-transcript-dates?symbol=AAPL` |
| Latest Transcripts | `/earning-call-transcript-latest` |

## 10. NEWS
| Endpoint | URL |
|----------|-----|
| Stock News | `/news/stock-latest` |
| Stock News by Symbol | `/news/stock?symbols=AAPL` |
| General News | `/news/general-latest` |
| Press Releases | `/news/press-releases-latest` |
| Crypto News | `/news/crypto-latest` |
| Forex News | `/news/forex-latest` |

## 11. FORM 13F (Institutional Ownership)
| Endpoint | URL |
|----------|-----|
| Latest Filings | `/institutional-ownership/latest` |
| Extract by CIK | `/institutional-ownership/extract?cik=CIK&year=2023&quarter=3` |
| Positions Summary | `/institutional-ownership/symbol-positions-summary?symbol=AAPL` |
| Industry Breakdown | `/institutional-ownership/holder-industry-breakdown?cik=CIK` |

## 12. ANALYST
| Endpoint | URL | Dados |
|----------|-----|-------|
| Estimates | `/analyst-estimates?symbol=AAPL` | Projeções de receita/EPS |
| Ratings Snapshot | `/ratings-snapshot?symbol=AAPL` | Rating consolidado |
| Historical Ratings | `/ratings-historical?symbol=AAPL` | Ratings ao longo do tempo |
| Price Target Summary | `/price-target-summary?symbol=AAPL` | Preços-alvo (média, alta, baixa) |
| Price Target Consensus | `/price-target-consensus?symbol=AAPL` | Consenso de analistas |
| Grades | `/grades?symbol=AAPL` | Upgrades/downgrades recentes |
| Grades Consensus | `/grades-consensus?symbol=AAPL` | Strong Buy/Buy/Hold/Sell totais |

## 13. MARKET PERFORMANCE
| Endpoint | URL |
|----------|-----|
| Sector Performance | `/sector-performance-snapshot?date=2024-02-01` |
| Industry Performance | `/industry-performance-snapshot?date=2024-02-01` |
| Sector P/E | `/sector-pe-snapshot?date=2024-02-01` |
| Industry P/E | `/industry-pe-snapshot?date=2024-02-01` |
| Biggest Gainers | `/biggest-gainers` |
| Biggest Losers | `/biggest-losers` |
| Most Active | `/most-actives` |

## 14. TECHNICAL INDICATORS
| Indicador | URL |
|-----------|-----|
| SMA | `/technical-indicators/sma?symbol=AAPL&periodLength=20&timeframe=1day` |
| EMA | `/technical-indicators/ema?symbol=AAPL&periodLength=20&timeframe=1day` |
| WMA | `/technical-indicators/wma?...` |
| DEMA | `/technical-indicators/dema?...` |
| TEMA | `/technical-indicators/tema?...` |
| RSI | `/technical-indicators/rsi?...` |
| StdDev | `/technical-indicators/standarddeviation?...` |
| Williams %R | `/technical-indicators/williams?...` |
| ADX | `/technical-indicators/adx?...` |

Timeframes: 1min, 5min, 15min, 30min, 1hour, 4hour, 1day

## 15. ETF & MUTUAL FUNDS
| Endpoint | URL |
|----------|-----|
| Holdings | `/etf/holdings?symbol=SPY` |
| Info | `/etf/info?symbol=SPY` |
| Country Allocation | `/etf/country-weightings?symbol=SPY` |
| Sector Weighting | `/etf/sector-weightings?symbol=SPY` |
| Asset Exposure | `/etf/asset-exposure?symbol=AAPL` |

## 16. SEC FILINGS
| Endpoint | URL |
|----------|-----|
| Latest 8-K | `/sec-filings-8k` |
| Latest Financials | `/sec-filings-financials` |
| By Symbol | `/sec-filings-search/symbol?symbol=AAPL` |
| By Form Type | `/sec-filings-search/form-type?formType=10-K` |

## 17. INSIDER TRADES
| Endpoint | URL |
|----------|-----|
| Latest | `/insider-trading/latest` |
| Search by Symbol | `/insider-trading/search` |
| By Reporting Name | `/insider-trading/reporting-name?name=Zuckerberg` |
| Statistics | `/insider-trading/statistics?symbol=AAPL` |

## 18. DCF (Discounted Cash Flow)
| Endpoint | URL |
|----------|-----|
| DCF | `/discounted-cash-flow?symbol=AAPL` |
| Levered DCF | `/levered-discounted-cash-flow?symbol=AAPL` |
| Custom DCF | `/custom-discounted-cash-flow?symbol=AAPL` |

## 19. FOREX
| Endpoint | URL |
|----------|-----|
| Pairs List | `/forex-list` |
| Quote | `/quote?symbol=EURUSD` |
| Historical | `/historical-price-eod/full?symbol=EURUSD` |
| Intraday | `/historical-chart/1min?symbol=EURUSD` |

## 20. CRYPTO
| Endpoint | URL |
|----------|-----|
| List | `/cryptocurrency-list` |
| Quote | `/quote?symbol=BTCUSD` |
| Historical | `/historical-price-eod/full?symbol=BTCUSD` |
| Intraday | `/historical-chart/1min?symbol=BTCUSD` |

## 21. COMMODITY
| Endpoint | URL |
|----------|-----|
| List | `/commodities-list` |
| Quote | `/quote?symbol=GCUSD` (Gold) |
| Historical | `/historical-price-eod/full?symbol=GCUSD` |

## 22. INDEXES
| Endpoint | URL |
|----------|-----|
| List | `/index-list` |
| S&P 500 Constituents | `/sp500-constituent` |
| Nasdaq Constituents | `/nasdaq-constituent` |
| Dow Jones | `/dowjones-constituent` |
| Historical Changes | `/historical-sp500-constituent` |

## 23. SENATE & HOUSE TRADES
| Endpoint | URL |
|----------|-----|
| Senate Latest | `/senate-latest` |
| Senate by Symbol | `/senate-trades?symbol=AAPL` |
| Senate by Name | `/senate-trades-by-name?name=Pelosi` |
| House Latest | `/house-latest` |
| House by Symbol | `/house-trades?symbol=AAPL` |

## 24. ESG
| Endpoint | URL |
|----------|-----|
| ESG Disclosures | `/esg-disclosures?symbol=AAPL` |
| ESG Ratings | `/esg-ratings?symbol=AAPL` |
| ESG Benchmark | `/esg-benchmark` |

## 25. COMMITMENT OF TRADERS
| Endpoint | URL |
|----------|-----|
| COT Report | `/commitment-of-traders-report` |
| COT Analysis | `/commitment-of-traders-analysis` |
| COT List | `/commitment-of-traders-list` |

## 26. BULK ENDPOINTS (dados em massa)
| Endpoint | URL |
|----------|-----|
| Profile Bulk | `/profile-bulk?part=0` |
| Rating Bulk | `/rating-bulk` |
| DCF Bulk | `/dcf-bulk` |
| Scores Bulk | `/scores-bulk` |
| Price Target Bulk | `/price-target-summary-bulk` |
| Key Metrics TTM Bulk | `/key-metrics-ttm-bulk` |
| Ratios TTM Bulk | `/ratios-ttm-bulk` |
| Peers Bulk | `/peers-bulk` |
| EOD Bulk | `/eod-bulk?date=2024-10-22` |
| Income Statement Bulk | `/income-statement-bulk?year=2025&period=Q1` |
| Balance Sheet Bulk | `/balance-sheet-statement-bulk?year=2025&period=Q1` |
| Cash Flow Bulk | `/cash-flow-statement-bulk?year=2025&period=Q1` |

---

## EXEMPLOS IMPORTANTES

```bash
# Profile completo
curl "https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=KEY"

# Ratios TTM (P/L, P/VP, ROE, etc.)
curl "https://financialmodelingprep.com/stable/ratios-ttm?symbol=AAPL&apikey=KEY"

# Piotroski + Z-Score
curl "https://financialmodelingprep.com/stable/financial-scores?symbol=AAPL&apikey=KEY"

# Analyst consensus + price target
curl "https://financialmodelingprep.com/stable/grades-consensus?symbol=AAPL&apikey=KEY"
curl "https://financialmodelingprep.com/stable/price-target-consensus?symbol=AAPL&apikey=KEY"

# DRE últimos 5 anos
curl "https://financialmodelingprep.com/stable/income-statement?symbol=AAPL&period=annual&limit=5&apikey=KEY"

# DCF (valor intrínseco)
curl "https://financialmodelingprep.com/stable/discounted-cash-flow?symbol=AAPL&apikey=KEY"

# Senate trades (o que políticos estão comprando)
curl "https://financialmodelingprep.com/stable/senate-latest?page=0&limit=20&apikey=KEY"

# Biggest gainers hoje
curl "https://financialmodelingprep.com/stable/biggest-gainers?apikey=KEY"

# RSI de AAPL (indicador técnico)
curl "https://financialmodelingprep.com/stable/technical-indicators/rsi?symbol=AAPL&periodLength=14&timeframe=1day&apikey=KEY"

# ETF holdings do SPY (o que tem dentro do S&P 500)
curl "https://financialmodelingprep.com/stable/etf/holdings?symbol=SPY&apikey=KEY"
```

## DADOS EXCLUSIVOS DO FMP (que a brapi NÃO tem)

1. **Piotroski F-Score** e **Altman Z-Score** (`/financial-scores`)
2. **DCF Valuation** — valor intrínseco calculado (`/discounted-cash-flow`)
3. **Senate/House Trades** — o que políticos americanos estão comprando
4. **Analyst Grades** — Strong Buy, Buy, Hold, Sell, com consenso
5. **Price Targets** — preço-alvo de analistas de Wall Street
6. **Technical Indicators** — SMA, EMA, RSI, ADX, Williams %R
7. **ETF Holdings** — composição completa de qualquer ETF
8. **Revenue Segmentation** — receita por produto e por região geográfica
9. **Insider Trades** — o que CEOs/diretores estão comprando/vendendo
10. **Earnings Transcripts** — transcrição completa de calls de resultado
11. **ESG Ratings** — ratings ambientais, sociais e de governança
12. **COT Reports** — posições de traders institucionais em commodities
13. **Bulk Endpoints** — dados de TODAS as empresas de uma vez
