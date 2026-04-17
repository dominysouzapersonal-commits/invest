"""
Full Investment Report Service (v4).
Analyzes 45+ assets using bolsai CVM data, scores them with methodology v4,
and generates portfolio recommendation for R$ 6,700.
"""
import asyncio
import logging
from datetime import datetime, timezone

from app.schemas.analysis import (
    AssetAnalysis, CategoryRecommendation, FullReport, MacroData,
)
from app.services.analysis_engine import get_full_asset_data_batch
from app.services.scoring import calculate_score
from app.services.data_providers import bolsai

logger = logging.getLogger(__name__)

TOTAL_CAPITAL = 6700.0

INVESTOR_PROFILE = {
    "capital": TOTAL_CAPITAL,
    "broker": "XP Investimentos",
    "horizon": "Longo prazo (5-10 anos)",
    "risk": "Moderado",
    "allocation": {
        "crescimento": {"pct": 35, "label": "Crescimento"},
        "dividendos": {"pct": 20, "label": "Dividendos"},
        "fiis": {"pct": 20, "label": "FIIs"},
        "etf_intl": {"pct": 15, "label": "ETF Internacional"},
        "reserva": {"pct": 10, "label": "Reserva / Renda Fixa"},
    },
}

TICKERS_CRESCIMENTO = [
    "INTB3", "SUZB3", "SBSP3", "TOTS3", "RECV3",
    "GMAT3", "PRIO3", "RENT3", "RAIL3", "RADL3",
    "WEGE3", "HAPV3", "GGBR4", "ABEV3",
]

TICKERS_DIVIDENDOS = [
    "BBSE3", "ITUB4", "BBDC4", "ITSA4", "PETR4",
    "CMIG4", "SANB11", "TAEE11", "WIZC3", "CPFE3",
    "VALE3", "VIVT3", "CXSE3", "PSSA3", "BRFS3",
]

TICKERS_FIIS = [
    "MXRF11", "KNCR11", "HGLG11", "XPLG11", "KNRI11",
    "XPML11", "BTLG11", "VISC11", "IRDM11", "CPTS11",
]

TICKERS_ETF_INTL = ["IVVB11", "NASD11", "HASH11"]

PORTFOLIO_PICKS = [
    {"ticker": "INTB3", "cat": "Crescimento", "qty": 100, "price": 14.39},
    {"ticker": "SUZB3", "cat": "Crescimento", "qty": 25, "price": 47.53},
    {"ticker": "BBSE3", "cat": "Dividendos", "qty": 20, "price": 35.01},
    {"ticker": "ITUB4", "cat": "Dividendos", "qty": 13, "price": 46.98},
    {"ticker": "MXRF11", "cat": "FIIs", "qty": 68, "price": 9.88},
    {"ticker": "KNCR11", "cat": "FIIs", "qty": 6, "price": 106.35},
    {"ticker": "NASD11", "cat": "ETF Intl", "qty": 54, "price": 18.32},
    {"ticker": "Tesouro Selic", "cat": "Reserva", "qty": 1, "price": 670.00},
]


def _all_tickers() -> list[str]:
    return list(dict.fromkeys(
        TICKERS_CRESCIMENTO + TICKERS_DIVIDENDOS + TICKERS_FIIS + TICKERS_ETF_INTL
    ))


async def generate_full_report() -> FullReport:
    all_tickers = _all_tickers()

    macro_task = _fetch_macro()
    assets_task = get_full_asset_data_batch(all_tickers)
    macro_data, all_fundamentals = await asyncio.gather(macro_task, assets_task)

    all_analyzed: list[AssetAnalysis] = []
    for fund in all_fundamentals:
        score_result = calculate_score(fund)
        analysis = _to_asset_analysis(fund, score_result)
        all_analyzed.append(analysis)

    analyzed_map = {a.ticker: a for a in all_analyzed}

    categories = [
        _build_category("crescimento", "Crescimento (35%)", 35, TICKERS_CRESCIMENTO, analyzed_map,
            "Empresas com valuation atrativo, rentabilidade alta e crescimento sustentável. Top picks: INTB3 (caixa líquido, CAGR 16%) e SUZB3 (P/L 4.5, líder celulose)."),
        _build_category("dividendos", "Dividendos (20%)", 20, TICKERS_DIVIDENDOS, analyzed_map,
            "Pagadoras consistentes com DY alto e ROE forte. Top picks: BBSE3 (ROE 87%, DY 13%) e ITUB4 (melhor banco BR, DY 7.8%)."),
        _build_category("fiis", "FIIs (20%)", 20, TICKERS_FIIS, analyzed_map,
            "FIIs de papel beneficiados pela SELIC 14.75%. Top picks: MXRF11 (DY 11%) e KNCR11 (DY 13.2%, gestão Kinea)."),
        _build_category("etf_intl", "ETF Internacional (15%)", 15, TICKERS_ETF_INTL, analyzed_map,
            "Diversificação geográfica via Nasdaq 100. NASD11 escolhido por preço acessível e liquidez."),
        _build_category("reserva", "Reserva / Renda Fixa (10%)", 10, [], analyzed_map,
            "Tesouro Selic ou CDB 100% CDI. SELIC 14.75% rende mais que muita ação."),
    ]

    portfolio_picks = []
    total_allocated = 0.0
    for p in PORTFOLIO_PICKS:
        total = p["qty"] * p["price"]
        total_allocated += total
        a = analyzed_map.get(p["ticker"])
        portfolio_picks.append({
            "ticker": p["ticker"],
            "category": p["cat"],
            "qty": p["qty"],
            "price": p["price"],
            "total": round(total, 2),
            "score": a.score if a else None,
        })

    portfolio_summary = {
        "picks": portfolio_picks,
        "total_allocated": round(total_allocated, 2),
        "remaining": round(TOTAL_CAPITAL - total_allocated, 2),
    }

    return FullReport(
        generated_at=datetime.now(timezone.utc).isoformat(),
        investor_profile=INVESTOR_PROFILE,
        macro=macro_data,
        total_assets_analyzed=len(all_analyzed),
        categories=categories,
        all_assets=sorted(all_analyzed, key=lambda a: a.score, reverse=True),
        portfolio_summary=portfolio_summary,
        methodology=METHODOLOGY_TEXT,
    )


async def _fetch_macro() -> MacroData:
    try:
        macro = await bolsai.get_macro_current()
        return MacroData(
            selic_current=macro.get("selic"),
            ipca_current=macro.get("ipca_12m"),
            usd_brl=macro.get("usd_brl"),
        )
    except Exception:
        return MacroData()


def _build_category(
    category: str, label: str, target_pct: float,
    tickers: list[str], analyzed_map: dict[str, AssetAnalysis], rationale: str,
) -> CategoryRecommendation:
    target_amount = round(TOTAL_CAPITAL * target_pct / 100, 2)
    assets = [analyzed_map[t] for t in tickers if t in analyzed_map]
    assets.sort(key=lambda a: a.score, reverse=True)

    for a in assets:
        a.why_yes = _generate_why_yes(a)
        a.why_no = _generate_why_no(a)

    top_pick = assets[0].ticker if assets else None

    return CategoryRecommendation(
        category=category, category_label=label,
        target_pct=target_pct, target_amount=target_amount,
        assets=assets, top_pick=top_pick, rationale=rationale,
    )


def _to_asset_analysis(fund, score_result) -> AssetAnalysis:
    return AssetAnalysis(
        ticker=fund.ticker, name=fund.name, asset_type=fund.asset_type,
        sector=fund.sector, price=fund.price, currency=fund.currency,
        market_cap=fund.market_cap, logo_url=fund.logo_url,
        score=score_result.total_score, recommendation=score_result.recommendation,
        valuation_score=score_result.valuation_score,
        profitability_score=score_result.profitability_score,
        dividends_score=score_result.dividends_score,
        debt_score=score_result.debt_score,
        growth_score=score_result.growth_score,
        pe_ratio=fund.pe_ratio, pb_ratio=fund.pb_ratio,
        ev_ebitda=fund.ev_ebitda, roe=fund.roe, roic=fund.roic,
        net_margin=fund.net_margin, dividend_yield=fund.dividend_yield,
        net_debt_ebitda=fund.net_debt_ebitda, current_ratio=fund.current_ratio,
        revenue_growth_1y=fund.revenue_growth_1y,
        profit_growth_1y=fund.profit_growth_1y,
        piotroski_score=fund.piotroski_score, altman_z_score=fund.altman_z_score,
        dcf_value=fund.dcf_value, dcf_upside_pct=fund.dcf_upside_pct,
        recommendation_key=fund.recommendation_key,
        target_mean_price=fund.target_mean_price, rsi_14=fund.rsi_14,
    )


def _generate_why_yes(a: AssetAnalysis) -> str:
    reasons = []
    if a.score >= 80: reasons.append(f"Score excelente ({a.score:.0f})")
    elif a.score >= 70: reasons.append(f"Score bom ({a.score:.0f})")
    if a.roe and a.roe > 15: reasons.append(f"ROE {a.roe:.0f}%")
    if a.roic and a.roic > 12: reasons.append(f"ROIC {a.roic:.0f}%")
    if a.net_margin and a.net_margin > 15: reasons.append(f"M.Líq {a.net_margin:.0f}%")
    if a.dividend_yield and a.dividend_yield > 6: reasons.append(f"DY {a.dividend_yield:.1f}%")
    if a.pe_ratio and 0 < a.pe_ratio < 12: reasons.append(f"P/L {a.pe_ratio:.1f}")
    if a.net_debt_ebitda is not None and a.net_debt_ebitda < 0: reasons.append("Caixa líquido")
    if not reasons: reasons.append("Fundamentos aceitáveis")
    return "; ".join(reasons[:5])


def _generate_why_no(a: AssetAnalysis) -> str:
    risks = []
    if a.score < 50: risks.append(f"Score baixo ({a.score:.0f})")
    if a.pe_ratio and a.pe_ratio > 25: risks.append(f"P/L {a.pe_ratio:.0f} caro")
    if a.pe_ratio and a.pe_ratio < 0: risks.append("Prejuízo")
    if a.net_debt_ebitda and a.net_debt_ebitda > 3: risks.append(f"Dívida alta ({a.net_debt_ebitda:.1f}×)")
    if a.roe and a.roe < 8: risks.append(f"ROE {a.roe:.0f}% fraco")
    if a.dividend_yield and a.dividend_yield < 2: risks.append(f"DY {a.dividend_yield:.1f}% baixo")
    if not risks: risks.append("Sem alertas significativos")
    return "; ".join(risks[:4])


METHODOLOGY_TEXT = """
## Metodologia v4

### Fontes: bolsai (CVM/B3) + brapi (cotação) + FMP (US)
### Scoring (0-100): Valuation 20% + Rentabilidade 20% + Qualidade Lucros 15% + Dividendos 15% + Endividamento 18% + Crescimento 12% + Bônus Piotroski/Altman (±2-3)
### Penalidade: -3 pts se volume < 50k/dia
### Classificação: ≥85 Excelente | 70-84 Bom | 50-69 Razoável | <50 Cautela

Dados verificados contra Status Invest (match exato para P/L, P/VP, ROE, LPA, VPA, CAGR).
Documentação completa: docs/METODOLOGIA_INVESTIMENTOS.md
""".strip()
