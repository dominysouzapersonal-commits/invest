"""
bolsai.com.br API provider — accurate BR fundamentals from CVM/B3/BCB.
Used as PRIMARY source for all Brazilian stock/FII fundamental data.
"""
import httpx
from app.config import get_settings

BASE_URL = "https://api.usebolsai.com/api/v1"


def _headers() -> dict:
    settings = get_settings()
    key = settings.bolsai_api_key
    if not key:
        return {}
    return {
        "X-API-Key": key,
        "User-Agent": "InvestAnalytics/2.0 (https://github.com/dominysouzapersonal-commits/invest)",
        "Accept": "application/json",
    }


async def _get(path: str, params: dict | None = None) -> dict | list | None:
    headers = _headers()
    if not headers:
        return None
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{BASE_URL}/{path}", params=params or {}, headers=headers)
        if resp.status_code != 200 or not resp.text.strip():
            return None
        return resp.json()


# ---------------------------------------------------------------------------
# Fundamentals (stocks)
# ---------------------------------------------------------------------------

async def get_fundamentals(ticker: str) -> dict | None:
    """27 indicators from CVM/B3. Matches Status Invest."""
    return await _get(f"fundamentals/{ticker}")


async def get_fundamentals_history(ticker: str, limit: int = 20) -> list[dict]:
    data = await _get(f"fundamentals/{ticker}/history", {"limit": limit})
    if not data or not isinstance(data, dict):
        return []
    return data.get("history", [])


# ---------------------------------------------------------------------------
# Dividends (stocks)
# ---------------------------------------------------------------------------

async def get_dividends(ticker: str, years: int = 5) -> dict | None:
    """DY TTM, annual summary, payment history with JCP/Dividendo split."""
    return await _get(f"dividends/{ticker}", {"years": years})


# ---------------------------------------------------------------------------
# FIIs
# ---------------------------------------------------------------------------

async def get_fii(ticker: str) -> dict | None:
    """FII fundamentals: P/VP, DY TTM, NAV, shareholders."""
    clean = ticker.replace("11", "") if ticker.endswith("11") else ticker
    data = await _get(f"fiis/{ticker}")
    if not data:
        data = await _get(f"fiis/{clean}")
    return data


async def get_fii_distributions(ticker: str, years: int = 5) -> dict | None:
    clean = ticker.replace("11", "") if ticker.endswith("11") else ticker
    data = await _get(f"fiis/{ticker}/distributions", {"years": years})
    if not data:
        data = await _get(f"fiis/{clean}/distributions", {"years": years})
    return data


async def get_fii_history(ticker: str, limit: int = 24) -> list[dict]:
    clean = ticker.replace("11", "") if ticker.endswith("11") else ticker
    data = await _get(f"fiis/{ticker}/history", {"limit": limit})
    if not data:
        data = await _get(f"fiis/{clean}/history", {"limit": limit})
    if not data or not isinstance(data, dict):
        return []
    return data.get("history", [])


# ---------------------------------------------------------------------------
# Screener
# ---------------------------------------------------------------------------

async def screener(
    filters: dict | None = None,
    sort: str = "market_cap",
    order: str = "desc",
    limit: int = 50,
    sector: str | None = None,
) -> list[dict]:
    """Screen all ~264 stocks by fundamental metrics."""
    params: dict = {"sort": sort, "order": order, "limit": limit}
    if sector:
        params["sector"] = sector
    if filters:
        params.update(filters)
    data = await _get("screener", params)
    if not data or not isinstance(data, dict):
        return []
    return data.get("data", [])


# ---------------------------------------------------------------------------
# Macro
# ---------------------------------------------------------------------------

async def get_macro(series: str, limit: int = 1) -> list[dict]:
    """Get macro data: selic, selic_target, ipca, cdi, usd_brl."""
    data = await _get(f"macro/{series}", {"limit": limit})
    if not data or not isinstance(data, dict):
        return []
    return data.get("data", [])


async def get_macro_current() -> dict:
    """Get current SELIC target, IPCA, CDI, USD/BRL."""
    import asyncio
    selic, ipca, usd = await asyncio.gather(
        get_macro("selic_target", 1),
        get_macro("ipca", 12),
        get_macro("usd_brl", 1),
        return_exceptions=True,
    )

    result: dict = {}
    if isinstance(selic, list) and selic:
        result["selic"] = selic[0].get("value")
    if isinstance(ipca, list) and ipca:
        result["ipca_monthly"] = ipca[0].get("value") if ipca else None
        ipca_12m = sum(p.get("value", 0) for p in ipca[:12])
        result["ipca_12m"] = round(ipca_12m, 2)
    if isinstance(usd, list) and usd:
        result["usd_brl"] = usd[0].get("value")
    return result


# ---------------------------------------------------------------------------
# Company info
# ---------------------------------------------------------------------------

async def get_company(ticker: str) -> dict | None:
    return await _get(f"companies/{ticker}")


# ---------------------------------------------------------------------------
# Stock prices & stats
# ---------------------------------------------------------------------------

async def get_quote(ticker: str) -> dict | None:
    return await _get(f"stocks/{ticker}/quote")


async def get_stats(ticker: str) -> dict | None:
    return await _get(f"stocks/{ticker}/stats")


async def get_history(ticker: str, limit: int = 252) -> list[dict]:
    data = await _get(f"stocks/{ticker}/history", {"limit": limit})
    if not data or not isinstance(data, dict):
        return []
    return [
        {
            "date": p.get("trade_date", ""),
            "open": p.get("adjusted_open") or p.get("open", 0),
            "high": p.get("adjusted_high") or p.get("high", 0),
            "low": p.get("adjusted_low") or p.get("low", 0),
            "close": p.get("adjusted_close") or p.get("close", 0),
            "volume": p.get("adjusted_volume") or p.get("volume", 0),
        }
        for p in data.get("prices", [])
    ]


# ---------------------------------------------------------------------------
# Financial statements (raw CVM)
# ---------------------------------------------------------------------------

async def get_financials(
    ticker: str,
    report_type: str = "DFP",
    statement_type: str | None = None,
    limit: int = 100,
) -> list[dict]:
    params: dict = {"report_type": report_type, "limit": limit}
    if statement_type:
        params["statement_type"] = statement_type
    data = await _get(f"financials/{ticker}", params)
    if not data or not isinstance(data, dict):
        return []
    return data.get("statements", [])
