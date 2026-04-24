from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.portfolio import find_positions, find_position_by_ticker, create_position, update_position, create_transaction
from app.schemas.portfolio import PortfolioSummary, PositionResponse
from app.services.data_providers import brapi, fmp
from app.utils.cache import get_cached, set_cached

# TTL curto (60s) para preços do summary — preserva quota da brapi
# mesmo com o frontend dando refetch a cada 1 min.
SUMMARY_PRICES_TTL_MIN = 1
BR_TYPES = ("br_stock", "fii", "bdr", "br_etf")


async def _get_prices_bulk(positions: list[dict]) -> dict[str, float]:
    """Busca preços com cache 60s. Tenta batch da brapi (1 req para todos os BR),
    e depois faz fallback individual para qualquer ticker que não voltou
    (brapi omite ETFs BR e alguns FIIs do endpoint batch).
    """
    fake_positions = [
        {"ticker": p["ticker"], "asset_type": p.get("asset_type", "br_stock")}
        for p in positions
    ]
    return await get_prices_for_positions(fake_positions)


async def get_prices_for_tickers(tickers: list[str]) -> dict[str, float]:
    """Versão simplificada para o endpoint público: recebe só tickers e infere o tipo."""
    from app.services.analysis_engine import detect_asset_type

    positions = [
        {"ticker": t.upper(), "asset_type": detect_asset_type(t.upper())}
        for t in tickers
    ]
    return await get_prices_for_positions(positions)


async def get_prices_for_positions(positions: list[dict]) -> dict[str, float]:
    prices: dict[str, float] = {}
    br_to_fetch: list[str] = []
    us_to_fetch: list[tuple[str, str]] = []

    for pos in positions:
        ticker = pos["ticker"].upper()
        cached = await get_cached(f"portfolio:price:{ticker}")
        if cached and isinstance(cached.get("price"), (int, float)):
            prices[ticker] = float(cached["price"])
            continue
        if pos["asset_type"] in BR_TYPES:
            br_to_fetch.append(ticker)
        else:
            us_to_fetch.append((ticker, pos["asset_type"]))

    # 1) Batch para BR (1 req cobre até 20 tickers)
    if br_to_fetch:
        try:
            batch = await brapi.get_quotes_batch(br_to_fetch)
            for q in batch or []:
                t = (q.get("ticker") or q.get("symbol") or "").upper()
                p = q.get("price") or q.get("regularMarketPrice")
                if t and isinstance(p, (int, float)):
                    prices[t] = float(p)
                    await set_cached(f"portfolio:price:{t}", {"price": float(p)}, "brapi", SUMMARY_PRICES_TTL_MIN)
        except Exception:
            pass

        # 2) Fallback individual para BR que não veio no batch (ETFs BR, FIIs raros)
        missing_br = [t for t in br_to_fetch if t not in prices]
        for ticker in missing_br:
            try:
                quote = await brapi.get_quote(ticker)
                p = quote.get("price") if quote else None
                if isinstance(p, (int, float)):
                    prices[ticker] = float(p)
                    await set_cached(f"portfolio:price:{ticker}", {"price": float(p)}, "brapi", SUMMARY_PRICES_TTL_MIN)
            except Exception:
                pass

    # 3) US individual
    for ticker, _ in us_to_fetch:
        try:
            quote = await fmp.get_quote(ticker)
            p = quote.get("price") if quote else None
            if isinstance(p, (int, float)):
                prices[ticker] = float(p)
                await set_cached(f"portfolio:price:{ticker}", {"price": float(p)}, "fmp", SUMMARY_PRICES_TTL_MIN)
        except Exception:
            pass

    return prices


async def get_portfolio_summary(db: AsyncIOMotorDatabase, user_id: str) -> PortfolioSummary:
    positions = await find_positions(db, user_id)

    prices = await _get_prices_bulk(positions)

    position_responses = []
    total_invested = 0.0
    total_current = 0.0
    allocation_type: dict[str, float] = {}
    allocation_sector: dict[str, float] = {}

    for pos in positions:
        invested = pos["quantity"] * pos["avg_price"]
        total_invested += invested

        current_price = prices.get(pos["ticker"])
        current_value = pos["quantity"] * current_price if current_price is not None else None
        pl = current_value - invested if current_value is not None else None
        pl_pct = (pl / invested * 100) if pl is not None and invested > 0 else None

        # Usa avg_price (custo) como fallback no totalizador quando o provider
        # não devolveu preço — evita "perda fake" igual ao invested da linha.
        total_current += current_value if current_value is not None else invested

        position_responses.append(PositionResponse(
            id=pos["id"],
            ticker=pos["ticker"],
            asset_type=pos["asset_type"],
            quantity=pos["quantity"],
            avg_price=pos["avg_price"],
            currency=pos.get("currency", "BRL"),
            broker=pos.get("broker", "XP Investimentos"),
            current_price=current_price,
            current_value=round(current_value, 2) if current_value is not None else None,
            profit_loss=round(pl, 2) if pl is not None else None,
            profit_loss_pct=round(pl_pct, 2) if pl_pct is not None else None,
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
        if asset_type in BR_TYPES:
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
