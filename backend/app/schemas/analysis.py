from pydantic import BaseModel
from typing import Optional


class ScoringWeights(BaseModel):
    weight_valuation: int = 20
    weight_profitability: int = 20
    weight_fcf_quality: int = 15
    weight_dividends: int = 15
    weight_debt: int = 18
    weight_growth: int = 12


class AnalysisRequest(BaseModel):
    ticker: str
    weights: Optional[ScoringWeights] = None


class CompareRequest(BaseModel):
    tickers: list[str]
    weights: Optional[ScoringWeights] = None


class CompareResult(BaseModel):
    ticker: str
    name: str
    asset_type: str
    price: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    roe: Optional[float] = None
    dividend_yield: Optional[float] = None
    net_debt_ebitda: Optional[float] = None
    score: float
    recommendation: str


class AssetAnalysis(BaseModel):
    """Full analysis of a single asset for the report."""
    ticker: str
    name: str
    asset_type: str
    sector: Optional[str] = None
    price: Optional[float] = None
    currency: str = "BRL"
    market_cap: Optional[float] = None
    logo_url: Optional[str] = None

    score: float
    recommendation: str
    valuation_score: float
    profitability_score: float
    fcf_quality_score: float = 50.0
    dividends_score: float
    debt_score: float
    growth_score: float

    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    roe: Optional[float] = None
    roic: Optional[float] = None
    net_margin: Optional[float] = None
    dividend_yield: Optional[float] = None
    net_debt_ebitda: Optional[float] = None
    current_ratio: Optional[float] = None
    revenue_growth_1y: Optional[float] = None
    profit_growth_1y: Optional[float] = None

    piotroski_score: Optional[int] = None
    altman_z_score: Optional[float] = None
    dcf_value: Optional[float] = None
    dcf_upside_pct: Optional[float] = None

    recommendation_key: Optional[str] = None
    target_mean_price: Optional[float] = None
    rsi_14: Optional[float] = None

    why_yes: Optional[str] = None
    why_no: Optional[str] = None


class CategoryRecommendation(BaseModel):
    """A recommended allocation within one category."""
    category: str
    category_label: str
    target_pct: float
    target_amount: float
    assets: list[AssetAnalysis]
    top_pick: Optional[str] = None
    rationale: str


class MacroData(BaseModel):
    selic_current: Optional[float] = None
    ipca_current: Optional[float] = None
    usd_brl: Optional[float] = None
    eur_brl: Optional[float] = None


class FullReport(BaseModel):
    """The complete investment analysis report."""
    generated_at: str
    investor_profile: dict
    macro: MacroData
    total_assets_analyzed: int
    categories: list[CategoryRecommendation]
    all_assets: list[AssetAnalysis]
    portfolio_summary: dict
    methodology: str
