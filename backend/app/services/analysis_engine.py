from app.schemas.asset import FundamentalData
from app.services.data_providers import brapi, yfinance_provider, fmp, fundamentus


def detect_asset_type(ticker: str) -> str:
    t = ticker.upper()
    if ".SA" in t or ("." not in t and _is_br_ticker(t)):
        clean = t.replace(".SA", "")
        if clean.endswith("11") and len(clean) >= 6:
            return "fii"
        if clean.endswith(("34", "35", "33")) and len(clean) >= 5:
            return "bdr"
        return "br_stock"
    return "us_stock"


def _is_br_ticker(ticker: str) -> bool:
    if len(ticker) < 5 or len(ticker) > 6:
        return False
    letters = ticker[:-1] if ticker[-1].isdigit() else ticker[:-2]
    digits = ticker[len(letters):]
    return letters.isalpha() and digits.isdigit()


async def get_full_asset_data(ticker: str) -> FundamentalData:
    asset_type = detect_asset_type(ticker)
    is_br = asset_type in ("br_stock", "fii", "bdr")

    fundamentals: dict = {}
    quote_data: dict = {}
    extra: dict = {}

    if is_br:
        clean_ticker = ticker.upper().replace(".SA", "")

        # Primary: brapi (paid plan - full fundamentals + dividends)
        quote_data = await brapi.get_quote(clean_ticker) or {}
        brapi_fund = await brapi.get_fundamentals(clean_ticker) or {}

        # Secondary: Fundamentus (deep BR fundamentalista data via scraping)
        fundamentus_data = await fundamentus.get_fundamentals(clean_ticker) or {}

        # Merge: fundamentus overwrites brapi for BR-specific metrics
        fundamentals = {**brapi_fund, **fundamentus_data}

        # Tertiary: yfinance as fallback for any missing data
        yf_ticker = f"{clean_ticker}.SA"
        yf_data = yfinance_provider.get_fundamentals(yf_ticker) or {}
        growth = yfinance_provider.get_growth_metrics(yf_ticker)

        for k, v in yf_data.items():
            if v is not None and fundamentals.get(k) is None:
                fundamentals[k] = v
        fundamentals.update({k: v for k, v in growth.items() if v is not None})

        # Extract brapi analyst data
        extra["recommendation_key"] = brapi_fund.get("recommendation_key")
        extra["target_mean_price"] = brapi_fund.get("target_mean_price")
        extra["number_of_analysts"] = brapi_fund.get("number_of_analyst_opinions")
    else:
        # Primary: FMP (paid plan - comprehensive US data)
        fmp_fund = await fmp.get_fundamentals(ticker) or {}
        fmp_growth = await fmp.get_growth(ticker) or {}
        fmp_scores = await fmp.get_financial_scores(ticker) or {}
        fmp_peers = await fmp.get_peers(ticker) or []

        # Secondary: yfinance for quote/historical
        yf_quote = yfinance_provider.get_quote(ticker) or {}
        yf_fund = yfinance_provider.get_fundamentals(ticker) or {}
        growth = yfinance_provider.get_growth_metrics(ticker)

        quote_data = {**yf_quote, **{k: v for k, v in fmp_fund.items() if k in ("price", "market_cap", "avg_volume") and v is not None}}
        fundamentals = {**yf_fund, **{k: v for k, v in fmp_fund.items() if v is not None}}
        fundamentals.update({k: v for k, v in fmp_growth.items() if v is not None})
        for k, v in growth.items():
            if v is not None and fundamentals.get(k) is None:
                fundamentals[k] = v

        extra["altman_z_score"] = fmp_scores.get("altman_z_score")
        extra["piotroski_score"] = fmp_scores.get("piotroski_score")
        extra["peers"] = fmp_peers if fmp_peers else None

    return _build_fundamental_data(ticker, asset_type, quote_data, fundamentals, extra)


async def get_historical(ticker: str, period: str = "1y") -> list[dict]:
    """Use brapi for BR assets (better data), yfinance for US."""
    asset_type = detect_asset_type(ticker)
    is_br = asset_type in ("br_stock", "fii", "bdr")

    if is_br:
        clean_ticker = ticker.upper().replace(".SA", "")
        range_map = {"1mo": "1mo", "3mo": "3mo", "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y"}
        brapi_range = range_map.get(period, "1y")
        prices = await brapi.get_historical(clean_ticker, range_=brapi_range)
        if prices:
            return prices
        # Fallback to yfinance
        return yfinance_provider.get_historical_prices(f"{clean_ticker}.SA", period)
    else:
        return yfinance_provider.get_historical_prices(ticker.upper(), period)


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
        ticker=ticker.upper(),
        name=quote.get("name") or fund.get("name") or ticker.upper(),
        asset_type=asset_type,
        sector=quote.get("sector") or fund.get("sector"),
        industry=quote.get("industry") or fund.get("industry"),
        currency=quote.get("currency", "BRL" if asset_type != "us_stock" else "USD"),

        price=quote.get("price") or fund.get("price"),
        change_percent=quote.get("change_percent"),
        market_cap=quote.get("market_cap") or fund.get("market_cap"),
        volume=quote.get("volume"),

        pe_ratio=fund.get("pe_ratio") or quote.get("pe_ratio"),
        pb_ratio=fund.get("pb_ratio"),
        ev_ebitda=fund.get("ev_ebitda"),
        psr=fund.get("psr"),
        price_to_assets=fund.get("price_to_assets"),
        peg_ratio=fund.get("peg_ratio"),
        price_to_fcf=fund.get("price_to_fcf"),

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

        dividend_yield=fund.get("dividend_yield") or quote.get("dividend_yield"),
        payout_ratio=_pct(fund.get("payout_ratio")),
        dividend_consistency=None,

        net_debt_ebitda=fund.get("net_debt_ebitda"),
        net_debt_equity=fund.get("net_debt_equity") or fund.get("debt_to_equity"),
        current_ratio=fund.get("current_ratio"),
        quick_ratio=fund.get("quick_ratio"),
        interest_coverage=fund.get("interest_coverage"),

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
        recommendation_key=extra.get("recommendation_key"),
        target_mean_price=extra.get("target_mean_price"),
        number_of_analysts=extra.get("number_of_analysts"),
        peers=extra.get("peers"),
    )
