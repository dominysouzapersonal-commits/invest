"""
Full Investment Report Service.
Analyzes 40+ assets across all categories, scores them,
and generates a complete portfolio recommendation for R$ 6,700.
"""
import asyncio
import logging
from datetime import datetime, timezone

from app.schemas.analysis import (
    AssetAnalysis, CategoryRecommendation, FullReport, MacroData,
)
from app.services.analysis_engine import get_full_asset_data_batch
from app.services.scoring import calculate_score
from app.services.data_providers import brapi

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

# 40+ tickers across all categories
TICKERS_CRESCIMENTO = [
    "WEGE3", "PRIO3", "TOTS3", "RENT3", "HAPV3",
    "SBSP3", "RAIL3", "CSAN3", "SUZB3", "RADL3",
    "LWSA3", "PETZ3", "VBBR3", "GGBR4", "CSNA3",
]

TICKERS_DIVIDENDOS = [
    "BBAS3", "ITUB4", "BBDC4", "ITSA4", "BBSE3",
    "CMIG4", "EGIE3", "VIVT3", "EQTL3", "TAEE11",
    "PETR4", "VALE3", "CPLE6", "TRPL4",
]

TICKERS_FIIS = [
    "HGLG11", "XPLG11", "KNRI11", "MXRF11", "XPML11",
    "HGRE11", "VISC11", "BTLG11", "IRDM11", "KNCR11",
]

TICKERS_ETF_INTL = [
    "IVVB11", "NASD11", "HASH11",
]

TICKERS_ETF_US = [
    "SPY", "QQQ", "VTI", "SCHD", "VOO",
    "VT", "VXUS",
]


def _all_tickers() -> list[str]:
    return (
        TICKERS_CRESCIMENTO + TICKERS_DIVIDENDOS + TICKERS_FIIS
        + TICKERS_ETF_INTL + TICKERS_ETF_US
    )


async def generate_full_report() -> FullReport:
    """Generate the complete investment analysis report."""
    all_tickers = _all_tickers()

    # Fetch macro data and assets in parallel
    macro_task = _fetch_macro()
    assets_task = get_full_asset_data_batch(all_tickers)
    macro_data, all_fundamentals = await asyncio.gather(macro_task, assets_task)

    # Score all assets
    all_analyzed: list[AssetAnalysis] = []
    for fund in all_fundamentals:
        score_result = calculate_score(fund)
        analysis = _to_asset_analysis(fund, score_result)
        all_analyzed.append(analysis)

    analyzed_map = {a.ticker: a for a in all_analyzed}

    # Build category recommendations
    categories = [
        _build_category(
            "crescimento", "Crescimento", 35, TICKERS_CRESCIMENTO, analyzed_map,
            "Empresas com alto potencial de valorização, revenue growth e inovação.",
        ),
        _build_category(
            "dividendos", "Dividendos", 20, TICKERS_DIVIDENDOS, analyzed_map,
            "Pagadoras consistentes de dividendos, DY alto, payout saudável.",
        ),
        _build_category(
            "fiis", "FIIs", 20, TICKERS_FIIS, analyzed_map,
            "Fundos imobiliários com renda mensal, P/VP próximo de 1 e DY acima de 8%.",
        ),
        _build_category(
            "etf_intl", "ETF Internacional", 15,
            TICKERS_ETF_INTL + TICKERS_ETF_US, analyzed_map,
            "Diversificação geográfica via ETFs de índices globais.",
        ),
        _build_category(
            "reserva", "Reserva / Renda Fixa", 10, [], analyzed_map,
            "SELIC a taxa atual. Manter em Tesouro Selic ou CDB 100% CDI na XP.",
        ),
    ]

    # Build portfolio summary
    portfolio_picks: list[dict] = []
    total_allocated = 0.0
    for cat in categories:
        if cat.top_pick and cat.top_pick in analyzed_map:
            a = analyzed_map[cat.top_pick]
            qty = 0
            if a.price and a.price > 0:
                qty = int(cat.target_amount / a.price)
            actual = qty * a.price if a.price else 0
            total_allocated += actual
            portfolio_picks.append({
                "ticker": a.ticker,
                "category": cat.category_label,
                "qty": qty,
                "price": a.price,
                "total": round(actual, 2),
                "score": a.score,
            })
        elif cat.category == "reserva":
            total_allocated += cat.target_amount
            portfolio_picks.append({
                "ticker": "Tesouro Selic / CDB 100% CDI",
                "category": cat.category_label,
                "qty": 1,
                "price": cat.target_amount,
                "total": cat.target_amount,
                "score": None,
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
    """Fetch SELIC, IPCA and currency from brapi."""
    selic_task = brapi.get_selic()
    ipca_task = brapi.get_ipca()
    currency_task = brapi.get_currency("USD-BRL,EUR-BRL")

    selic_data, ipca_data, currency_data = await asyncio.gather(
        selic_task, ipca_task, currency_task, return_exceptions=True,
    )

    selic_current = None
    ipca_current = None
    usd_brl = None
    eur_brl = None

    if isinstance(selic_data, list) and selic_data:
        selic_current = selic_data[0].get("value")

    if isinstance(ipca_data, list) and ipca_data:
        ipca_current = ipca_data[0].get("value")

    if isinstance(currency_data, list):
        for c in currency_data:
            name = c.get("fromCurrency", "") + "-" + c.get("toCurrency", "")
            if "USD" in name:
                usd_brl = c.get("bidPrice") or c.get("bid")
            if "EUR" in name:
                eur_brl = c.get("bidPrice") or c.get("bid")

    return MacroData(
        selic_current=selic_current,
        ipca_current=ipca_current,
        usd_brl=usd_brl,
        eur_brl=eur_brl,
    )


def _build_category(
    category: str,
    label: str,
    target_pct: float,
    tickers: list[str],
    analyzed_map: dict[str, AssetAnalysis],
    rationale: str,
) -> CategoryRecommendation:
    target_amount = round(TOTAL_CAPITAL * target_pct / 100, 2)
    assets = [analyzed_map[t] for t in tickers if t in analyzed_map]
    assets.sort(key=lambda a: a.score, reverse=True)

    # Generate why_yes / why_no for each asset
    for a in assets:
        a.why_yes = _generate_why_yes(a)
        a.why_no = _generate_why_no(a)

    top_pick = assets[0].ticker if assets else None

    return CategoryRecommendation(
        category=category,
        category_label=label,
        target_pct=target_pct,
        target_amount=target_amount,
        assets=assets,
        top_pick=top_pick,
        rationale=rationale,
    )


def _to_asset_analysis(fund, score_result) -> AssetAnalysis:
    return AssetAnalysis(
        ticker=fund.ticker,
        name=fund.name,
        asset_type=fund.asset_type,
        sector=fund.sector,
        price=fund.price,
        currency=fund.currency,
        market_cap=fund.market_cap,
        logo_url=fund.logo_url,
        score=score_result.total_score,
        recommendation=score_result.recommendation,
        valuation_score=score_result.valuation_score,
        profitability_score=score_result.profitability_score,
        fcf_quality_score=score_result.fcf_quality_score,
        dividends_score=score_result.dividends_score,
        debt_score=score_result.debt_score,
        growth_score=score_result.growth_score,
        pe_ratio=fund.pe_ratio,
        pb_ratio=fund.pb_ratio,
        ev_ebitda=fund.ev_ebitda,
        roe=fund.roe,
        roic=fund.roic,
        net_margin=fund.net_margin,
        dividend_yield=fund.dividend_yield,
        net_debt_ebitda=fund.net_debt_ebitda,
        current_ratio=fund.current_ratio,
        revenue_growth_1y=fund.revenue_growth_1y,
        profit_growth_1y=fund.profit_growth_1y,
        piotroski_score=fund.piotroski_score,
        altman_z_score=fund.altman_z_score,
        dcf_value=fund.dcf_value,
        dcf_upside_pct=fund.dcf_upside_pct,
        recommendation_key=fund.recommendation_key,
        target_mean_price=fund.target_mean_price,
        rsi_14=fund.rsi_14,
    )


def _generate_why_yes(a: AssetAnalysis) -> str:
    reasons = []
    if a.score >= 70:
        reasons.append(f"Score alto ({a.score:.0f}/100)")
    if a.roe and a.roe > 15:
        reasons.append(f"ROE forte ({a.roe:.1f}%)")
    if a.roic and a.roic > 12:
        reasons.append(f"ROIC excelente ({a.roic:.1f}%)")
    if a.net_margin and a.net_margin > 15:
        reasons.append(f"Margem líquida sólida ({a.net_margin:.1f}%)")
    if a.dividend_yield and a.dividend_yield > 5:
        reasons.append(f"DY atrativo ({a.dividend_yield:.1f}%)")
    if a.revenue_growth_1y and a.revenue_growth_1y > 10:
        reasons.append(f"Receita crescendo {a.revenue_growth_1y:.1f}% a.a.")
    if a.pe_ratio and 0 < a.pe_ratio < 15:
        reasons.append(f"P/L baixo ({a.pe_ratio:.1f})")
    if a.piotroski_score and a.piotroski_score >= 7:
        reasons.append(f"Piotroski forte ({a.piotroski_score}/9)")
    if a.dcf_upside_pct and a.dcf_upside_pct > 15:
        reasons.append(f"Desconto DCF de {a.dcf_upside_pct:.0f}%")
    if a.current_ratio and a.current_ratio > 1.5:
        reasons.append("Boa liquidez")
    if a.recommendation_key and a.recommendation_key.lower() in ("buy", "strong_buy", "strongbuy"):
        reasons.append(f"Analistas recomendam {a.recommendation_key}")
    if not reasons:
        reasons.append("Fundamentos aceitáveis dentro da categoria")
    return "; ".join(reasons[:5])


def _generate_why_no(a: AssetAnalysis) -> str:
    risks = []
    if a.score < 40:
        risks.append(f"Score baixo ({a.score:.0f}/100)")
    if a.pe_ratio and a.pe_ratio > 30:
        risks.append(f"P/L elevado ({a.pe_ratio:.1f})")
    if a.net_debt_ebitda and a.net_debt_ebitda > 3:
        risks.append(f"Endividamento alto (Dív/EBITDA {a.net_debt_ebitda:.1f})")
    if a.roe and a.roe < 5:
        risks.append(f"ROE fraco ({a.roe:.1f}%)")
    if a.net_margin and a.net_margin < 3:
        risks.append(f"Margem líquida apertada ({a.net_margin:.1f}%)")
    if a.revenue_growth_1y and a.revenue_growth_1y < -5:
        risks.append(f"Receita caindo {a.revenue_growth_1y:.1f}%")
    if a.profit_growth_1y and a.profit_growth_1y < -15:
        risks.append(f"Lucro caindo {a.profit_growth_1y:.1f}%")
    if a.piotroski_score is not None and a.piotroski_score <= 3:
        risks.append(f"Piotroski fraco ({a.piotroski_score}/9)")
    if a.altman_z_score is not None and a.altman_z_score < 1.81:
        risks.append(f"Z-Score em zona de stress ({a.altman_z_score:.2f})")
    if a.rsi_14 and a.rsi_14 > 70:
        risks.append(f"RSI sobrecomprado ({a.rsi_14:.0f})")
    if not risks:
        risks.append("Sem alertas significativos")
    return "; ".join(risks[:5])


METHODOLOGY_TEXT = """
## Metodologia de Análise

### Fontes de Dados
- **brapi.dev (Premium)**: Cotações em tempo real, fundamentalistas completos desde 2009, 
  dividendos históricos, DRE, balanço, fluxo de caixa, SELIC, IPCA, câmbio.
- **FMP (Pago)**: DCF Valuation, Piotroski F-Score, Altman Z-Score, consenso de analistas, 
  price targets, grades (upgrade/downgrade), indicadores técnicos (RSI, SMA), insider trades.

### Scoring (0-100)
Cada ativo recebe uma nota composta de 5 dimensões:
1. **Valuation (25%)** — P/L, P/VP, EV/EBITDA, PSR
2. **Rentabilidade (25%)** — ROE, ROA, ROIC, margens
3. **Dividendos (20%)** — Dividend Yield, Payout Ratio
4. **Endividamento (20%)** — Dív.Líq./EBITDA, Liquidez Corrente, Cobertura de Juros
5. **Crescimento (10%)** — Crescimento de receita e lucro (1a, 3a, 5a)

Bônus/penalidade: Piotroski F-Score (±4pts) e Altman Z-Score (±4pts).

### Classificação
- **80-100**: Excelente oportunidade
- **60-79**: Bom investimento
- **40-59**: Neutro
- **20-39**: Cautela
- **0-19**: Evitar

### Alocação Sugerida (R$ 6.700)
- 35% Crescimento (R$ 2.345)
- 20% Dividendos (R$ 1.340)
- 20% FIIs (R$ 1.340)
- 15% ETF Internacional (R$ 1.005)
- 10% Reserva / Renda Fixa (R$ 670)
""".strip()
