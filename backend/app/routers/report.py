from fastapi import APIRouter
from app.schemas.analysis import FullReport
from app.services.report_service import generate_full_report
from app.services.data_providers import brapi

router = APIRouter()


@router.get("/full-analysis", response_model=FullReport)
async def full_analysis():
    """Generate the complete investment analysis report with 40+ assets."""
    return await generate_full_report()


@router.get("/macro")
async def get_macro():
    """Current SELIC, IPCA, and exchange rates for calculators."""
    import asyncio
    selic_data, ipca_data, currency_data = await asyncio.gather(
        brapi.get_selic(),
        brapi.get_ipca(),
        brapi.get_currency("USD-BRL"),
        return_exceptions=True,
    )

    selic = None
    if isinstance(selic_data, list) and selic_data:
        selic = selic_data[0].get("value")

    ipca = None
    if isinstance(ipca_data, list) and ipca_data:
        ipca = ipca_data[0].get("value")

    usd = None
    if isinstance(currency_data, list):
        for c in currency_data:
            if "USD" in c.get("fromCurrency", ""):
                usd = c.get("bidPrice") or c.get("bid")

    return {"selic": selic, "ipca": ipca, "usd_brl": usd}
