from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.portfolio import find_positions, find_position_by_ticker, create_position, update_position, create_transaction
from app.schemas.portfolio import PortfolioSummary, PositionResponse
from app.services.data_providers import brapi, fmp


async def get_portfolio_summary(db: AsyncIOMotorDatabase, user_id: str) -> PortfolioSummary:
    positions = await find_positions(db, user_id)

    position_responses = []
    total_invested = 0.0
    total_current = 0.0
    allocation_type: dict[str, float] = {}
    allocation_sector: dict[str, float] = {}

    for pos in positions:
        invested = pos["quantity"] * pos["avg_price"]
        total_invested += invested

        current_price = await _get_current_price(pos["ticker"], pos["asset_type"])
        current_value = pos["quantity"] * current_price if current_price else None
        pl = current_value - invested if current_value else None
        pl_pct = (pl / invested * 100) if pl and invested > 0 else None

        if current_value:
            total_current += current_value

        position_responses.append(PositionResponse(
            id=pos["id"],
            ticker=pos["ticker"],
            asset_type=pos["asset_type"],
            quantity=pos["quantity"],
            avg_price=pos["avg_price"],
            currency=pos.get("currency", "BRL"),
            broker=pos.get("broker", "XP Investimentos"),
            current_price=current_price,
            current_value=round(current_value, 2) if current_value else None,
            profit_loss=round(pl, 2) if pl else None,
            profit_loss_pct=round(pl_pct, 2) if pl_pct else None,
        ))

        at = pos["asset_type"]
        allocation_type[at] = allocation_type.get(at, 0) + (current_value or invested)

        sector = pos.get("sector") or "Outros"
        allocation_sector[sector] = allocation_sector.get(sector, 0) + (current_value or invested)

    total_pl = total_current - total_invested
    total_pl_pct = (total_pl / total_invested * 100) if total_invested > 0 else 0

    total_alloc = sum(allocation_type.values()) or 1
    allocation_type = {k: round(v / total_alloc * 100, 1) for k, v in allocation_type.items()}
    allocation_sector = {k: round(v / total_alloc * 100, 1) for k, v in allocation_sector.items()}

    return PortfolioSummary(
        total_invested=round(total_invested, 2),
        total_current=round(total_current, 2),
        total_profit_loss=round(total_pl, 2),
        total_profit_loss_pct=round(total_pl_pct, 2),
        positions=position_responses,
        allocation_by_type=allocation_type,
        allocation_by_sector=allocation_sector,
    )


async def _get_current_price(ticker: str, asset_type: str) -> float | None:
    try:
        if asset_type in ("br_stock", "fii", "bdr"):
            quote = await brapi.get_quote(ticker)
            return quote.get("price") if quote else None
        else:
            quote = await fmp.get_quote(ticker)
            return quote.get("price") if quote else None
    except Exception:
        return None


async def import_positions(db: AsyncIOMotorDatabase, user_id: str, parsed_data: list[dict]) -> int:
    count = 0
    for item in parsed_data:
        ticker = item["ticker"]
        existing = await find_position_by_ticker(db, user_id, ticker)

        if existing:
            if item.get("operation") == "sell":
                new_qty = max(0, existing["quantity"] - item["quantity"])
                await update_position(db, existing["id"], {"quantity": new_qty})
            else:
                total_qty = existing["quantity"] + item["quantity"]
                total_cost = (existing["quantity"] * existing["avg_price"]) + (item["quantity"] * item["avg_price"])
                new_avg = total_cost / total_qty if total_qty > 0 else 0
                await update_position(db, existing["id"], {"quantity": total_qty, "avg_price": new_avg})
        else:
            if item.get("operation", "buy") != "sell":
                await create_position(db, user_id, {
                    "ticker": ticker,
                    "asset_type": item["asset_type"],
                    "quantity": item["quantity"],
                    "avg_price": item["avg_price"],
                    "currency": item.get("currency", "BRL"),
                    "broker": item.get("broker", "XP Investimentos"),
                })
                count += 1

        if item.get("date"):
            from datetime import datetime
            date_val = datetime.fromisoformat(item["date"]) if isinstance(item["date"], str) else item["date"]
            await create_transaction(db, user_id, {
                "ticker": ticker,
                "asset_type": item["asset_type"],
                "operation": item.get("operation", "buy"),
                "quantity": item["quantity"],
                "price": item["avg_price"],
                "total": item.get("total", item["quantity"] * item["avg_price"]),
                "currency": item.get("currency", "BRL"),
                "date": date_val,
                "broker": item.get("broker", "XP Investimentos"),
            })

    return count
