"""Mapping of B3 tickers to US ADR tickers for FMP enrichment."""

BR_TO_ADR: dict[str, str] = {
    "PETR4": "PBR", "PETR3": "PBR",
    "VALE3": "VALE",
    "ITUB4": "ITUB", "ITUB3": "ITUB",
    "BBDC4": "BBD", "BBDC3": "BBD",
    "SBSP3": "SBS",
    "ABEV3": "ABEV",
    "SUZB3": "SUZ",
    "ELET3": "EBR", "ELET6": "EBR",
    "BBAS3": "BDORY",
    "CMIG4": "CIG",
    "CSAN3": "CSAN",
    "GGBR4": "GGB",
    "CSNA3": "SID",
    "VIVT3": "VIV",
    "EQTL3": "EQTLY",
    "KLBN11": "KLBAY",
}
