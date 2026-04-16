import httpx
from app.config import get_settings

BASE_URL = "https://financialmodelingprep.com/stable"


async def _get(path: str, extra_params: dict | None = None) -> list | dict | None:
    settings = get_settings()
    if not settings.fmp_api_key:
        return None

    params = {"apikey": settings.fmp_api_key}
    if extra_params:
        params.update(extra_params)

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(f"{BASE_URL}/{path}", params=params)
        if resp.status_code != 200:
            return None
        return resp.json()


def _first(data) -> dict:
    if data and isinstance(data, list) and len(data) > 0:
        return data[0]
    return {}


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

async def search_assets(query: str) -> list[dict]:
    data = await _get("search-symbol", {"query": query})
    if not data:
        data = await _get("search-name", {"query": query}) or []

    results = []
    for item in data[:15]:
        exchange = item.get("exchangeShortName", "")
        if exchange in ("NYSE", "NASDAQ", "AMEX", "ETF", "SAO"):
            sym = item.get("symbol", "")
            name = item.get("name", "")
            is_etf = exchange == "ETF" or "ETF" in name.upper()
            results.append({
                "ticker": sym,
                "name": name,
                "asset_type": "us_etf" if is_etf else "us_stock",
                "exchange": exchange,
                "currency": item.get("currency", "USD"),
            })
    return results


# ---------------------------------------------------------------------------
# Profile & Quote
# ---------------------------------------------------------------------------

async def get_profile(ticker: str) -> dict | None:
    data = await _get("profile", {"symbol": ticker})
    return _first(data) or None


async def get_quote(ticker: str) -> dict | None:
    data = await _get("quote", {"symbol": ticker})
    return _first(data) or None


async def get_batch_quote(tickers: list[str]) -> list[dict]:
    if not tickers:
        return []
    data = await _get("batch-quote", {"symbols": ",".join(tickers)})
    return data if isinstance(data, list) else []


async def get_price_change(ticker: str) -> dict | None:
    data = await _get("stock-price-change", {"symbol": ticker})
    return _first(data) or None


# ---------------------------------------------------------------------------
# Fundamentals (TTM)
# ---------------------------------------------------------------------------

async def get_fundamentals(ticker: str) -> dict | None:
    profile_data = await _get("profile", {"symbol": ticker})
    ratios_data = await _get("ratios-ttm", {"symbol": ticker})
    metrics_data = await _get("key-metrics-ttm", {"symbol": ticker})

    profile = _first(profile_data)
    ratios = _first(ratios_data)
    metrics = _first(metrics_data)

    if not profile:
        return None

    return {
        "name": profile.get("companyName"),
        "sector": profile.get("sector"),
        "industry": profile.get("industry"),
        "description": profile.get("description"),
        "market_cap": profile.get("mktCap"),
        "price": profile.get("price"),
        "beta": profile.get("beta"),
        "avg_volume": profile.get("volAvg"),
        "exchange": profile.get("exchangeShortName"),
        "country": profile.get("country"),
        "is_etf": profile.get("isEtf", False),
        "is_actively_trading": profile.get("isActivelyTrading", True),
        "logo_url": profile.get("image"),
        "ceo": profile.get("ceo"),
        "ipo_date": profile.get("ipoDate"),

        # Valuation
        "pe_ratio": ratios.get("peRatioTTM"),
        "pb_ratio": ratios.get("priceToBookRatioTTM"),
        "ev_ebitda": ratios.get("enterpriseValueOverEBITDATTM"),
        "psr": ratios.get("priceToSalesRatioTTM"),
        "price_to_fcf": ratios.get("priceToFreeCashFlowsTTM"),
        "peg_ratio": ratios.get("pegRatioTTM"),
        "ev_revenue": ratios.get("enterpriseValueOverRevenueTTM") if "enterpriseValueOverRevenueTTM" in ratios else None,

        # Profitability
        "roe": ratios.get("returnOnEquityTTM"),
        "roa": ratios.get("returnOnAssetsTTM"),
        "roic": metrics.get("roicTTM"),
        "net_margin": ratios.get("netProfitMarginTTM"),
        "gross_margin": ratios.get("grossProfitMarginTTM"),
        "ebitda_margin": ratios.get("ebitdaMarginTTM") if "ebitdaMarginTTM" in ratios else None,
        "operating_margin": ratios.get("operatingProfitMarginTTM"),

        # Dividends
        "dividend_yield": ratios.get("dividendYielTTM"),
        "payout_ratio": ratios.get("payoutRatioTTM"),
        "dividend_per_share": ratios.get("dividendPerShareTTM") if "dividendPerShareTTM" in ratios else None,

        # Debt & Liquidity
        "current_ratio": ratios.get("currentRatioTTM"),
        "quick_ratio": ratios.get("quickRatioTTM"),
        "debt_to_equity": ratios.get("debtEquityRatioTTM"),
        "debt_to_assets": ratios.get("debtRatioTTM"),
        "interest_coverage": ratios.get("interestCoverageTTM"),
        "net_debt_ebitda": metrics.get("netDebtToEBITDATTM") if "netDebtToEBITDATTM" in metrics else None,

        # Per-share
        "eps": metrics.get("netIncomePerShareTTM"),
        "revenue_per_share": metrics.get("revenuePerShareTTM"),
        "book_value_per_share": metrics.get("bookValuePerShareTTM"),
        "fcf_per_share": metrics.get("freeCashFlowPerShareTTM"),
        "tangible_book_per_share": metrics.get("tangibleBookValuePerShareTTM"),

        # Yields
        "earnings_yield": metrics.get("earningsYieldTTM"),
        "fcf_yield": metrics.get("freeCashFlowYieldTTM"),
        "capex_to_revenue": metrics.get("capexToRevenueTTM"),
        "capex_to_operating_cf": metrics.get("capexToOperatingCashFlowTTM"),
    }


# ---------------------------------------------------------------------------
# Financial Scores (Piotroski + Altman Z)
# ---------------------------------------------------------------------------

async def get_financial_scores(ticker: str) -> dict:
    data = await _get("financial-scores", {"symbol": ticker})
    scores = _first(data)
    if not scores:
        return {}
    return {
        "altman_z_score": scores.get("altmanZScore"),
        "piotroski_score": scores.get("piotroskiScore"),
        "working_capital": scores.get("workingCapital"),
        "total_assets": scores.get("totalAssets"),
        "retained_earnings": scores.get("retainedEarnings"),
        "ebit": scores.get("ebit"),
        "market_cap": scores.get("marketCap"),
        "total_liabilities": scores.get("totalLiabilities"),
        "revenue": scores.get("revenue"),
    }


# ---------------------------------------------------------------------------
# DCF Valuation
# ---------------------------------------------------------------------------

async def get_dcf(ticker: str) -> dict | None:
    data = await _get("discounted-cash-flow", {"symbol": ticker})
    item = _first(data)
    if not item:
        return None
    return {
        "dcf_value": item.get("dcf"),
        "stock_price": item.get("price") or item.get("Stock Price"),
        "date": item.get("date"),
    }


async def get_levered_dcf(ticker: str) -> dict | None:
    data = await _get("levered-discounted-cash-flow", {"symbol": ticker})
    item = _first(data)
    if not item:
        return None
    return {
        "dcf_value": item.get("dcf"),
        "stock_price": item.get("price") or item.get("Stock Price"),
        "date": item.get("date"),
    }


# ---------------------------------------------------------------------------
# Analyst: Estimates, Grades, Price Targets, Ratings
# ---------------------------------------------------------------------------

async def get_analyst_estimates(ticker: str, limit: int = 4) -> list[dict]:
    data = await _get("analyst-estimates", {"symbol": ticker, "limit": limit})
    return data if isinstance(data, list) else []


async def get_grades_consensus(ticker: str) -> dict | None:
    data = await _get("grades-consensus", {"symbol": ticker})
    return _first(data) or None


async def get_grades(ticker: str, limit: int = 10) -> list[dict]:
    data = await _get("grades", {"symbol": ticker, "limit": limit})
    return data if isinstance(data, list) else []


async def get_price_target_summary(ticker: str) -> dict | None:
    data = await _get("price-target-summary", {"symbol": ticker})
    return _first(data) or None


async def get_price_target_consensus(ticker: str) -> dict | None:
    data = await _get("price-target-consensus", {"symbol": ticker})
    return _first(data) or None


async def get_ratings_snapshot(ticker: str) -> dict | None:
    data = await _get("ratings-snapshot", {"symbol": ticker})
    return _first(data) or None


# ---------------------------------------------------------------------------
# Growth
# ---------------------------------------------------------------------------

async def get_growth(ticker: str) -> dict:
    data = await _get("financial-growth", {"symbol": ticker, "period": "annual", "limit": 5})
    if not data or not isinstance(data, list):
        return {}

    result = {}
    if len(data) >= 1:
        result["revenue_growth_1y"] = _to_pct(data[0].get("revenueGrowth"))
        result["profit_growth_1y"] = _to_pct(data[0].get("netIncomeGrowth"))
        result["ebitda_growth_1y"] = _to_pct(data[0].get("ebitdagrowth"))
        result["eps_growth_1y"] = _to_pct(data[0].get("epsgrowth"))
        result["fcf_growth_1y"] = _to_pct(data[0].get("freeCashFlowGrowth"))
        result["operating_income_growth_1y"] = _to_pct(data[0].get("operatingIncomeGrowth"))
    if len(data) >= 3:
        result["revenue_growth_3y"] = _to_pct(data[2].get("revenueGrowth"))
        result["profit_growth_3y"] = _to_pct(data[2].get("netIncomeGrowth"))
    if len(data) >= 5:
        result["revenue_growth_5y"] = _to_pct(data[4].get("revenueGrowth"))
        result["profit_growth_5y"] = _to_pct(data[4].get("netIncomeGrowth"))
    return result


# ---------------------------------------------------------------------------
# Financial Statements
# ---------------------------------------------------------------------------

async def get_income_statements(ticker: str, period: str = "annual", limit: int = 5) -> list[dict]:
    data = await _get("income-statement", {"symbol": ticker, "period": period, "limit": limit})
    return data if isinstance(data, list) else []


async def get_balance_sheet(ticker: str, period: str = "annual", limit: int = 5) -> list[dict]:
    data = await _get("balance-sheet-statement", {"symbol": ticker, "period": period, "limit": limit})
    return data if isinstance(data, list) else []


async def get_cashflow(ticker: str, period: str = "annual", limit: int = 5) -> list[dict]:
    data = await _get("cash-flow-statement", {"symbol": ticker, "period": period, "limit": limit})
    return data if isinstance(data, list) else []


async def get_key_metrics(ticker: str, period: str = "annual", limit: int = 5) -> list[dict]:
    data = await _get("key-metrics", {"symbol": ticker, "period": period, "limit": limit})
    return data if isinstance(data, list) else []


async def get_ratios(ticker: str, period: str = "annual", limit: int = 5) -> list[dict]:
    data = await _get("ratios", {"symbol": ticker, "period": period, "limit": limit})
    return data if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Revenue Segmentation
# ---------------------------------------------------------------------------

async def get_revenue_by_product(ticker: str) -> list[dict]:
    data = await _get("revenue-product-segmentation", {"symbol": ticker})
    return data if isinstance(data, list) else []


async def get_revenue_by_region(ticker: str) -> list[dict]:
    data = await _get("revenue-geographic-segmentation", {"symbol": ticker})
    return data if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Peers
# ---------------------------------------------------------------------------

async def get_peers(ticker: str) -> list[str]:
    data = await _get("stock-peers", {"symbol": ticker})
    item = _first(data)
    return item.get("peersList", []) if item else []


# ---------------------------------------------------------------------------
# Dividends & Splits
# ---------------------------------------------------------------------------

async def get_dividends(ticker: str) -> list[dict]:
    data = await _get("dividends", {"symbol": ticker})
    if not data or not isinstance(data, list):
        return []
    return [
        {
            "date": d.get("date"),
            "dividend": d.get("dividend"),
            "record_date": d.get("recordDate"),
            "payment_date": d.get("paymentDate"),
            "declaration_date": d.get("declarationDate"),
            "yield": d.get("yield"),
        }
        for d in data[:20]
    ]


# ---------------------------------------------------------------------------
# Technical Indicators
# ---------------------------------------------------------------------------

async def get_rsi(ticker: str, period: int = 14, timeframe: str = "1day") -> list[dict]:
    data = await _get(
        "technical-indicators/rsi",
        {"symbol": ticker, "periodLength": period, "timeframe": timeframe},
    )
    return data if isinstance(data, list) else []


async def get_sma(ticker: str, period: int = 50, timeframe: str = "1day") -> list[dict]:
    data = await _get(
        "technical-indicators/sma",
        {"symbol": ticker, "periodLength": period, "timeframe": timeframe},
    )
    return data if isinstance(data, list) else []


async def get_ema(ticker: str, period: int = 20, timeframe: str = "1day") -> list[dict]:
    data = await _get(
        "technical-indicators/ema",
        {"symbol": ticker, "periodLength": period, "timeframe": timeframe},
    )
    return data if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Insider Trades
# ---------------------------------------------------------------------------

async def get_insider_trades(ticker: str) -> list[dict]:
    data = await _get("insider-trading/search", {"symbol": ticker})
    if not data or not isinstance(data, list):
        return []
    return [
        {
            "date": t.get("transactionDate"),
            "reporting_name": t.get("reportingName"),
            "transaction_type": t.get("transactionType"),
            "securities_transacted": t.get("securitiesTransacted"),
            "price": t.get("price"),
            "form_type": t.get("formType"),
        }
        for t in data[:20]
    ]


# ---------------------------------------------------------------------------
# News
# ---------------------------------------------------------------------------

async def get_stock_news(ticker: str, limit: int = 10) -> list[dict]:
    data = await _get("news/stock", {"symbols": ticker, "limit": limit})
    if not data or not isinstance(data, list):
        return []
    return [
        {
            "title": n.get("title"),
            "url": n.get("url"),
            "published_date": n.get("publishedDate"),
            "site": n.get("site"),
            "text": (n.get("text") or "")[:300],
            "image": n.get("image"),
        }
        for n in data
    ]


# ---------------------------------------------------------------------------
# ETF
# ---------------------------------------------------------------------------

async def get_etf_holdings(ticker: str) -> list[dict]:
    data = await _get("etf/holdings", {"symbol": ticker})
    if not data or not isinstance(data, list):
        return []
    return [
        {
            "asset": h.get("asset"),
            "name": h.get("name"),
            "weight": h.get("weightPercentage"),
            "shares": h.get("sharesNumber"),
            "market_value": h.get("marketValue"),
        }
        for h in data[:30]
    ]


async def get_etf_info(ticker: str) -> dict | None:
    data = await _get("etf/info", {"symbol": ticker})
    return _first(data) or None


async def get_etf_sector_weightings(ticker: str) -> list[dict]:
    data = await _get("etf/sector-weightings", {"symbol": ticker})
    return data if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Historical Prices
# ---------------------------------------------------------------------------

async def get_historical(ticker: str, from_date: str | None = None, to_date: str | None = None) -> list[dict]:
    params: dict = {"symbol": ticker}
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date
    data = await _get("historical-price-eod/full", params)
    if not data or not isinstance(data, list):
        return []
    return [
        {
            "date": p.get("date", ""),
            "open": round(p.get("open", 0), 2),
            "high": round(p.get("high", 0), 2),
            "low": round(p.get("low", 0), 2),
            "close": round(p.get("close", 0), 2),
            "volume": int(p.get("volume", 0)),
        }
        for p in data
        if p.get("close") is not None
    ]


# ---------------------------------------------------------------------------
# Market Performance
# ---------------------------------------------------------------------------

async def get_sector_performance() -> list[dict]:
    data = await _get("sector-performance-snapshot")
    return data if isinstance(data, list) else []


async def get_biggest_gainers() -> list[dict]:
    data = await _get("biggest-gainers")
    return data if isinstance(data, list) else []


async def get_biggest_losers() -> list[dict]:
    data = await _get("biggest-losers")
    return data if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Economics
# ---------------------------------------------------------------------------

async def get_treasury_rates() -> list[dict]:
    data = await _get("treasury-rates")
    return data[:5] if isinstance(data, list) else []


async def get_market_risk_premium() -> list[dict]:
    data = await _get("market-risk-premium")
    return data[:10] if isinstance(data, list) else []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_pct(val) -> float | None:
    if val is not None:
        return round(float(val) * 100, 2)
    return None
