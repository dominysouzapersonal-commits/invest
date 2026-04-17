from app.schemas.asset import FundamentalData, ScoreResult
from app.schemas.analysis import ScoringWeights

RECOMMENDATIONS = {
    (85, 101): "Excelente oportunidade",
    (70, 85): "Bom investimento",
    (50, 70): "Razoável",
    (35, 50): "Cautela",
    (20, 35): "Arriscado",
    (0, 20): "Evitar",
}

# ---------------------------------------------------------------------------
# Benchmark scoring functions — each returns 0-100 for a single metric.
# Inspired by Graham, Buffett, Barsi & Piotroski for Brazilian equities.
# ---------------------------------------------------------------------------

def _score_pe(val: float | None, data: "FundamentalData | None" = None) -> float | None:
    """Score P/L. Negative P/L = loss, but turnarounds with strong balance
    sheet get partial credit instead of flat 5 (Grok improvement #1)."""
    if val is None:
        return None
    if val <= 0:
        if data is not None:
            has_low_debt = (data.net_debt_ebitda is not None and data.net_debt_ebitda < 2)
            has_good_roic = (data.roic is not None and data.roic > 8)
            if has_low_debt or has_good_roic:
                return 20
        return 5
    if val < 10:
        return 100
    if val < 15:
        return 85
    if val < 20:
        return 65
    if val < 30:
        return 40
    return 15


def _score_pb(val: float | None, asset_type: str = "stock") -> float | None:
    if val is None:
        return None
    if val <= 0:
        return 5
    if asset_type == "fii":
        if 0.85 <= val <= 1.05:
            return 100
        if 0.7 <= val <= 1.15:
            return 85
        if val < 1.3:
            return 60
        return 25
    if val < 1.5:
        return 100
    if val < 3:
        return 70
    if val < 5:
        return 40
    return 15


def _score_ev_ebitda(val: float | None) -> float | None:
    if val is None:
        return None
    if val <= 0:
        return 10
    if val < 6:
        return 100
    if val < 10:
        return 80
    if val < 14:
        return 55
    return 25


def _score_psr(val: float | None) -> float | None:
    if val is None:
        return None
    if val <= 0:
        return 10
    if val < 1.5:
        return 100
    if val < 3:
        return 70
    if val < 5:
        return 40
    return 15


def _score_roe(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 25:
        return 100
    if val > 15:
        return 80
    if val > 10:
        return 60
    if val > 5:
        return 35
    return 10


def _score_roic(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 20:
        return 100
    if val > 12:
        return 80
    if val > 8:
        return 55
    if val > 4:
        return 35
    return 10


def _score_net_margin(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 25:
        return 100
    if val > 15:
        return 80
    if val > 8:
        return 55
    if val > 3:
        return 30
    return 10


def _score_gross_margin(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 50:
        return 100
    if val > 35:
        return 80
    if val > 20:
        return 55
    return 25


def _score_operating_margin(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 25:
        return 100
    if val > 15:
        return 80
    if val > 8:
        return 55
    return 25


def _score_fcf_yield(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 10:
        return 100
    if val > 5:
        return 75
    if val > 2:
        return 50
    if val > 0:
        return 30
    return 10


def _score_earnings_yield(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 12:
        return 100
    if val > 8:
        return 80
    if val > 5:
        return 55
    return 30


def _score_dy(val: float | None, asset_type: str = "stock") -> float | None:
    if val is None:
        return None
    if asset_type == "fii":
        if val > 10:
            return 100
        if val > 8:
            return 90
        if val > 6:
            return 70
        if val > 4:
            return 45
        return 15
    if val > 8:
        return 100
    if val > 6:
        return 85
    if val > 4:
        return 65
    if val > 2:
        return 40
    return 20


def _score_payout(val: float | None) -> float | None:
    if val is None:
        return None
    if 30 <= val <= 60:
        return 100
    if 20 <= val <= 80:
        return 65
    if val > 100:
        return 10
    return 35


def _score_net_debt_ebitda(val: float | None) -> float | None:
    if val is None:
        return None
    if val < 0:
        return 100  # net cash
    if val < 1:
        return 100
    if val < 2:
        return 80
    if val < 3:
        return 55
    if val < 4:
        return 30
    return 10


def _score_net_debt_equity(val: float | None) -> float | None:
    if val is None:
        return None
    if val < 0:
        return 100  # net cash
    if val < 0.5:
        return 100
    if val < 1:
        return 80
    if val < 2:
        return 55
    return 25


def _score_current_ratio(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 2:
        return 100
    if val > 1.5:
        return 80
    if val > 1:
        return 55
    if val > 0.7:
        return 30
    return 10


def _score_cagr_revenue_5y(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 20:
        return 100
    if val > 10:
        return 80
    if val > 5:
        return 55
    if val > 0:
        return 35
    return 10


def _score_cagr_earnings_5y(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 25:
        return 100
    if val > 15:
        return 80
    if val > 5:
        return 55
    if val > 0:
        return 35
    return 10


def _score_revenue_growth_1y(val: float | None) -> float | None:
    if val is None:
        return None
    if val > 20:
        return 100
    if val > 10:
        return 80
    if val > 5:
        return 55
    if val > 0:
        return 35
    return 10


# ---------------------------------------------------------------------------
# Pillar aggregators — collect individual metric scores into category scores.
# ---------------------------------------------------------------------------

def _collect(entries: list[tuple[str, float | None]]) -> tuple[float, dict]:
    """Return (avg_score, details_dict) from a list of (label, score|None).
    Skips None entries. Falls back to 50 if everything is None."""
    scores: list[float] = []
    details: dict = {}
    for label, value, score in entries:
        if score is not None and value is not None:
            scores.append(score)
            details[label] = {"value": round(value, 2), "score": round(score, 1)}
    avg = sum(scores) / len(scores) if scores else 50.0
    return round(avg, 1), details


def _score_valuation(data: FundamentalData) -> dict:
    asset_type = data.asset_type or "stock"
    entries = [
        ("P/L", data.pe_ratio, _score_pe(data.pe_ratio, data)),
        ("P/VP", data.pb_ratio, _score_pb(data.pb_ratio, asset_type)),
        ("EV/EBITDA", data.ev_ebitda, _score_ev_ebitda(data.ev_ebitda)),
        ("PSR", data.psr, _score_psr(data.psr)),
    ]
    score, details = _collect(entries)
    return {"score": score, "details": details}


def _score_profitability(data: FundamentalData) -> dict:
    entries = [
        ("ROE", data.roe, _score_roe(data.roe)),
        ("ROIC", data.roic, _score_roic(data.roic)),
        ("Margem Líquida", data.net_margin, _score_net_margin(data.net_margin)),
        ("Margem Bruta", data.gross_margin, _score_gross_margin(data.gross_margin)),
        ("Margem Operacional", data.operating_margin, _score_operating_margin(data.operating_margin)),
    ]
    score, details = _collect(entries)
    return {"score": score, "details": details}


def _score_fcf_quality(data: FundamentalData) -> dict:
    # Calculate Earnings Yield from P/L when not provided (Grok improvement #2)
    ey = data.earnings_yield
    if ey is None and data.pe_ratio is not None and data.pe_ratio > 0:
        ey = round(100 / data.pe_ratio, 2)

    entries = [
        ("FCF Yield", data.fcf_yield, _score_fcf_yield(data.fcf_yield)),
        ("Earnings Yield", ey, _score_earnings_yield(ey)),
    ]
    score, details = _collect(entries)
    return {"score": score, "details": details}


def _score_dividends(data: FundamentalData) -> dict:
    asset_type = data.asset_type or "stock"

    dy_val = data.dividend_yield
    if dy_val is not None and 0 < dy_val < 1:
        dy_val = dy_val * 100

    entries = [
        ("Dividend Yield", dy_val, _score_dy(dy_val, asset_type)),
        ("Payout Ratio", data.payout_ratio, _score_payout(data.payout_ratio)),
    ]
    score, details = _collect(entries)

    if data.dividend_consistency is not None:
        consistency_score = min(100.0, data.dividend_consistency * 10.0)
        details["Consistência Dividendos"] = {
            "value": data.dividend_consistency,
            "score": round(consistency_score, 1),
        }
        total_scores = [s for _, _, s in entries if s is not None]
        total_scores.append(consistency_score)
        score = round(sum(total_scores) / len(total_scores), 1) if total_scores else 50.0

    return {"score": score, "details": details}


def _score_debt(data: FundamentalData) -> dict:
    entries = [
        ("Dív.Líq./EBITDA", data.net_debt_ebitda, _score_net_debt_ebitda(data.net_debt_ebitda)),
        ("Dív.Líq./PL", data.net_debt_equity, _score_net_debt_equity(data.net_debt_equity)),
        ("Liquidez Corrente", data.current_ratio, _score_current_ratio(data.current_ratio)),
    ]
    score, details = _collect(entries)
    return {"score": score, "details": details}


def _score_growth(data: FundamentalData) -> dict:
    entries = [
        ("CAGR Receita 5a", data.revenue_growth_5y, _score_cagr_revenue_5y(data.revenue_growth_5y)),
        ("CAGR Lucro 5a", data.profit_growth_5y, _score_cagr_earnings_5y(data.profit_growth_5y)),
        ("Cresc. Receita 1a", data.revenue_growth_1y, _score_revenue_growth_1y(data.revenue_growth_1y)),
    ]
    score, details = _collect(entries)
    return {"score": score, "details": details}


# ---------------------------------------------------------------------------
# Bonus / penalty — Piotroski F-Score and Altman Z-Score
# ---------------------------------------------------------------------------

def _advanced_score_adjustment(data: FundamentalData) -> float:
    """Piotroski/Altman as tie-breaker, not major factor (Grok improvement #5)."""
    adj = 0.0
    if data.piotroski_score is not None:
        if data.piotroski_score >= 7:
            adj += 2
        elif data.piotroski_score <= 3:
            adj -= 2
    if data.altman_z_score is not None:
        if data.altman_z_score > 2.99:
            adj += 2
        elif data.altman_z_score < 1.81:
            adj -= 3
    return adj


def _piotroski_to_label(val: int) -> float:
    if val >= 7:
        return 100
    if val >= 5:
        return 60
    if val >= 4:
        return 40
    return 15


def _zscore_to_label(val: float) -> float:
    if val > 2.99:
        return 100
    if val > 1.81:
        return 50
    return 10


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def calculate_score(data: FundamentalData, weights: ScoringWeights | None = None) -> ScoreResult:
    if weights is None:
        weights = ScoringWeights()

    valuation = _score_valuation(data)
    profitability = _score_profitability(data)
    fcf_quality = _score_fcf_quality(data)
    dividends = _score_dividends(data)
    debt = _score_debt(data)
    growth = _score_growth(data)

    w_total = (
        weights.weight_valuation
        + weights.weight_profitability
        + weights.weight_fcf_quality
        + weights.weight_dividends
        + weights.weight_debt
        + weights.weight_growth
    )
    # Normalise in case weights don't sum to 100
    if w_total == 0:
        w_total = 100

    base_total = (
        valuation["score"] * weights.weight_valuation
        + profitability["score"] * weights.weight_profitability
        + fcf_quality["score"] * weights.weight_fcf_quality
        + dividends["score"] * weights.weight_dividends
        + debt["score"] * weights.weight_debt
        + growth["score"] * weights.weight_growth
    ) / w_total

    bonus = _advanced_score_adjustment(data)

    # Liquidity penalty for illiquid stocks (avg_volume < 50k/day)
    if data.avg_volume is not None and data.avg_volume < 50000:
        bonus -= 3
    elif data.volume is not None and data.volume < 50000:
        bonus -= 3

    total = round(min(100, max(0, base_total + bonus)), 1)

    all_details: dict = {
        "valuation": valuation["details"],
        "profitability": profitability["details"],
        "fcf_quality": fcf_quality["details"],
        "dividends": dividends["details"],
        "debt": debt["details"],
        "growth": growth["details"],
        "weights_used": {
            "valuation": weights.weight_valuation,
            "profitability": weights.weight_profitability,
            "fcf_quality": weights.weight_fcf_quality,
            "dividends": weights.weight_dividends,
            "debt": weights.weight_debt,
            "growth": weights.weight_growth,
        },
        "pillar_scores": {
            "valuation": valuation["score"],
            "profitability": profitability["score"],
            "fcf_quality": fcf_quality["score"],
            "dividends": dividends["score"],
            "debt": debt["score"],
            "growth": growth["score"],
        },
    }

    advanced: dict = {}
    if data.piotroski_score is not None:
        advanced["Piotroski F-Score"] = {
            "value": data.piotroski_score,
            "score": _piotroski_to_label(data.piotroski_score),
        }
    if data.altman_z_score is not None:
        advanced["Altman Z-Score"] = {
            "value": round(data.altman_z_score, 2),
            "score": _zscore_to_label(data.altman_z_score),
        }
    if advanced:
        advanced["bonus_applied"] = bonus
        all_details["advanced"] = advanced

    return ScoreResult(
        total_score=total,
        recommendation=_get_recommendation(total),
        valuation_score=round(valuation["score"], 1),
        profitability_score=round(profitability["score"], 1),
        fcf_quality_score=round(fcf_quality["score"], 1),
        dividends_score=round(dividends["score"], 1),
        debt_score=round(debt["score"], 1),
        growth_score=round(growth["score"], 1),
        details=all_details,
    )


def _get_recommendation(score: float) -> str:
    for (low, high), label in RECOMMENDATIONS.items():
        if low <= score < high:
            return label
    return "Neutro"
