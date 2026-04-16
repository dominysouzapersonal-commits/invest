from fastapi import APIRouter
from app.schemas.analysis import FullReport
from app.services.report_service import generate_full_report

router = APIRouter()


@router.get("/full-analysis", response_model=FullReport)
async def full_analysis():
    """Generate the complete investment analysis report with 40+ assets."""
    return await generate_full_report()
