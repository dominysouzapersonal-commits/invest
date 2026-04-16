import httpx
from app.config import get_settings

BASE_URL = "https://brapi.dev/api"

ALL_MODULES = (
    "summaryProfile,financialData,defaultKeyStatistics,"
    "balanceSheetHistory,incomeStatementHistory,cashflowHistory,"
    "balanceSheetHistoryQuarterly,incomeStatementHistoryQuarterly,"
    "cashflowHistoryQuarterly,financialDataHistory,"
    "defaultKeyStatisticsHistory"
)

CORE_MODULES = "summaryProfile,financialData,defaultKeyStatistics"


def _headers() -> dict:
    settings = get_settings()
    if settings.brapi_token:
        return {"Authorization": f"Bearer {settings.brapi_token}"}
    return {}


async def _get(path: str, params: dict | None = None) -> dict | None:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{BASE_URL}/{path}",
            params=params or {},
            headers=_headers(),
        )
        if resp.status_code != 200:
            return None
        return resp.json()


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

async def search_assets(query: str) -> list[dict]:
    data = await _get("available", {"search": query})
    if not data:
        return []
    stocks = data.get("stocks", [])
    results = []
    for ticker in stocks:
        if isinstance(ticker, str):
            results.append({
                "ticker": ticker,
                "name": ticker,
                "asset_type": _classify_ticker(ticker),
                "exchange": "B3",
                "currency": "BRL",
            })
    return results[:20]


async def list_assets(
    sector: str | None = None,
    sort_by: str = "volume",
    sort_order: str = "desc",
    limit: int = 20,
    asset_type: str | None = None,
) -> list[dict]:
    params: dict = {"sortBy": sort_by, "sortOrder": sort_order, "limit": limit}
    if sector:
        params["sector"] = sector
    if asset_type:
        params["type"] = asset_type

    data = await _get("quote/list", params)
    if not data:
        return []
    return data.get("stocks", [])


# ---------------------------------------------------------------------------
# Quotes — batch up to 20 tickers
# ---------------------------------------------------------------------------

async def get_quote(ticker: str) -> dict | None:
    data = await _get(
        f"quote/{ticker}",
        {"fundamental": "true", "dividends": "true"},
    )
    if not data:
        return None
    results = data.get("results", [])
    if not results:
        return None
    return _parse_quote(results[0], ticker)


async def get_quotes_batch(tickers: list[str]) -> list[dict]:
    """Fetch up to 20 tickers in a single request (Premium plan limit)."""
    if not tickers:
        return []
    batch = tickers[:20]
    joined = ",".join(batch)
    data = await _get(
        f"quote/{joined}",
        {"fundamental": "true", "dividends": "true", "modules": CORE_MODULES},
    )
    if not data:
        return []
    return [_parse_quote(r, r.get("symbol", "")) for r in data.get("results", [])]


async def get_quotes_all(tickers: list[str]) -> list[dict]:
    """Fetch any number of tickers using multiple batch requests of 20."""
    results = []
    for i in range(0, len(tickers), 20):
        batch = tickers[i : i + 20]
        batch_results = await get_quotes_batch(batch)
        results.extend(batch_results)
    return results


# ---------------------------------------------------------------------------
# Fundamentals — deep modules
# ---------------------------------------------------------------------------

async def get_fundamentals(ticker: str, full: bool = False) -> dict | None:
    modules = ALL_MODULES if full else CORE_MODULES
    data = await _get(f"quote/{ticker}", {"modules": modules})
    if not data:
        return None
    results = data.get("results", [])
    if not results:
        return None
    return _parse_fundamentals(results[0])


async def get_fundamentals_batch(tickers: list[str]) -> list[dict]:
    """Batch fundamentals for up to 20 tickers."""
    if not tickers:
        return []
    batch = tickers[:20]
    joined = ",".join(batch)
    data = await _get(
        f"quote/{joined}",
        {"modules": CORE_MODULES, "fundamental": "true", "dividends": "true"},
    )
    if not data:
        return []

    out = []
    for r in data.get("results", []):
        fund = _parse_fundamentals(r)
        if fund:
            fund["_quote"] = _parse_quote(r, r.get("symbol", ""))
            out.append(fund)
    return out


async def get_fundamentals_all(tickers: list[str]) -> list[dict]:
    """Fetch fundamentals for any number of tickers in batches of 20."""
    results = []
    for i in range(0, len(tickers), 20):
        batch = tickers[i : i + 20]
        batch_results = await get_fundamentals_batch(batch)
        results.extend(batch_results)
    return results


# ---------------------------------------------------------------------------
# Financial statements (annual/quarterly)
# ---------------------------------------------------------------------------

async def get_balance_sheet(ticker: str, quarterly: bool = False) -> list[dict]:
    module = "balanceSheetHistoryQuarterly" if quarterly else "balanceSheetHistory"
    data = await _get(f"quote/{ticker}", {"modules": module})
    if not data:
        return []
    results = data.get("results", [])
    if not results:
        return []
    return results[0].get(module, {}).get("balanceSheetStatements", [])


async def get_income_statement(ticker: str, quarterly: bool = False) -> list[dict]:
    module = "incomeStatementHistoryQuarterly" if quarterly else "incomeStatementHistory"
    data = await _get(f"quote/{ticker}", {"modules": module})
    if not data:
        return []
    results = data.get("results", [])
    if not results:
        return []
    return results[0].get(module, {}).get("incomeStatementHistory", [])


async def get_cashflow(ticker: str, quarterly: bool = False) -> list[dict]:
    module = "cashflowHistoryQuarterly" if quarterly else "cashflowHistory"
    data = await _get(f"quote/{ticker}", {"modules": module})
    if not data:
        return []
    results = data.get("results", [])
    if not results:
        return []
    return results[0].get(module, {}).get("cashflowStatements", [])


# ---------------------------------------------------------------------------
# Dividends
# ---------------------------------------------------------------------------

async def get_dividends(ticker: str) -> dict | None:
    data = await _get(f"quote/{ticker}", {"dividends": "true"})
    if not data:
        return None
    results = data.get("results", [])
    if not results:
        return None
    return results[0].get("dividendsData")


# ---------------------------------------------------------------------------
# Historical prices
# ---------------------------------------------------------------------------

async def get_historical(ticker: str, range_: str = "1y", interval: str = "1d") -> list[dict]:
    data = await _get(f"quote/{ticker}", {"range": range_, "interval": interval})
    if not data:
        return []
    results = data.get("results", [])
    if not results:
        return []
    hist = results[0].get("historicalDataPrice", [])
    return [
        {
            "date": p.get("date", ""),
            "open": round(p.get("open", 0), 2),
            "high": round(p.get("high", 0), 2),
            "low": round(p.get("low", 0), 2),
            "close": round(p.get("close", 0), 2),
            "volume": int(p.get("volume", 0)),
        }
        for p in hist
        if p.get("close") is not None
    ]


# ---------------------------------------------------------------------------
# Macro: SELIC, IPCA, Câmbio, Crypto
# ---------------------------------------------------------------------------

async def get_selic() -> list[dict]:
    data = await _get("v2/prime-rate", {"country": "brazil", "sortBy": "date", "sortOrder": "desc"})
    if not data:
        return []
    return data.get("prime-rate", [])


async def get_ipca() -> list[dict]:
    data = await _get("v2/inflation", {"country": "brazil", "sortBy": "date", "sortOrder": "desc"})
    if not data:
        return []
    return data.get("inflation", [])


async def get_currency(pairs: str = "USD-BRL,EUR-BRL") -> list[dict]:
    data = await _get("v2/currency", {"currency": pairs})
    if not data:
        return []
    return data.get("currency", [])


async def get_crypto(coins: str = "BTC,ETH", currency: str = "BRL") -> list[dict]:
    data = await _get("v2/crypto", {"coin": coins, "currency": currency})
    if not data:
        return []
    return data.get("coins", [])


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _parse_quote(r: dict, ticker: str) -> dict:
    summary = r.get("summaryProfile", {}) or {}
    fin = r.get("financialData", {}) or {}
    stats = r.get("defaultKeyStatistics", {}) or {}

    return {
        "ticker": r.get("symbol", ticker),
        "name": r.get("longName") or r.get("shortName") or ticker,
        "price": r.get("regularMarketPrice"),
        "change": r.get("regularMarketChange"),
        "change_percent": r.get("regularMarketChangePercent"),
        "volume": r.get("regularMarketVolume"),
        "market_cap": r.get("marketCap"),
        "high_52w": r.get("fiftyTwoWeekHigh"),
        "low_52w": r.get("fiftyTwoWeekLow"),
        "avg_200d": r.get("twoHundredDayAverage"),
        "currency": r.get("currency", "BRL"),
        "exchange": r.get("fullExchangeName", "B3"),
        "sector": summary.get("sector") if isinstance(summary, dict) else None,
        "industry": summary.get("industry") if isinstance(summary, dict) else None,
        "description": summary.get("longBusinessSummary") if isinstance(summary, dict) else None,
        "website": summary.get("website") if isinstance(summary, dict) else None,
        "pe_ratio": r.get("priceEarnings") or stats.get("trailingPE"),
        "forward_pe": stats.get("forwardPE"),
        "dividend_yield": stats.get("dividendYield") or r.get("dividendYield"),
        "avg_volume": r.get("averageDailyVolume3Month"),
        "logo_url": r.get("logourl"),
        "dividends_data": r.get("dividendsData"),
        "recommendation_key": fin.get("recommendationKey"),
        "recommendation_mean": fin.get("recommendationMean"),
        "target_mean_price": fin.get("targetMeanPrice"),
        "target_high_price": fin.get("targetHighPrice"),
        "target_low_price": fin.get("targetLowPrice"),
        "number_of_analysts": fin.get("numberOfAnalystOpinions"),
        "earnings_per_share": r.get("earningsPerShare") or stats.get("trailingEps"),
    }


def _parse_fundamentals(r: dict) -> dict:
    fin = r.get("financialData", {}) or {}
    stats = r.get("defaultKeyStatistics", {}) or {}
    summary = r.get("summaryProfile", {}) or {}

    return {
        "ticker": r.get("symbol"),
        "name": r.get("longName") or r.get("shortName"),
        "sector": summary.get("sector") if isinstance(summary, dict) else None,
        "industry": summary.get("industry") if isinstance(summary, dict) else None,

        # Profitability
        "roe": fin.get("returnOnEquity"),
        "roa": fin.get("returnOnAssets"),
        "roic": None,
        "gross_margin": fin.get("grossMargins"),
        "ebitda_margin": fin.get("ebitdaMargins"),
        "net_margin": fin.get("profitMargins"),
        "operating_margin": fin.get("operatingMargins"),

        # Liquidity & Debt
        "current_ratio": fin.get("currentRatio"),
        "quick_ratio": fin.get("quickRatio"),
        "debt_to_equity": fin.get("debtToEquity"),

        # Growth
        "revenue_growth": fin.get("revenueGrowth"),
        "earnings_growth": fin.get("earningsGrowth"),

        # Valuation
        "pb_ratio": stats.get("priceToBook"),
        "ev_ebitda": stats.get("enterpriseToEbitda"),
        "ev_revenue": stats.get("enterpriseToRevenue"),
        "payout_ratio": stats.get("payoutRatio"),
        "beta": stats.get("beta"),
        "forward_pe": stats.get("forwardPE"),
        "peg_ratio": stats.get("pegRatio"),
        "pe_ratio": stats.get("trailingPE"),
        "enterprise_value": stats.get("enterpriseValue"),
        "book_value": stats.get("bookValue"),
        "shares_outstanding": stats.get("sharesOutstanding"),

        # Absolutes
        "total_cash": fin.get("totalCash"),
        "total_debt": fin.get("totalDebt"),
        "total_revenue": fin.get("totalRevenue"),
        "ebitda": fin.get("ebitda"),
        "free_cashflow": fin.get("freeCashflow"),
        "operating_cashflow": fin.get("operatingCashflow"),
        "gross_profits": fin.get("grossProfits"),

        # Analyst
        "target_mean_price": fin.get("targetMeanPrice"),
        "target_high_price": fin.get("targetHighPrice"),
        "target_low_price": fin.get("targetLowPrice"),
        "target_median_price": fin.get("targetMedianPrice"),
        "recommendation_mean": fin.get("recommendationMean"),
        "recommendation_key": fin.get("recommendationKey"),
        "number_of_analyst_opinions": fin.get("numberOfAnalystOpinions"),
    }


def _classify_ticker(ticker: str) -> str:
    t = ticker.upper()
    if t.endswith("11") and len(t) >= 6:
        return "fii"
    if t.endswith(("34", "35", "33")) and len(t) >= 5:
        return "bdr"
    return "br_stock"
