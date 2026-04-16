from pydantic import BaseModel
from typing import Optional


class ScoringWeights(BaseModel):
    weight_valuation: int = 25
    weight_profitability: int = 25
    weight_dividends: int = 20
    weight_debt: int = 20
    weight_growth: int = 10


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
