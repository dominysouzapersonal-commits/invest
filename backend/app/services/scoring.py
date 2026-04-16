from app.schemas.asset import FundamentalData, ScoreResult
from app.schemas.analysis import ScoringWeights

RECOMMENDATIONS = {
    (80, 101): "Excelente oportunidade",
    (60, 80): "Bom investimento",
    (40, 60): "Neutro",
    (20, 40): "Cautela",
    (0, 20): "Evitar",
}

BENCHMARKS_BR = {
    "pe_ratio": {"ideal": (0, 15), "good": (15, 25), "bad_above": 40},
    "pb_ratio": {"ideal": (0, 1.5), "good": (1.5, 3), "bad_above": 5},
    "ev_ebitda": {"ideal": (0, 8), "good": (8, 14), "bad_above": 20},
    "roe": {"ideal_above": 20, "good_above": 12, "bad_below": 5},
    "roa": {"ideal_above": 10, "good_above": 5, "bad_below": 2},
    "roic": {"ideal_above": 15, "good_above": 8, "bad_below": 3},
    "net_margin": {"ideal_above": 20, "good_above": 10, "bad_below": 3},
    "gross_margin": {"ideal_above": 40, "good_above": 25, "bad_below": 10},
    "operating_margin": {"ideal_above": 20, "good_above": 10, "bad_below": 3},
    "dividend_yield": {"ideal_above": 6, "good_above": 3, "bad_below": 1},
    "payout_ratio": {"ideal": (25, 60), "good": (15, 80), "bad_above": 100},
    "net_debt_ebitda": {"ideal": (-1, 1.5), "good": (1.5, 3), "bad_above": 4},
    "current_ratio": {"ideal_above": 2, "good_above": 1.2, "bad_below": 0.8},
    "interest_coverage": {"ideal_above": 8, "good_above": 3, "bad_below": 1.5},
    "revenue_growth_1y": {"ideal_above": 15, "good_above": 5, "bad_below": -5},
    "profit_growth_1y": {"ideal_above": 20, "good_above": 5, "bad_below": -10},
}

BENCHMARKS_US = {
    **BENCHMARKS_BR,
    "pe_ratio": {"ideal": (0, 20), "good": (20, 35), "bad_above": 50},
    "pb_ratio": {"ideal": (0, 3), "good": (3, 6), "bad_above": 10},
    "dividend_yield": {"ideal_above": 3, "good_above": 1.5, "bad_below": 0},
}

BENCHMARKS_FII = {
    "pb_ratio": {"ideal": (0, 1.0), "good": (1.0, 1.2), "bad_above": 1.5},
    "dividend_yield": {"ideal_above": 9, "good_above": 6, "bad_below": 3},
    "vacancy_rate": {"ideal": (0, 5), "good": (5, 15), "bad_above": 25},
}


def calculate_score(data: FundamentalData, weights: ScoringWeights | None = None) -> ScoreResult:
    if weights is None:
        weights = ScoringWeights()

    benchmarks = _get_benchmarks(data.asset_type)

    valuation = _score_valuation(data, benchmarks)
    profitability = _score_profitability(data, benchmarks)
    dividends = _score_dividends(data, benchmarks)
    debt = _score_debt(data, benchmarks)
    growth = _score_growth(data, benchmarks)

    base_total = (
        valuation["score"] * weights.weight_valuation
        + profitability["score"] * weights.weight_profitability
        + dividends["score"] * weights.weight_dividends
        + debt["score"] * weights.weight_debt
        + growth["score"] * weights.weight_growth
    ) / 100

    # Piotroski and Z-Score bonus/penalty (up to +/- 5 points)
    bonus = _advanced_score_adjustment(data)
    total = round(min(100, max(0, base_total + bonus)), 1)

    all_details = {
        "valuation": valuation["details"],
        "profitability": profitability["details"],
        "dividends": dividends["details"],
        "debt": debt["details"],
        "growth": growth["details"],
    }

    # Include advanced scores in details if available
    advanced = {}
    if data.piotroski_score is not None:
        advanced["Piotroski F-Score"] = {"value": data.piotroski_score, "score": _piotroski_to_score(data.piotroski_score)}
    if data.altman_z_score is not None:
        advanced["Altman Z-Score"] = {"value": round(data.altman_z_score, 2), "score": _zscore_to_score(data.altman_z_score)}
    if advanced:
        all_details["advanced"] = advanced

    return ScoreResult(
        total_score=total,
        recommendation=_get_recommendation(total),
        valuation_score=round(valuation["score"], 1),
        profitability_score=round(profitability["score"], 1),
        dividends_score=round(dividends["score"], 1),
        debt_score=round(debt["score"], 1),
        growth_score=round(growth["score"], 1),
        details=all_details,
    )


def _advanced_score_adjustment(data: FundamentalData) -> float:
    """Bonus/penalty from Piotroski F-Score and Altman Z-Score."""
    adj = 0.0

    if data.piotroski_score is not None:
        # 0-3: bad (-3), 4-5: neutral (0), 6-7: good (+2), 8-9: excellent (+4)
        if data.piotroski_score >= 8:
            adj += 4
        elif data.piotroski_score >= 6:
            adj += 2
        elif data.piotroski_score <= 3:
            adj -= 3

    if data.altman_z_score is not None:
        # > 2.99: safe (+3), 1.81-2.99: grey zone (0), < 1.81: distress (-4)
        if data.altman_z_score > 2.99:
            adj += 3
        elif data.altman_z_score < 1.81:
            adj -= 4

    return adj


def _piotroski_to_score(val: int) -> float:
    if val >= 8: return 100
    if val >= 6: return 75
    if val >= 4: return 50
    return 20


def _zscore_to_score(val: float) -> float:
    if val > 2.99: return 100
    if val > 1.81: return 55
    return 15


def _get_benchmarks(asset_type: str) -> dict:
    if asset_type == "fii":
        return {**BENCHMARKS_BR, **BENCHMARKS_FII}
    if asset_type in ("us_stock", "us_etf"):
        return BENCHMARKS_US
    return BENCHMARKS_BR


def _score_valuation(data: FundamentalData, bench: dict) -> dict:
    scores = []
    details = {}

    for label, attr, key in [
        ("P/L", "pe_ratio", "pe_ratio"),
        ("P/VP", "pb_ratio", "pb_ratio"),
        ("EV/EBITDA", "ev_ebitda", "ev_ebitda"),
    ]:
        val = getattr(data, attr, None)
        if val is not None and val > 0:
            s = _score_range(val, bench.get(key, {}))
            scores.append(s)
            details[label] = {"value": round(val, 2), "score": s}

    if data.psr is not None and data.psr > 0:
        s = _score_range(data.psr, {"ideal": (0, 2), "good": (2, 5), "bad_above": 10})
        scores.append(s)
        details["PSR"] = {"value": round(data.psr, 2), "score": s}

    return {"score": _avg(scores), "details": details}


def _score_profitability(data: FundamentalData, bench: dict) -> dict:
    scores = []
    details = {}

    for label, attr, key in [
        ("ROE", "roe", "roe"),
        ("ROA", "roa", "roa"),
        ("ROIC", "roic", "roic"),
        ("Margem Líquida", "net_margin", "net_margin"),
        ("Margem Bruta", "gross_margin", "gross_margin"),
        ("Margem Operacional", "operating_margin", "operating_margin"),
    ]:
        val = getattr(data, attr, None)
        if val is not None:
            s = _score_above(val, bench.get(key, {}))
            scores.append(s)
            details[label] = {"value": round(val, 2), "score": s}

    return {"score": _avg(scores), "details": details}


def _score_dividends(data: FundamentalData, bench: dict) -> dict:
    scores = []
    details = {}

    if data.dividend_yield is not None:
        dy = data.dividend_yield
        if 0 < dy < 1:
            dy = dy * 100
        s = _score_above(dy, bench.get("dividend_yield", {}))
        scores.append(s)
        details["Dividend Yield"] = {"value": round(dy, 2), "score": s}

    if data.payout_ratio is not None:
        s = _score_range(data.payout_ratio, bench.get("payout_ratio", {}))
        scores.append(s)
        details["Payout Ratio"] = {"value": round(data.payout_ratio, 2), "score": s}

    return {"score": _avg(scores), "details": details}


def _score_debt(data: FundamentalData, bench: dict) -> dict:
    scores = []
    details = {}

    if data.net_debt_ebitda is not None:
        s = _score_range(data.net_debt_ebitda, bench.get("net_debt_ebitda", {}))
        scores.append(s)
        details["Dív.Líq./EBITDA"] = {"value": round(data.net_debt_ebitda, 2), "score": s}

    if data.current_ratio is not None:
        s = _score_above(data.current_ratio, bench.get("current_ratio", {}))
        scores.append(s)
        details["Liquidez Corrente"] = {"value": round(data.current_ratio, 2), "score": s}

    if data.interest_coverage is not None:
        s = _score_above(data.interest_coverage, bench.get("interest_coverage", {}))
        scores.append(s)
        details["Cobertura de Juros"] = {"value": round(data.interest_coverage, 2), "score": s}

    return {"score": _avg(scores), "details": details}


def _score_growth(data: FundamentalData, bench: dict) -> dict:
    scores = []
    details = {}

    for label, attr, key in [
        ("Cresc. Receita 1a", "revenue_growth_1y", "revenue_growth_1y"),
        ("Cresc. Lucro 1a", "profit_growth_1y", "profit_growth_1y"),
        ("Cresc. Receita 5a", "revenue_growth_5y", "revenue_growth_1y"),
    ]:
        val = getattr(data, attr, None)
        if val is not None:
            s = _score_above(val, bench.get(key, {}))
            scores.append(s)
            details[label] = {"value": round(val, 2), "score": s}

    return {"score": _avg(scores), "details": details}


def _score_range(value: float, bench: dict) -> float:
    ideal = bench.get("ideal")
    good = bench.get("good")
    bad_above = bench.get("bad_above")

    if ideal and ideal[0] <= value <= ideal[1]:
        return 100
    if good and good[0] <= value <= good[1]:
        return 65
    if bad_above and value > bad_above:
        return 10
    if value < 0:
        return 30
    return 40


def _score_above(value: float, bench: dict) -> float:
    ideal = bench.get("ideal_above")
    good = bench.get("good_above")
    bad = bench.get("bad_below")

    if ideal is not None and value >= ideal:
        return 100
    if good is not None and value >= good:
        return 65
    if bad is not None and value < bad:
        return 15
    return 40


def _avg(scores: list[float]) -> float:
    if not scores:
        return 50
    return sum(scores) / len(scores)


def _get_recommendation(score: float) -> str:
    for (low, high), label in RECOMMENDATIONS.items():
        if low <= score < high:
            return label
    return "Neutro"
