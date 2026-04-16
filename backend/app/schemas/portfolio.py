from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PositionCreate(BaseModel):
    ticker: str
    asset_type: str
    quantity: float
    avg_price: float
    currency: str = "BRL"
    broker: str = "XP Investimentos"


class PositionUpdate(BaseModel):
    quantity: Optional[float] = None
    avg_price: Optional[float] = None


class PositionResponse(BaseModel):
    id: str
    ticker: str
    asset_type: str
    quantity: float
    avg_price: float
    currency: str
    broker: str
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_pct: Optional[float] = None


class PortfolioSummary(BaseModel):
    total_invested: float
    total_current: float
    total_profit_loss: float
    total_profit_loss_pct: float
    positions: list[PositionResponse]
    allocation_by_type: dict[str, float]
    allocation_by_sector: dict[str, float]


class TransactionCreate(BaseModel):
    ticker: str
    asset_type: str
    operation: str
    quantity: float
    price: float
    date: str
    currency: str = "BRL"


class TransactionResponse(BaseModel):
    id: str
    ticker: str
    asset_type: str
    operation: str
    quantity: float
    price: float
    total: float
    currency: str
    date: datetime
    broker: str


class WatchlistCreate(BaseModel):
    ticker: str
    asset_type: str
    target_price: Optional[float] = None
    target_score: Optional[float] = None
    notes: Optional[str] = None


class WatchlistResponse(BaseModel):
    id: str
    ticker: str
    asset_type: str
    target_price: Optional[float] = None
    target_score: Optional[float] = None
    notes: Optional[str] = None
    alert_enabled: bool = True
    current_price: Optional[float] = None
    current_score: Optional[float] = None
