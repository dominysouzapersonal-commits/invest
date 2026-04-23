from contextlib import asynccontextmanager
import os
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, close_db
from app.routers import auth, assets, analysis, portfolio, compare, watchlist, report


def _git_sha() -> str:
    sha = os.environ.get("RENDER_GIT_COMMIT") or os.environ.get("GIT_SHA")
    if sha:
        return sha[:7]
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL,
            timeout=2,
        ).decode().strip()
    except Exception:
        return "unknown"


GIT_SHA = _git_sha()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="InvestAnalytics API",
    description="Plataforma de análise de investimentos para ações BR, FIIs, ações US, ETFs e BDRs",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(compare.router, prefix="/api/compare", tags=["Compare"])
app.include_router(watchlist.router, prefix="/api/watchlist", tags=["Watchlist"])
app.include_router(report.router, prefix="/api/report", tags=["Report"])


@app.get("/")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0.0", "sha": GIT_SHA}
