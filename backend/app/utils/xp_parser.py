import pandas as pd
import io
from datetime import datetime
from app.services.analysis_engine import detect_asset_type


def parse_xp_extract(file_content: bytes, filename: str) -> list[dict]:
    """Parse XP Investimentos extract files (CSV or Excel)."""
    if filename.endswith((".xlsx", ".xls")):
        return _parse_excel(file_content)
    return _parse_csv(file_content)


def _parse_csv(content: bytes) -> list[dict]:
    """Parse XP CSV extract with common column name variations."""
    try:
        df = pd.read_csv(io.BytesIO(content), sep=None, engine="python", encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(io.BytesIO(content), sep=None, engine="python", encoding="latin-1")

    return _normalize_dataframe(df)


def _parse_excel(content: bytes) -> list[dict]:
    df = pd.read_excel(io.BytesIO(content))
    return _normalize_dataframe(df)


def _normalize_dataframe(df: pd.DataFrame) -> list[dict]:
    col_map = _detect_columns(df)
    if not col_map.get("ticker"):
        raise ValueError(
            "Não foi possível identificar a coluna de ticker no arquivo. "
            "Colunas encontradas: " + ", ".join(df.columns.tolist())
        )

    results = []
    for _, row in df.iterrows():
        ticker_raw = str(row[col_map["ticker"]]).strip().upper()
        if not ticker_raw or ticker_raw == "NAN":
            continue

        ticker = ticker_raw.replace(".SA", "")
        quantity = _safe_float(row.get(col_map.get("quantity", ""), 0))
        price = _safe_float(row.get(col_map.get("price", ""), 0))

        if quantity == 0:
            continue

        asset_type = detect_asset_type(ticker)

        entry = {
            "ticker": ticker,
            "asset_type": asset_type,
            "quantity": quantity,
            "avg_price": price,
            "currency": "BRL",
            "broker": "XP Investimentos",
        }

        if col_map.get("operation"):
            op = str(row.get(col_map["operation"], "")).strip().upper()
            entry["operation"] = "buy" if "C" in op or "COMPRA" in op else "sell"

        if col_map.get("date"):
            entry["date"] = _parse_date(row.get(col_map["date"]))

        if col_map.get("total"):
            entry["total"] = _safe_float(row.get(col_map["total"], 0))
        else:
            entry["total"] = abs(quantity * price)

        results.append(entry)

    return results


def _detect_columns(df: pd.DataFrame) -> dict:
    col_map = {}
    normalized = {c: c.strip().lower() for c in df.columns}

    ticker_names = ["ativo", "ticker", "código", "codigo", "papel", "symbol", "cod. negociação", "cod negociação"]
    qty_names = ["quantidade", "qtd", "qtde", "qty", "quantity"]
    price_names = ["preço", "preco", "preço médio", "preco medio", "pm", "price", "valor unitário"]
    op_names = ["operação", "operacao", "tipo", "c/v", "operation", "type"]
    date_names = ["data", "date", "data do negócio", "data negócio", "data pregão"]
    total_names = ["total", "valor total", "valor operação", "valor"]

    for orig, norm in normalized.items():
        for tn in ticker_names:
            if tn in norm:
                col_map["ticker"] = orig
                break
        for qn in qty_names:
            if qn in norm:
                col_map["quantity"] = orig
                break
        for pn in price_names:
            if pn in norm:
                col_map["price"] = orig
                break
        for on in op_names:
            if on in norm:
                col_map["operation"] = orig
                break
        for dn in date_names:
            if dn in norm:
                col_map["date"] = orig
                break
        for tn in total_names:
            if tn in norm and "ticker" not in col_map.get(orig, ""):
                col_map["total"] = orig
                break

    return col_map


def _safe_float(val) -> float:
    if val is None:
        return 0.0
    try:
        if isinstance(val, str):
            val = val.replace(".", "").replace(",", ".").strip()
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _parse_date(val) -> str | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.isoformat()
    s = str(val).strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(s, fmt).isoformat()
        except ValueError:
            continue
    return s
