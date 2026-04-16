from fastapi import APIRouter
from app.schemas.analysis import CompareRequest, CompareResult, ScoringWeights
from app.services.analysis_engine import get_full_asset_data
from app.services.scoring import calculate_score

router = APIRouter()


@router.post("/", response_model=list[CompareResult])
async def compare_assets(request: CompareRequest):
    results = []
    weights = request.weights or ScoringWeights()

    for ticker in request.tickers[:4]:  # max 4 assets
        data = await get_full_asset_data(ticker)
        score = calculate_score(data, weights)

        results.append(CompareResult(
            ticker=data.ticker,
            name=data.name,
            asset_type=data.asset_type,
            price=data.price,
            pe_ratio=data.pe_ratio,
            pb_ratio=data.pb_ratio,
            roe=data.roe,
            dividend_yield=data.dividend_yield,
            net_debt_ebitda=data.net_debt_ebitda,
            score=score.total_score,
            recommendation=score.recommendation,
        ))

    return sorted(results, key=lambda x: x.score, reverse=True)
