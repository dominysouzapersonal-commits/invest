import httpx
from bs4 import BeautifulSoup

BASE_URL = "https://www.fundamentus.com.br"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9",
}


async def get_fundamentals(ticker: str) -> dict | None:
    url = f"{BASE_URL}/detalhes.php"
    params = {"papel": ticker.upper().replace(".SA", "")}

    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        resp = await client.get(url, params=params, headers=HEADERS)
        if resp.status_code != 200:
            return None

    soup = BeautifulSoup(resp.text, "lxml")
    tables = soup.find_all("table", class_="w728")
    if not tables:
        return None

    data = _parse_tables(tables)
    return data


def _parse_tables(tables) -> dict:
    result = {}
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all("td")
            i = 0
            while i < len(cells) - 1:
                label = cells[i].get_text(strip=True)
                value = cells[i + 1].get_text(strip=True)
                key = _map_label(label)
                if key:
                    result[key] = _parse_value(value)
                i += 2
    return result


def _map_label(label: str) -> str | None:
    mapping = {
        "P/L": "pe_ratio",
        "P/VP": "pb_ratio",
        "P/EBIT": "p_ebit",
        "PSR": "psr",
        "P/Ativo": "price_to_assets",
        "EV/EBITDA": "ev_ebitda",
        "EV/EBIT": "ev_ebit",
        "Div.Yield": "dividend_yield",
        "Div. Yield": "dividend_yield",
        "ROE": "roe",
        "ROA": "roa",
        "ROIC": "roic",
        "Mrg Ebit": "ebitda_margin",
        "Mrg. Ebit": "ebitda_margin",
        "Mrg. Líq.": "net_margin",
        "Mrg Líq.": "net_margin",
        "Marg. Bruta": "gross_margin",
        "Liq. Corr.": "current_ratio",
        "Dív.Líq./Patrim.": "net_debt_equity",
        "Dív. Líq./Patrim.": "net_debt_equity",
        "Dív.Líq./EBITDA": "net_debt_ebitda",
        "Dív. Líq./EBITDA": "net_debt_ebitda",
        "Cres. Rec.5a": "revenue_growth_5y",
        "Cres. Rec (5a)": "revenue_growth_5y",
        "Vol $ méd (2m)": "avg_volume",
        "Vol $ méd(2m)": "avg_volume",
        "Valor de mercado": "market_cap",
    }
    return mapping.get(label)


def _parse_value(value: str) -> float | None:
    if not value or value == "-":
        return None
    try:
        cleaned = value.replace(".", "").replace(",", ".").replace("%", "").strip()
        return float(cleaned)
    except (ValueError, AttributeError):
        return None
