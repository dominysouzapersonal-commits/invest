from pydantic import BaseModel
from typing import Optional


class AssetSearch(BaseModel):
    ticker: str
    name: str
    asset_type: str
    exchange: str
    currency: str


class AssetQuote(BaseModel):
    ticker: str
    name: str
    asset_type: str
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    currency: str
    exchange: str
    updated_at: str


class HistoricalPrice(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class FundamentalData(BaseModel):
    ticker: str
    name: str
    asset_type: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    currency: str

    # Quote
    price: Optional[float] = None
    change_percent: Optional[float] = None
    market_cap: Optional[float] = None
    volume: Optional[int] = None

    # Valuation
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    psr: Optional[float] = None
    price_to_assets: Optional[float] = None
    peg_ratio: Optional[float] = None
    price_to_fcf: Optional[float] = None

    # Profitability
    roe: Optional[float] = None
    roa: Optional[float] = None
    roic: Optional[float] = None
    net_margin: Optional[float] = None
    ebitda_margin: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None

    # Growth
    revenue_growth_1y: Optional[float] = None
    revenue_growth_3y: Optional[float] = None
    revenue_growth_5y: Optional[float] = None
    profit_growth_1y: Optional[float] = None
    profit_growth_3y: Optional[float] = None
    profit_growth_5y: Optional[float] = None

    # Dividends
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None
    dividend_consistency: Optional[int] = None

    # Debt
    net_debt_ebitda: Optional[float] = None
    net_debt_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    interest_coverage: Optional[float] = None

    # Market
    avg_volume: Optional[int] = None
    volatility: Optional[float] = None
    beta: Optional[float] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None

    # FII-specific
    fii_type: Optional[str] = None
    vacancy_rate: Optional[float] = None
    cap_rate: Optional[float] = None

    # Advanced scores (FMP paid)
    altman_z_score: Optional[float] = None
    piotroski_score: Optional[int] = None

    # Analyst data (brapi paid)
    recommendation_key: Optional[str] = None
    target_mean_price: Optional[float] = None
    number_of_analysts: Optional[int] = None

    # Peers
    peers: Optional[list[str]] = None


class AssetDetail(BaseModel):
    fundamentals: FundamentalData
    historical_prices: list[HistoricalPrice]
    score: Optional["ScoreResult"] = None


class ScoreResult(BaseModel):
    total_score: float
    recommendation: str
    valuation_score: float
    profitability_score: float
    dividends_score: float
    debt_score: float
    growth_score: float
    details: dict


AssetDetail.model_rebuild()
