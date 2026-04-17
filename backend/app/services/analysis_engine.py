import asyncio
import logging
from app.schemas.asset import FundamentalData
from app.services.data_providers import brapi, fmp

logger = logging.getLogger(__name__)


BR_ETFS = {
    "IVVB11", "NASD11", "HASH11", "BOVA11", "SMAL11", "DIVO11", "BOVV11",
    "XFIX11", "EURP11", "ACWI11", "XINA11", "ASIA11", "GOLD11", "WRLD11",
    "USTK11", "TECK11", "BITH11", "ETHE11", "SHOT11", "IMAB11", "IRFM11",
    "B5P211", "FIXA11", "SPXI11", "MATB11", "FIND11",
}


def detect_asset_type(ticker: str) -> str:
    t = ticker.upper().replace(".SA", "")
    if ".SA" in ticker.upper() or _is_br_ticker(t):
        if t in BR_ETFS:
            return "br_etf"
        if t.endswith("11") and len(t) >= 6:
            return "fii"
        if t.endswith(("34", "35", "33")) and len(t) >= 5:
            return "bdr"
        return "br_stock"
    return "us_stock"


def _is_br_ticker(ticker: str) -> bool:
    """Detect BR B3 tickers: 4 letters + 1-2 digits (PETR4, VALE3, HGLG11, SANB11)."""
    if len(ticker) < 5 or len(ticker) > 6:
        return False
    for split_at in (4, 3):
        letters = ticker[:split_at]
        digits = ticker[split_at:]
        if letters.isalpha() and digits.isdigit():
            return True
    return False


async def get_full_asset_data(ticker: str) -> FundamentalData:
    asset_type = detect_asset_type(ticker)
    is_br = asset_type in ("br_stock", "fii", "bdr", "br_etf")

    if is_br:
        return await _fetch_br_asset(ticker, asset_type)
    else:
        return await _fetch_us_asset(ticker, asset_type)


async def _fetch_br_asset(ticker: str, asset_type: str) -> FundamentalData:
    """BR assets: brapi (primary) + FMP for DCF/scores where available."""
    clean = ticker.upper().replace(".SA", "")

    quote_data, brapi_fund = await asyncio.gather(
        brapi.get_quote(clean),
        brapi.get_fundamentals(clean),
        return_exceptions=True,
    )

    quote_data = quote_data if isinstance(quote_data, dict) else {}
    brapi_fund = brapi_fund if isinstance(brapi_fund, dict) else {}

    # Calculate DY from real dividend payments (all BR asset types)
    _enrich_dividend_data(quote_data, brapi_fund)

    # For BR ETFs: calculate returns from historical prices
    if asset_type == "br_etf":
        await _enrich_etf_data(clean, quote_data, brapi_fund)

    # Map brapi growth fields to standard names
    if brapi_fund.get("revenue_growth") is not None and brapi_fund.get("revenue_growth_1y") is None:
        rg = brapi_fund["revenue_growth"]
        brapi_fund["revenue_growth_1y"] = round(rg * 100, 2) if -1.5 < rg < 1.5 and rg != 0 else rg
    if brapi_fund.get("earnings_growth") is not None and brapi_fund.get("profit_growth_1y") is None:
        eg = brapi_fund["earnings_growth"]
        brapi_fund["profit_growth_1y"] = round(eg * 100, 2) if -1.5 < eg < 1.5 and eg != 0 else eg

    # FMP enrichment for BR BDRs (they may have US tickers) — optional
    fmp_scores: dict = {}
    if asset_type == "bdr":
        try:
            fmp_scores = await fmp.get_financial_scores(clean) or {}
        except Exception:
            pass

    extra = {
        "recommendation_key": brapi_fund.get("recommendation_key"),
        "recommendation_mean": brapi_fund.get("recommendation_mean"),
        "target_mean_price": brapi_fund.get("target_mean_price"),
        "target_high_price": brapi_fund.get("target_high_price"),
        "target_low_price": brapi_fund.get("target_low_price"),
        "number_of_analysts": brapi_fund.get("number_of_analyst_opinions"),
        "altman_z_score": fmp_scores.get("altman_z_score"),
        "piotroski_score": fmp_scores.get("piotroski_score"),
    }

    return _build_fundamental_data(ticker, asset_type, quote_data, brapi_fund, extra)


def _enrich_dividend_data(quote_data: dict, brapi_fund: dict) -> None:
    """Calculate DY from actual dividend payments for any BR asset."""
    from datetime import datetime

    divs_data = quote_data.get("dividends_data")
    if not divs_data or not isinstance(divs_data, dict):
        return

    cash_divs = divs_data.get("cashDividends", [])
    price = quote_data.get("price")
    if not cash_divs or not price or price <= 0:
        return

    now = datetime.now()
    one_year_ago = now.replace(year=now.year - 1)

    total_12m = 0.0
    payments_12m = 0
    for d in cash_divs:
        try:
            pay_str = d.get("paymentDate", "")[:10]
            pay_date = datetime.strptime(pay_str, "%Y-%m-%d")
            if pay_date >= one_year_ago:
                total_12m += float(d.get("rate", 0))
                payments_12m += 1
        except (ValueError, TypeError):
            continue

    if total_12m > 0:
        dy = round(total_12m / price * 100, 2)
        quote_data["dividend_yield"] = dy
        brapi_fund["dividend_yield"] = dy


async def _enrich_etf_data(ticker: str, quote_data: dict, brapi_fund: dict) -> None:
    """Calculate returns for BR ETFs from historical prices."""
    prices_1y = await brapi.get_historical(ticker, range_="1y", interval="1mo")
    prices_6m = await brapi.get_historical(ticker, range_="6mo", interval="1mo")
    prices_1m = await brapi.get_historical(ticker, range_="1mo", interval="1d")

    def _calc_return(prices: list[dict]) -> float | None:
        closes = [p.get("close") for p in prices if p.get("close") is not None]
        if len(closes) >= 2 and closes[0] and closes[0] > 0:
            return round((closes[-1] - closes[0]) / closes[0] * 100, 2)
        return None

    ret_1y = _calc_return(prices_1y)
    ret_6m = _calc_return(prices_6m)
    ret_1m = _calc_return(prices_1m)

    if ret_1y is not None:
        brapi_fund["revenue_growth_1y"] = ret_1y
        brapi_fund.setdefault("_label_rg1y", "Retorno 1 ano")
    if ret_6m is not None:
        brapi_fund["profit_growth_1y"] = ret_6m
        brapi_fund.setdefault("_label_pg1y", "Retorno 6 meses")
    if ret_1m is not None:
        brapi_fund["earnings_growth"] = ret_1m
        brapi_fund.setdefault("_label_eg", "Retorno 1 mês")

    # Use DY from dividends if ETF pays (e.g. DIVO11, XFIX11)
    divs_data = quote_data.get("dividends_data")
    if divs_data and isinstance(divs_data, dict):
        from datetime import datetime
        cash_divs = divs_data.get("cashDividends", [])
        price = quote_data.get("price")
        if cash_divs and price and price > 0:
            now = datetime.now()
            y_ago = now.replace(year=now.year - 1)
            total = 0.0
            for d in cash_divs:
                try:
                    pd_ = datetime.strptime(d.get("paymentDate", "")[:10], "%Y-%m-%d")
                    if pd_ >= y_ago:
                        total += float(d.get("rate", 0))
                except (ValueError, TypeError):
                    continue
            if total > 0:
                brapi_fund["dividend_yield"] = round(total / price * 100, 2)
                quote_data["dividend_yield"] = round(total / price * 100, 2)


async def _fetch_us_asset(ticker: str, asset_type: str) -> FundamentalData:
    """US assets: FMP (primary) for everything."""
    clean = ticker.upper()

    fmp_fund, fmp_growth, fmp_scores, fmp_peers, fmp_dcf, grades_consensus, pt_consensus = (
        await asyncio.gather(
            fmp.get_fundamentals(clean),
            fmp.get_growth(clean),
            fmp.get_financial_scores(clean),
            fmp.get_peers(clean),
            fmp.get_dcf(clean),
            fmp.get_grades_consensus(clean),
            fmp.get_price_target_consensus(clean),
            return_exceptions=True,
        )
    )

    fmp_fund = fmp_fund if isinstance(fmp_fund, dict) else {}
    fmp_growth = fmp_growth if isinstance(fmp_growth, dict) else {}
    fmp_scores = fmp_scores if isinstance(fmp_scores, dict) else {}
    fmp_peers = fmp_peers if isinstance(fmp_peers, list) else []
    fmp_dcf = fmp_dcf if isinstance(fmp_dcf, dict) else None
    grades_consensus = grades_consensus if isinstance(grades_consensus, dict) else None
    pt_consensus = pt_consensus if isinstance(pt_consensus, dict) else None

    # Try fetching RSI/SMA (non-critical)
    rsi_data, sma50_data, sma200_data = await asyncio.gather(
        fmp.get_rsi(clean),
        fmp.get_sma(clean, period=50),
        fmp.get_sma(clean, period=200),
        return_exceptions=True,
    )

    rsi_14 = None
    sma_50 = None
    sma_200 = None
    if isinstance(rsi_data, list) and rsi_data:
        rsi_14 = rsi_data[0].get("rsi")
    if isinstance(sma50_data, list) and sma50_data:
        sma_50 = sma50_data[0].get("sma")
    if isinstance(sma200_data, list) and sma200_data:
        sma_200 = sma200_data[0].get("sma")

    # Build quote from FMP profile data
    quote_data = {
        "name": fmp_fund.get("name"),
        "price": fmp_fund.get("price"),
        "market_cap": fmp_fund.get("market_cap"),
        "volume": fmp_fund.get("avg_volume"),
        "sector": fmp_fund.get("sector"),
        "industry": fmp_fund.get("industry"),
        "currency": "USD",
        "logo_url": fmp_fund.get("logo_url"),
        "description": fmp_fund.get("description"),
    }

    fundamentals = {**fmp_fund}
    fundamentals.update({k: v for k, v in fmp_growth.items() if v is not None})

    # DCF data
    dcf_value = None
    dcf_upside_pct = None
    if fmp_dcf and fmp_dcf.get("dcf_value") is not None:
        dcf_value = fmp_dcf["dcf_value"]
        price = fmp_fund.get("price")
        if price and price > 0:
            dcf_upside_pct = round((dcf_value - price) / price * 100, 2)

    extra = {
        "altman_z_score": fmp_scores.get("altman_z_score"),
        "piotroski_score": fmp_scores.get("piotroski_score"),
        "peers": fmp_peers if fmp_peers else None,
        "dcf_value": dcf_value,
        "dcf_upside_pct": dcf_upside_pct,
        "grades_consensus": grades_consensus,
        "price_target_consensus": pt_consensus,
        "rsi_14": rsi_14,
        "sma_50": sma_50,
        "sma_200": sma_200,
        "eps": fmp_fund.get("eps"),
        "book_value_per_share": fmp_fund.get("book_value_per_share"),
        "fcf_per_share": fmp_fund.get("fcf_per_share"),
        "earnings_yield": fmp_fund.get("earnings_yield"),
        "fcf_yield": fmp_fund.get("fcf_yield"),
    }

    return _build_fundamental_data(ticker, asset_type, quote_data, fundamentals, extra)


async def get_historical(ticker: str, period: str = "1y") -> list[dict]:
    asset_type = detect_asset_type(ticker)
    is_br = asset_type in ("br_stock", "fii", "bdr", "br_etf")

    if is_br:
        clean = ticker.upper().replace(".SA", "")
        range_map = {"1mo": "1mo", "3mo": "3mo", "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y"}
        brapi_range = range_map.get(period, "1y")
        prices = await brapi.get_historical(clean, range_=brapi_range)
        if prices:
            return prices

    # Fallback: FMP historical
    from datetime import datetime, timedelta
    period_days = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365, "2y": 730, "5y": 1825}
    days = period_days.get(period, 365)
    from_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    to_date = datetime.now().strftime("%Y-%m-%d")
    return await fmp.get_historical(ticker.upper(), from_date, to_date)


# ---------------------------------------------------------------------------
# Batch analysis (for report)
# ---------------------------------------------------------------------------

async def get_full_asset_data_batch(tickers: list[str]) -> list[FundamentalData]:
    """Analyze multiple assets efficiently using batch APIs."""
    results = []
    tasks = [get_full_asset_data(t) for t in tickers]
    completed = await asyncio.gather(*tasks, return_exceptions=True)
    for i, res in enumerate(completed):
        if isinstance(res, FundamentalData):
            results.append(res)
        else:
            logger.warning(f"Failed to fetch {tickers[i]}: {res}")
    return results


# ---------------------------------------------------------------------------
# Builder
# ---------------------------------------------------------------------------


def _dte_pct(val) -> float | None:
    """Normalize debt-to-equity: brapi returns as ratio (1.19 = 119%), convert to %."""
    if val is None:
        return None
    v = float(val)
    if v < 50:
        return round(v * 100, 2)
    return round(v, 2)


def _build_fundamental_data(
    ticker: str, asset_type: str, quote: dict, fund: dict, extra: dict | None = None
) -> FundamentalData:
    extra = extra or {}

    def _pct(val):
        if val is None:
            return None
        if isinstance(val, (int, float)) and -1.5 < val < 1.5 and val != 0:
            return round(val * 100, 2)
        return round(val, 2)

    return FundamentalData(
        ticker=ticker.upper().replace(".SA", ""),
        name=quote.get("name") or fund.get("name") or ticker.upper(),
        asset_type=asset_type,
        sector=quote.get("sector") or fund.get("sector"),
        industry=quote.get("industry") or fund.get("industry"),
        currency=quote.get("currency", "BRL" if asset_type != "us_stock" else "USD"),
        description=quote.get("description") or fund.get("description"),
        logo_url=quote.get("logo_url") or fund.get("logo_url"),

        price=quote.get("price") or fund.get("price"),
        change_percent=quote.get("change_percent"),
        market_cap=quote.get("market_cap") or fund.get("market_cap"),
        volume=quote.get("volume"),

        pe_ratio=fund.get("pe_ratio") or quote.get("pe_ratio"),
        forward_pe=fund.get("forward_pe"),
        pb_ratio=fund.get("pb_ratio"),
        ev_ebitda=fund.get("ev_ebitda"),
        psr=fund.get("psr"),
        price_to_assets=fund.get("price_to_assets"),
        peg_ratio=fund.get("peg_ratio"),
        price_to_fcf=fund.get("price_to_fcf"),
        ev_revenue=fund.get("ev_revenue"),

        roe=_pct(fund.get("roe")),
        roa=_pct(fund.get("roa")),
        roic=_pct(fund.get("roic")),
        net_margin=_pct(fund.get("net_margin")),
        ebitda_margin=_pct(fund.get("ebitda_margin")),
        gross_margin=_pct(fund.get("gross_margin")),
        operating_margin=_pct(fund.get("operating_margin")),

        revenue_growth_1y=fund.get("revenue_growth_1y"),
        revenue_growth_3y=fund.get("revenue_growth_3y"),
        revenue_growth_5y=fund.get("revenue_growth_5y"),
        profit_growth_1y=fund.get("profit_growth_1y"),
        profit_growth_3y=fund.get("profit_growth_3y"),
        profit_growth_5y=fund.get("profit_growth_5y"),
        ebitda_growth_1y=fund.get("ebitda_growth_1y"),
        eps_growth_1y=fund.get("eps_growth_1y"),
        fcf_growth_1y=fund.get("fcf_growth_1y"),

        dividend_yield=fund.get("dividend_yield") or quote.get("dividend_yield"),
        payout_ratio=_pct(fund.get("payout_ratio")),
        dividend_consistency=None,

        net_debt_ebitda=fund.get("net_debt_ebitda"),
        net_debt_equity=fund.get("net_debt_equity") or _dte_pct(fund.get("debt_to_equity")),
        current_ratio=fund.get("current_ratio"),
        quick_ratio=fund.get("quick_ratio"),
        interest_coverage=fund.get("interest_coverage"),
        debt_to_equity=_dte_pct(fund.get("debt_to_equity")),
        debt_to_assets=fund.get("debt_to_assets"),

        avg_volume=fund.get("avg_volume") or quote.get("avg_volume"),
        volatility=None,
        beta=fund.get("beta") or quote.get("beta"),
        high_52w=quote.get("high_52w"),
        low_52w=quote.get("low_52w"),

        fii_type=None,
        vacancy_rate=None,
        cap_rate=None,

        altman_z_score=extra.get("altman_z_score"),
        piotroski_score=int(extra["piotroski_score"]) if extra.get("piotroski_score") is not None else None,

        dcf_value=extra.get("dcf_value"),
        dcf_upside_pct=extra.get("dcf_upside_pct"),

        recommendation_key=extra.get("recommendation_key") or quote.get("recommendation_key"),
        recommendation_mean=extra.get("recommendation_mean") or quote.get("recommendation_mean"),
        target_mean_price=extra.get("target_mean_price") or quote.get("target_mean_price"),
        target_high_price=extra.get("target_high_price") or quote.get("target_high_price"),
        target_low_price=extra.get("target_low_price") or quote.get("target_low_price"),
        number_of_analysts=extra.get("number_of_analysts") or quote.get("number_of_analysts"),

        grades_consensus=extra.get("grades_consensus"),
        price_target_consensus=extra.get("price_target_consensus"),

        rsi_14=extra.get("rsi_14"),
        sma_50=extra.get("sma_50"),
        sma_200=extra.get("sma_200"),

        eps=extra.get("eps"),
        book_value_per_share=extra.get("book_value_per_share"),
        fcf_per_share=extra.get("fcf_per_share"),
        earnings_yield=extra.get("earnings_yield"),
        fcf_yield=extra.get("fcf_yield"),

        peers=extra.get("peers"),
    )
