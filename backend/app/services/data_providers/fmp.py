import httpx
from app.config import get_settings

BASE_URL = "https://financialmodelingprep.com/stable"


def _headers() -> dict:
    settings = get_settings()
    return {"apikey": settings.fmp_api_key} if settings.fmp_api_key else {}


def _params() -> dict:
    settings = get_settings()
    return {"apikey": settings.fmp_api_key} if settings.fmp_api_key else {}


async def _get(path: str, extra_params: dict | None = None) -> list | dict | None:
    settings = get_settings()
    if not settings.fmp_api_key:
        return None

    params = {"apikey": settings.fmp_api_key}
    if extra_params:
        params.update(extra_params)

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{BASE_URL}/{path}", params=params)
        if resp.status_code != 200:
            return None
        return resp.json()


async def search_assets(query: str) -> list[dict]:
    data = await _get("search-symbol", {"query": query})
    if not data:
        name_data = await _get("search-name", {"query": query})
        data = name_data or []

    results = []
    for item in data[:15]:
        exchange = item.get("exchangeShortName", "")
        if exchange in ("NYSE", "NASDAQ", "AMEX", "ETF"):
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


async def get_profile(ticker: str) -> dict | None:
    data = await _get("profile", {"symbol": ticker})
    if not data or not isinstance(data, list) or len(data) == 0:
        return None
    return data[0]


async def get_fundamentals(ticker: str) -> dict | None:
    """Fetch comprehensive fundamental data using multiple stable endpoints."""
    profile_data = await _get("profile", {"symbol": ticker})
    ratios_data = await _get("ratios-ttm", {"symbol": ticker})
    metrics_data = await _get("key-metrics-ttm", {"symbol": ticker})

    profile = profile_data[0] if profile_data and isinstance(profile_data, list) and len(profile_data) > 0 else {}
    ratios = ratios_data[0] if ratios_data and isinstance(ratios_data, list) and len(ratios_data) > 0 else {}
    metrics = metrics_data[0] if metrics_data and isinstance(metrics_data, list) and len(metrics_data) > 0 else {}

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

        # Valuation ratios
        "pe_ratio": ratios.get("peRatioTTM"),
        "pb_ratio": ratios.get("priceToBookRatioTTM"),
        "ev_ebitda": ratios.get("enterpriseValueOverEBITDATTM"),
        "psr": ratios.get("priceToSalesRatioTTM"),
        "price_to_fcf": ratios.get("priceToFreeCashFlowsTTM"),
        "peg_ratio": ratios.get("pegRatioTTM"),

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

        # Debt
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

        # Other
        "earnings_yield": metrics.get("earningsYieldTTM"),
        "fcf_yield": metrics.get("freeCashFlowYieldTTM"),
        "capex_to_revenue": metrics.get("capexToRevenueTTM"),
    }


async def get_financial_scores(ticker: str) -> dict:
    """Altman Z-Score and Piotroski Score."""
    data = await _get("financial-scores", {"symbol": ticker})
    if not data or not isinstance(data, list) or len(data) == 0:
        return {}

    scores = data[0]
    return {
        "altman_z_score": scores.get("altmanZScore"),
        "piotroski_score": scores.get("piotroskiScore"),
    }


async def get_peers(ticker: str) -> list[str]:
    data = await _get("stock-peers", {"symbol": ticker})
    if not data or not isinstance(data, list) or len(data) == 0:
        return []
    return data[0].get("peersList", [])


async def get_growth(ticker: str) -> dict:
    """Revenue and income growth from the stable financial-growth endpoint."""
    data = await _get("financial-growth", {"symbol": ticker, "period": "annual", "limit": 5})
    if not data or not isinstance(data, list):
        return {}

    result = {}
    if len(data) >= 1:
        result["revenue_growth_1y"] = _to_pct(data[0].get("revenueGrowth"))
        result["profit_growth_1y"] = _to_pct(data[0].get("netIncomeGrowth"))
        result["ebitda_growth_1y"] = _to_pct(data[0].get("ebitdagrowth"))
    if len(data) >= 3:
        result["revenue_growth_3y"] = _to_pct(data[2].get("revenueGrowth"))
        result["profit_growth_3y"] = _to_pct(data[2].get("netIncomeGrowth"))
    if len(data) >= 5:
        result["revenue_growth_5y"] = _to_pct(data[4].get("revenueGrowth"))
        result["profit_growth_5y"] = _to_pct(data[4].get("netIncomeGrowth"))

    return result


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
            "yield": d.get("yield"),
        }
        for d in data[:20]
    ]


async def get_income_statements(ticker: str, limit: int = 5) -> list[dict]:
    data = await _get("income-statement", {"symbol": ticker, "period": "annual", "limit": limit})
    if not data or not isinstance(data, list):
        return []
    return data


def _to_pct(val) -> float | None:
    if val is not None:
        return round(float(val) * 100, 2)
    return None
