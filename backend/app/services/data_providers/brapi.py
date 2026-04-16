import httpx
from app.config import get_settings

BASE_URL = "https://brapi.dev/api"


def _headers() -> dict:
    settings = get_settings()
    if settings.brapi_token:
        return {"Authorization": f"Bearer {settings.brapi_token}"}
    return {}


async def search_assets(query: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{BASE_URL}/available",
            params={"search": query},
            headers=_headers(),
        )
        if resp.status_code != 200:
            return []
        data = resp.json()

    stocks = data.get("stocks", [])
    results = []
    for ticker in stocks:
        if isinstance(ticker, str):
            asset_type = _classify_ticker(ticker)
            results.append({
                "ticker": ticker,
                "name": ticker,
                "asset_type": asset_type,
                "exchange": "B3",
                "currency": "BRL",
            })
    return results[:20]


async def get_quote(ticker: str) -> dict | None:
    """Full quote with fundamentals and dividends via paid plan."""
    params = {"fundamental": "true", "dividends": "true"}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{BASE_URL}/quote/{ticker}",
            params=params,
            headers=_headers(),
        )
        if resp.status_code != 200:
            return None
        data = resp.json()

    results = data.get("results", [])
    if not results:
        return None

    r = results[0]
    summary = r.get("summaryProfile", {}) or {}

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
        "currency": r.get("currency", "BRL"),
        "exchange": r.get("fullExchangeName", "B3"),
        "sector": summary.get("sector") if isinstance(summary, dict) else None,
        "industry": summary.get("industry") if isinstance(summary, dict) else None,
        "pe_ratio": r.get("priceEarnings"),
        "dividend_yield": r.get("dividendYield"),
        "avg_volume": r.get("averageDailyVolume3Month"),
        "logo_url": r.get("logourl"),
        "dividends_data": r.get("dividendsData"),
    }


async def get_fundamentals(ticker: str) -> dict | None:
    """Fetch detailed modules: financialData, defaultKeyStatistics, balanceSheetHistory, etc."""
    params = {
        "modules": "summaryProfile,defaultKeyStatistics,financialData,balanceSheetHistory,incomeStatementHistory",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            f"{BASE_URL}/quote/{ticker}",
            params=params,
            headers=_headers(),
        )
        if resp.status_code != 200:
            return None
        data = resp.json()

    results = data.get("results", [])
    if not results:
        return None

    r = results[0]
    fin = r.get("financialData", {}) or {}
    stats = r.get("defaultKeyStatistics", {}) or {}

    return {
        "roe": fin.get("returnOnEquity"),
        "roa": fin.get("returnOnAssets"),
        "roic": None,
        "gross_margin": fin.get("grossMargins"),
        "ebitda_margin": fin.get("ebitdaMargins"),
        "net_margin": fin.get("profitMargins"),
        "operating_margin": fin.get("operatingMargins"),
        "current_ratio": fin.get("currentRatio"),
        "debt_to_equity": fin.get("debtToEquity"),
        "revenue_growth": fin.get("revenueGrowth"),
        "earnings_growth": fin.get("earningsGrowth"),
        "pb_ratio": stats.get("priceToBook"),
        "ev_ebitda": stats.get("enterpriseToEbitda"),
        "ev_revenue": stats.get("enterpriseToRevenue"),
        "payout_ratio": stats.get("payoutRatio"),
        "beta": stats.get("beta"),
        "forward_pe": stats.get("forwardPE"),
        "peg_ratio": stats.get("pegRatio"),
        "total_cash": fin.get("totalCash"),
        "total_debt": fin.get("totalDebt"),
        "total_revenue": fin.get("totalRevenue"),
        "ebitda": fin.get("ebitda"),
        "free_cashflow": fin.get("freeCashflow"),
        "operating_cashflow": fin.get("operatingCashflow"),
        "target_mean_price": fin.get("targetMeanPrice"),
        "recommendation_mean": fin.get("recommendationMean"),
        "recommendation_key": fin.get("recommendationKey"),
        "number_of_analyst_opinions": fin.get("numberOfAnalystOpinions"),
    }


async def get_historical(ticker: str, range_: str = "1y", interval: str = "1d") -> list[dict]:
    """Fetch historical prices using brapi (better for BR assets)."""
    params = {"range": range_, "interval": interval}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{BASE_URL}/quote/{ticker}",
            params=params,
            headers=_headers(),
        )
        if resp.status_code != 200:
            return []
        data = resp.json()

    results = data.get("results", [])
    if not results:
        return []

    hist = results[0].get("historicalDataPrice", [])
    prices = []
    for p in hist:
        if p.get("close") is not None:
            prices.append({
                "date": p.get("date", ""),
                "open": round(p.get("open", 0), 2),
                "high": round(p.get("high", 0), 2),
                "low": round(p.get("low", 0), 2),
                "close": round(p.get("close", 0), 2),
                "volume": int(p.get("volume", 0)),
            })
    return prices


def _classify_ticker(ticker: str) -> str:
    t = ticker.upper()
    if t.endswith("11") and len(t) >= 6:
        return "fii"
    if t.endswith(("34", "35", "33")) and len(t) >= 5:
        return "bdr"
    return "br_stock"
