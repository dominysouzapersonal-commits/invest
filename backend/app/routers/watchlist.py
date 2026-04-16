from fastapi import APIRouter, Depends, HTTPException
from app.database import get_db
from app.models.watchlist import find_watchlist, add_watchlist_item, remove_watchlist_item
from app.schemas.portfolio import WatchlistCreate, WatchlistResponse
from app.services.analysis_engine import get_full_asset_data
from app.services.scoring import calculate_score
from app.services.data_providers import brapi, yfinance_provider
from app.utils.auth import get_current_user
from pymongo.errors import DuplicateKeyError

router = APIRouter()


@router.get("/", response_model=list[WatchlistResponse])
async def list_watchlist_items(user: dict = Depends(get_current_user)):
    db = get_db()
    items = await find_watchlist(db, user["id"])
    results = []
    for item in items:
        current_price = None
        current_score = None
        try:
            if item["asset_type"] in ("br_stock", "fii", "bdr"):
                quote = await brapi.get_quote(item["ticker"])
                current_price = quote.get("price") if quote else None
            else:
                quote = yfinance_provider.get_quote(item["ticker"])
                current_price = quote.get("price") if quote else None

            data = await get_full_asset_data(item["ticker"])
            score = calculate_score(data)
            current_score = score.total_score
        except Exception:
            pass

        results.append(WatchlistResponse(
            id=item["id"],
            ticker=item["ticker"],
            asset_type=item["asset_type"],
            target_price=item.get("target_price"),
            target_score=item.get("target_score"),
            notes=item.get("notes"),
            alert_enabled=item.get("alert_enabled", True),
            current_price=current_price,
            current_score=current_score,
        ))
    return results


@router.post("/", response_model=WatchlistResponse)
async def add_to_watchlist(item: WatchlistCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        doc = await add_watchlist_item(db, user["id"], item.model_dump())
    except DuplicateKeyError:
        raise HTTPException(400, f"{item.ticker} já está na watchlist")

    return WatchlistResponse(
        id=doc["id"],
        ticker=doc["ticker"],
        asset_type=doc["asset_type"],
        target_price=doc.get("target_price"),
        target_score=doc.get("target_score"),
        notes=doc.get("notes"),
        alert_enabled=doc.get("alert_enabled", True),
    )


@router.delete("/{item_id}")
async def remove_from_watchlist(item_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    deleted = await remove_watchlist_item(db, item_id)
    if not deleted:
        raise HTTPException(404, "Item não encontrado na watchlist")
    return {"message": "Removido da watchlist"}
