import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta


def get_quote(ticker: str) -> dict | None:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        if not info or info.get("regularMarketPrice") is None:
            return None
    except Exception:
        return None

    return {
        "ticker": info.get("symbol", ticker),
        "name": info.get("longName") or info.get("shortName") or ticker,
        "price": info.get("regularMarketPrice") or info.get("currentPrice"),
        "change": info.get("regularMarketChange"),
        "change_percent": info.get("regularMarketChangePercent"),
        "volume": info.get("regularMarketVolume") or info.get("volume"),
        "market_cap": info.get("marketCap"),
        "high_52w": info.get("fiftyTwoWeekHigh"),
        "low_52w": info.get("fiftyTwoWeekLow"),
        "currency": info.get("currency", "USD"),
        "exchange": info.get("exchange", ""),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
    }


def get_fundamentals(ticker: str) -> dict | None:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        if not info:
            return None
    except Exception:
        return None

    return {
        "pe_ratio": info.get("trailingPE"),
        "forward_pe": info.get("forwardPE"),
        "pb_ratio": info.get("priceToBook"),
        "ev_ebitda": info.get("enterpriseToEbitda"),
        "psr": info.get("priceToSalesTrailing12Months"),
        "roe": info.get("returnOnEquity"),
        "roa": info.get("returnOnAssets"),
        "gross_margin": info.get("grossMargins"),
        "ebitda_margin": info.get("ebitdaMargins"),
        "net_margin": info.get("profitMargins"),
        "revenue_growth": info.get("revenueGrowth"),
        "earnings_growth": info.get("earningsGrowth"),
        "dividend_yield": info.get("dividendYield"),
        "payout_ratio": info.get("payoutRatio"),
        "current_ratio": info.get("currentRatio"),
        "debt_to_equity": info.get("debtToEquity"),
        "beta": info.get("beta"),
        "avg_volume": info.get("averageDailyVolume3Month"),
    }


def get_historical_prices(ticker: str, period: str = "1y") -> list[dict]:
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            return []
    except Exception:
        return []

    prices = []
    for date, row in hist.iterrows():
        prices.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        })
    return prices


def get_growth_metrics(ticker: str) -> dict:
    """Calculate revenue/profit growth over multiple periods."""
    try:
        stock = yf.Ticker(ticker)
        financials = stock.financials
        if financials is None or financials.empty:
            return {}
    except Exception:
        return {}

    result = {}
    try:
        revenue = financials.loc["Total Revenue"] if "Total Revenue" in financials.index else None
        net_income = financials.loc["Net Income"] if "Net Income" in financials.index else None

        if revenue is not None and len(revenue) >= 2:
            r = revenue.sort_index()
            result["revenue_growth_1y"] = _calc_growth(r.iloc[-2], r.iloc[-1])
            if len(r) >= 4:
                result["revenue_growth_3y"] = _calc_cagr(r.iloc[-4], r.iloc[-1], 3)

        if net_income is not None and len(net_income) >= 2:
            ni = net_income.sort_index()
            result["profit_growth_1y"] = _calc_growth(ni.iloc[-2], ni.iloc[-1])
            if len(ni) >= 4:
                result["profit_growth_3y"] = _calc_cagr(ni.iloc[-4], ni.iloc[-1], 3)
    except Exception:
        pass

    return result


def _calc_growth(old: float, new: float) -> float | None:
    if old and old != 0:
        return round((new - old) / abs(old) * 100, 2)
    return None


def _calc_cagr(start: float, end: float, years: int) -> float | None:
    if start and start > 0 and end and end > 0:
        return round(((end / start) ** (1 / years) - 1) * 100, 2)
    return None
