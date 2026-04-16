from fastapi import APIRouter, Depends
from app.database import get_db
from app.schemas.analysis import ScoringWeights
from app.schemas.asset import ScoreResult
from app.services.analysis_engine import get_full_asset_data
from app.services.scoring import calculate_score
from app.models.cache import get_scoring_config, upsert_scoring_config
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/{ticker}/score", response_model=ScoreResult)
async def get_score(ticker: str, user: dict = Depends(get_current_user)):
    db = get_db()
    config = await get_scoring_config(db, user["id"])
    weights = None
    if config:
        weights = ScoringWeights(
            weight_valuation=config.get("weight_valuation", 25),
            weight_profitability=config.get("weight_profitability", 25),
            weight_dividends=config.get("weight_dividends", 20),
            weight_debt=config.get("weight_debt", 20),
            weight_growth=config.get("weight_growth", 10),
        )

    fundamentals = await get_full_asset_data(ticker)
    return calculate_score(fundamentals, weights)


@router.post("/score", response_model=ScoreResult)
async def score_with_weights(ticker: str, weights: ScoringWeights):
    fundamentals = await get_full_asset_data(ticker)
    return calculate_score(fundamentals, weights)


@router.get("/weights", response_model=ScoringWeights)
async def get_weights(user: dict = Depends(get_current_user)):
    db = get_db()
    config = await get_scoring_config(db, user["id"])
    if not config:
        return ScoringWeights()
    return ScoringWeights(
        weight_valuation=config.get("weight_valuation", 25),
        weight_profitability=config.get("weight_profitability", 25),
        weight_dividends=config.get("weight_dividends", 20),
        weight_debt=config.get("weight_debt", 20),
        weight_growth=config.get("weight_growth", 10),
    )


@router.put("/weights", response_model=ScoringWeights)
async def update_weights(weights: ScoringWeights, user: dict = Depends(get_current_user)):
    db = get_db()
    await upsert_scoring_config(db, user["id"], weights.model_dump())
    return weights
