from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from app.database import get_db
from app.models.portfolio import (
    find_positions, find_position_by_ticker, create_position,
    update_position, delete_position, find_transactions,
)
from app.schemas.portfolio import (
    PositionCreate, PositionUpdate, PositionResponse,
    PortfolioSummary, TransactionResponse,
)
from app.services import portfolio_service
from app.utils.xp_parser import parse_xp_extract
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/quotes-bulk")
async def quotes_bulk(tickers: str = Query(..., description="Tickers separados por vírgula. Ex: INTB3,SUZB3,NASD11")):
    """Endpoint PÚBLICO de cotações em lote (sem auth) — usado pela página da carteira fixa.
    Cacheado 60s no backend, sem afetar a quota da brapi."""
    parsed = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not parsed:
        return {"prices": {}}
    if len(parsed) > 30:
        raise HTTPException(400, "Máximo 30 tickers por request")
    prices = await portfolio_service.get_prices_for_tickers(parsed)
    return {"prices": prices}


@router.get("/summary", response_model=PortfolioSummary)
async def get_summary(user: dict = Depends(get_current_user)):
    db = get_db()
    return await portfolio_service.get_portfolio_summary(db, user["id"])


@router.get("/positions", response_model=list[PositionResponse])
async def list_positions(user: dict = Depends(get_current_user)):
    db = get_db()
    positions = await find_positions(db, user["id"])
    return [
        PositionResponse(
            id=p["id"],
            ticker=p["ticker"],
            asset_type=p["asset_type"],
            quantity=p["quantity"],
            avg_price=p["avg_price"],
            currency=p.get("currency", "BRL"),
            broker=p.get("broker", "XP Investimentos"),
        )
        for p in positions
    ]


@router.post("/positions", response_model=PositionResponse)
async def create_pos(pos: PositionCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    existing = await find_position_by_ticker(db, user["id"], pos.ticker)
    if existing:
        raise HTTPException(400, f"Posição para {pos.ticker} já existe. Use PUT para atualizar.")

    doc = await create_position(db, user["id"], pos.model_dump())
    return PositionResponse(
        id=doc["id"],
        ticker=doc["ticker"],
        asset_type=doc["asset_type"],
        quantity=doc["quantity"],
        avg_price=doc["avg_price"],
        currency=doc.get("currency", "BRL"),
        broker=doc.get("broker", "XP Investimentos"),
    )


@router.put("/positions/{position_id}", response_model=PositionResponse)
async def update_pos(position_id: str, update: PositionUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in update.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(400, "Nenhum campo para atualizar")

    doc = await update_position(db, position_id, updates)
    if not doc:
        raise HTTPException(404, "Posição não encontrada")

    return PositionResponse(
        id=doc["id"],
        ticker=doc["ticker"],
        asset_type=doc["asset_type"],
        quantity=doc["quantity"],
        avg_price=doc["avg_price"],
        currency=doc.get("currency", "BRL"),
        broker=doc.get("broker", "XP Investimentos"),
    )


@router.delete("/positions/{position_id}")
async def delete_pos(position_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    deleted = await delete_position(db, position_id)
    if not deleted:
        raise HTTPException(404, "Posição não encontrada")
    return {"message": "Posição removida"}


@router.post("/import")
async def import_xp_extract(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(400, "Arquivo não enviado")

    allowed = (".csv", ".xlsx", ".xls")
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(400, f"Formato não suportado. Use: {', '.join(allowed)}")

    content = await file.read()
    try:
        parsed = parse_xp_extract(content, file.filename)
    except ValueError as e:
        raise HTTPException(400, str(e))

    db = get_db()
    count = await portfolio_service.import_positions(db, user["id"], parsed)
    return {
        "message": f"Importação concluída: {count} novas posições adicionadas",
        "total_records": len(parsed),
        "new_positions": count,
    }


@router.get("/transactions", response_model=list[TransactionResponse])
async def list_txns(ticker: str | None = None, user: dict = Depends(get_current_user)):
    db = get_db()
    txns = await find_transactions(db, user["id"], ticker)
    return [
        TransactionResponse(
            id=t["id"],
            ticker=t["ticker"],
            asset_type=t["asset_type"],
            operation=t["operation"],
            quantity=t["quantity"],
            price=t["price"],
            total=t["total"],
            currency=t.get("currency", "BRL"),
            date=t["date"],
            broker=t.get("broker", "XP Investimentos"),
        )
        for t in txns
    ]
