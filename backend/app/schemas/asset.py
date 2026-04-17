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
    description: Optional[str] = None
    logo_url: Optional[str] = None

    # Quote
    price: Optional[float] = None
    change_percent: Optional[float] = None
    market_cap: Optional[float] = None
    volume: Optional[int] = None

    # Valuation
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    psr: Optional[float] = None
    price_to_assets: Optional[float] = None
    peg_ratio: Optional[float] = None
    price_to_fcf: Optional[float] = None
    ev_revenue: Optional[float] = None

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
    ebitda_growth_1y: Optional[float] = None
    eps_growth_1y: Optional[float] = None
    fcf_growth_1y: Optional[float] = None

    # Dividends
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None
    dividend_consistency: Optional[int] = None

    # Debt & Liquidity
    net_debt_ebitda: Optional[float] = None
    net_debt_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    interest_coverage: Optional[float] = None
    debt_to_equity: Optional[float] = None
    debt_to_assets: Optional[float] = None

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

    # Advanced scores (FMP)
    altman_z_score: Optional[float] = None
    piotroski_score: Optional[int] = None

    # DCF Valuation (FMP)
    dcf_value: Optional[float] = None
    dcf_upside_pct: Optional[float] = None

    # Analyst data
    recommendation_key: Optional[str] = None
    recommendation_mean: Optional[float] = None
    target_mean_price: Optional[float] = None
    target_high_price: Optional[float] = None
    target_low_price: Optional[float] = None
    number_of_analysts: Optional[int] = None

    # Analyst grades consensus (FMP)
    grades_consensus: Optional[dict] = None
    price_target_consensus: Optional[dict] = None

    # Technical indicators
    rsi_14: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None

    # Per-share
    eps: Optional[float] = None
    book_value_per_share: Optional[float] = None
    fcf_per_share: Optional[float] = None
    earnings_yield: Optional[float] = None
    fcf_yield: Optional[float] = None

    # Peers
    peers: Optional[list[str]] = None

    # News
    recent_news: Optional[list[dict]] = None

    # Insider trades summary
    insider_trades: Optional[list[dict]] = None


class AssetDetail(BaseModel):
    fundamentals: FundamentalData
    historical_prices: list[HistoricalPrice]
    score: Optional["ScoreResult"] = None


class ScoreResult(BaseModel):
    total_score: float
    recommendation: str
    valuation_score: float
    profitability_score: float
    fcf_quality_score: float
    dividends_score: float
    debt_score: float
    growth_score: float
    details: dict


AssetDetail.model_rebuild()
