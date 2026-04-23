#!/usr/bin/env python3
"""
Busca preços da carteira do relatório direto na bolsai (CVM/B3).
Uso (na raiz do repo):
  export BOLSAI_API_KEY=sk_...
  python3 scripts/bolsai_carteira_prices.py

Ou com .env no backend:
  set -a && source backend/.env && set +a && python3 scripts/bolsai_carteira_prices.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

BASE = "https://api.usebolsai.com/api/v1"
# ETF NASD11 não existe na bolsai (404); mesmo preço usado no app (brapi via API pública).
NASD_FALLBACK_URL = "https://investanalytics-api.onrender.com/api/assets/NASD11"

# Mesma grade do RELATORIO_COMPLETO.md (revisão 23/04/2026)
ROWS = [
    ("INTB3", "stock", 76),
    ("SUZB3", "stock", 25),
    ("BBSE3", "stock", 20),
    ("ITUB4", "stock", 14),
    ("MXRF11", "fii", 68),
    ("KNCR11", "fii", 6),
    ("NASD11", "etf", 54),
]


def load_dotenv() -> None:
    for path in ("backend/.env", ".env"):
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v


def http_get(path: str, api_key: str) -> dict | list | None:
    url = f"{BASE}/{path}"
    req = urllib.request.Request(
        url,
        headers={
            "X-API-Key": api_key,
            "User-Agent": "Mozilla/5.0 (compatible; Investimentos/1.0; +https://github.com/dominysouzapersonal-commits/invest)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            body = resp.read().decode()
            if not body.strip():
                return None
            return json.loads(body)
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:500]
        print(f"HTTP {e.code} {path}: {err}", file=sys.stderr)
        return None


def nasd11_price_brapi_public() -> float | None:
    req = urllib.request.Request(
        NASD_FALLBACK_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; Investimentos/1.0)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        f = data.get("fundamentals") or {}
        p = f.get("price")
        return float(p) if p is not None else None
    except (urllib.error.URLError, ValueError, TypeError, json.JSONDecodeError):
        return None


def brl(n: float) -> str:
    s = f"{n:.2f}"
    ip, dec = s.split(".")
    parts = []
    while ip:
        parts.append(ip[-3:])
        ip = ip[:-3]
    body = ".".join(reversed(parts))
    return f"R${body},{dec}"


def main() -> int:
    load_dotenv()
    key = (os.environ.get("BOLSAI_API_KEY") or "").strip()
    if not key:
        print("Erro: defina BOLSAI_API_KEY ou backend/.env", file=sys.stderr)
        return 1

    print("ticker\ttipo\tpreco_bolsai\ttotal_linha")
    subtotal = 0.0
    for ticker, kind, qty in ROWS:
        price = None
        if kind == "stock":
            q = http_get(f"stocks/{ticker}/quote", key)
            if isinstance(q, dict):
                price = q.get("close")
        elif kind == "fii":
            q = http_get(f"fiis/{ticker}", key)
            if isinstance(q, dict):
                price = q.get("close_price")
        else:
            if ticker == "NASD11":
                price = nasd11_price_brapi_public()
            else:
                q = http_get(f"stocks/{ticker}/quote", key)
                if isinstance(q, dict):
                    price = q.get("close")

        if price is None:
            print(f"{ticker}\t{kind}\t(null)\t-", file=sys.stderr)
            continue
        line = float(price) * qty
        subtotal += line
        print(f"{ticker}\t{kind}\t{price}\t{line:.2f}")

    print(f"\nSubtotal (7 linhas): {brl(subtotal)}  |  Capital 6.700 → saldo RF teórico: {brl(6700 - subtotal)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
