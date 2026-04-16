import logging
from fastapi import APIRouter, Query, HTTPException
from app.services.data_providers import brapi, fmp
from app.services.analysis_engine import get_full_asset_data, get_historical, detect_asset_type
from app.schemas.asset import AssetSearch, AssetDetail
from app.services.scoring import calculate_score

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/search", response_model=list[AssetSearch])
async def search_assets(q: str = Query(..., min_length=1)):
    br_results = await brapi.search_assets(q)
    us_results = await fmp.search_assets(q)
    return br_results + us_results


@router.get("/{ticker}", response_model=AssetDetail)
async def get_asset_detail(ticker: str, period: str = "1y"):
    try:
        fundamentals = await get_full_asset_data(ticker)
    except Exception as e:
        logger.error(f"Failed to fetch fundamentals for {ticker}: {e}")
        raise HTTPException(502, f"Failed to fetch data for {ticker}")

    try:
        historical = await get_historical(ticker, period)
    except Exception:
        historical = []

    try:
        score = calculate_score(fundamentals)
    except Exception:
        score = None

    return AssetDetail(
        fundamentals=fundamentals,
        historical_prices=historical,
        score=score,
    )


@router.get("/{ticker}/quote")
async def get_quote(ticker: str):
    asset_type = detect_asset_type(ticker)
    if asset_type in ("br_stock", "fii", "bdr"):
        return await brapi.get_quote(ticker.replace(".SA", ""))
    return await fmp.get_quote(ticker)


@router.get("/{ticker}/history")
async def get_history(ticker: str, period: str = "1y"):
    return await get_historical(ticker, period)
