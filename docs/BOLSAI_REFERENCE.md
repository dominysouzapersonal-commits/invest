# bolsai API — Referência Completa

> Fonte: https://usebolsai.com/docs
> API Key: no .env (`BOLSAI_API_KEY`)
> Base URL: `https://api.usebolsai.com/api/v1`
> Dados: CVM + B3 + BCB (fontes oficiais brasileiras)
> Plano: Pro (R$ 29/mês, 10.000 req/dia)

---

## Autenticação

Header `X-API-Key` em toda requisição.

```bash
curl -H "X-API-Key: sua_chave" https://api.usebolsai.com/api/v1/fundamentals/PETR4
```

Todos os endpoints aceitam `?format=csv` para exportar em CSV.

---

## 1. EMPRESAS

### GET /companies
Lista empresas com filtros por setor, status e busca por nome.

| Param | Tipo | Descrição |
|---|---|---|
| sector | string | Filtrar por setor (ex: "Financeiro") |
| status | string | Filtrar por status (ex: "ATIVO") |
| search | string | Busca por razão social ou nome de pregão |
| limit/offset | int | Paginação |

### GET /companies/sectors
Lista setores disponíveis com contagem de empresas.

### GET /companies/{ticker}
Detalhes da empresa: CNPJ, setor, status, cidade, estado, site, data de registro.

---

## 2. AÇÕES (STOCKS)

### GET /stocks
Lista tickers. `bdi_code`: "02" = ações, "12" = FIIs, "14" = BDRs.

### GET /stocks/{ticker}/quote
Cotação mais recente: open, high, low, close, volume, traded_amount, num_trades.

### GET /stocks/{ticker}/stats
Estatísticas: 52-week high/low, YTD return, daily change, avg volume.

**Resposta:**
```json
{
  "ticker": "ITUB4",
  "close": 34.52,
  "daily_change_pct": 1.11,
  "week_52_low": 27.15,
  "week_52_high": 36.89,
  "avg_volume_52w": 24563100,
  "ytd_return_pct": 12.45
}
```

### GET /stocks/{ticker}/history
Preços históricos OHLCV desde 1986, ajustados por splits e dividendos.

| Param | Tipo | Descrição |
|---|---|---|
| start | date | Data início (YYYY-MM-DD) |
| end | date | Data fim |
| limit | int | Max registros (1-5000, padrão: 252) |

Campos por registro: trade_date, open, high, low, close, adjusted_open/high/low/close, volume, adjusted_volume, traded_amount, num_trades.

### GET /stocks/{ticker}/corporate-events
Splits e grupamentos confirmados pela B3.

### GET /stocks/{ticker}/ticker-history
Histórico de renomeações de tickers (ex: VIIA3 → BHIA3).

### GET /stocks/corporate-events
Todos os splits/grupamentos de todos os tickers.

---

## 3. FUNDAMENTOS (O mais importante)

### GET /fundamentals/{ticker}

**27 indicadores TTM calculados da CVM/B3. Bate com Status Invest.**

| Param | Tipo | Descrição |
|---|---|---|
| ticker | string | Ticker da ação (ex: PETR4) |
| reference_date | date | Data de referência do balanço (opcional) |

**Campos retornados:**

| Campo | Descrição | Exemplo |
|---|---|---|
| `pl` | Preço/Lucro | 5.32 |
| `pvp` | Preço/Valor Patrimonial | 1.42 |
| `ev_ebitda` | Enterprise Value / EBITDA | 3.27 |
| `ev_ebit` | Enterprise Value / EBIT | 4.67 |
| `p_ebitda` | Preço / EBITDA | 2.65 |
| `p_ebit` | Preço / EBIT | 2.98 |
| `p_sr` | Preço / Receita (PSR) | 1.18 |
| `p_assets` | Preço / Ativos | 0.48 |
| `lpa` | Lucro por Ação | 8.54 |
| `vpa` | Valor Patrimonial por Ação | 32.26 |
| `roe` | Return on Equity (%) | 26.6 |
| `roa` | Return on Assets (%) | 9.04 |
| `roic` | Return on Invested Capital (%) | 17.4 |
| `net_margin` | Margem Líquida (%) | 22.23 |
| `gross_margin` | Margem Bruta (%) | 47.6 |
| `ebitda_margin` | Margem EBITDA (%) | 39.6 |
| `ebit_margin` | Margem EBIT (%) | 33.2 |
| `debt_equity` | Dívida / PL (ratio) | 0.92 |
| `net_debt_equity` | Dívida Líquida / PL | 0.8 |
| `net_debt_ebitda` | Dívida Líquida / EBITDA | 1.18 |
| `net_debt_ebit` | Dívida Líquida / EBIT | 1.69 |
| `current_ratio` | Liquidez Corrente | 0.71 |
| `asset_turnover` | Giro do Ativo | 0.41 |
| `ebit_over_assets` | EBIT / Ativos (%) | 16.1 |
| `cagr_revenue_5y` | CAGR Receita 5 anos (%) | -0.8 |
| `cagr_earnings_5y` | CAGR Lucro 5 anos (%) | null |

**Dados absolutos (em milhares R$):**

| Campo | Descrição |
|---|---|
| `net_income` | Lucro Líquido |
| `equity` | Patrimônio Líquido |
| `net_revenue` | Receita Líquida |
| `total_debt` | Dívida Total |
| `ebitda` | EBITDA |
| `ebit` | EBIT |
| `net_debt` | Dívida Líquida |
| `cash` | Caixa |
| `total_assets` | Ativos Totais |
| `current_assets` | Ativos Circulantes |
| `current_liabilities` | Passivos Circulantes |

Também retorna: close_price, shares_outstanding, market_cap, cvm_code, corporate_name.

### GET /fundamentals/{ticker}/history
Histórico trimestral de indicadores (até 80 trimestres = 20 anos).

---

## 4. DEMONSTRAÇÕES FINANCEIRAS (RAW CVM)

### GET /financials/{ticker}

| Param | Tipo | Descrição |
|---|---|---|
| report_type | string | "DFP" (anual) ou "ITR" (trimestral) |
| statement_type | string | BPA, BPP, DRE, DFC_MI, DVA |
| reference_date | date | Data específica |
| limit | int | Max linhas |

Retorna contas CVM brutas com account_code, account_name, value.

Exemplos de contas:
- `3.01` — Receita
- `3.03` — Resultado Bruto
- `3.05` — Resultado Antes do Financeiro

---

## 5. DIVIDENDOS

### GET /dividends/{ticker}

| Param | Tipo | Descrição |
|---|---|---|
| years | int | Anos de histórico (1-20, padrão: 5) |

**Retorna:**
- `dividend_yield_ttm` — DY últimos 12 meses
- `ttm_per_share` — Total por ação nos últimos 12 meses
- `annual_summary` — Total por ano com contagem de pagamentos
- `payments` — Lista detalhada com:
  - `ex_date` — Data-ex
  - `payment_date` — Data de pagamento
  - `type` — **"Dividendo" ou "JCP"** (separação real!)
  - `value_per_share` — Valor por ação

---

## 6. FIIs

### GET /fiis
Lista todos os FIIs: ticker, nome, segmento, tipo de gestão, nº cotistas.

### GET /fiis/{ticker}
Fundamentos do FII:
- `close_price`, `book_value_per_share`, `pvp`
- `dividend_yield_ttm`
- `net_asset_value` (NAV)
- `shares_outstanding`, `total_shareholders`
- `segment`, `management_type`

### GET /fiis/{ticker}/history
Histórico mensal: P/VP, DY mensal, NAV, cotistas.

### GET /fiis/{ticker}/distributions
Distribuições mensais:
- `dividend_yield_ttm`, `ttm_per_share`
- `annual_summary` — total por ano
- `payments` — R$/cota mensal, dy_month_pct, book_value_per_share

---

## 7. SCREENER

### GET /screener
Filtra todas as ~264 ações por indicadores fundamentalistas.

Use `{metric}_gt` (maior que) e `{metric}_lt` (menor que).

**Métricas disponíveis para filtro:**
pl, pvp, ev_ebitda, roe, roa, roic, net_margin, gross_margin, ebitda_margin, dividend_yield, debt_equity, net_debt_ebitda, market_cap, lpa, vpa, current_ratio, p_sr, cagr_revenue_5y, cagr_earnings_5y

| Param | Tipo | Descrição |
|---|---|---|
| sector | string | Filtrar por setor |
| sort | string | Ordenar por métrica (padrão: market_cap) |
| order | string | "asc" ou "desc" |
| limit/offset | int | Paginação |

**Exemplo:** Ações com DY > 6%, ROE > 10%:
```
GET /screener?dividend_yield_gt=6&roe_gt=10&sort=dividend_yield&order=desc
```

---

## 8. MACRO

### GET /macro
Lista séries disponíveis: selic, selic_target, ipca, cdi, usd_brl.

### GET /macro/{series_name}
Dados históricos da série.

| Param | Tipo | Descrição |
|---|---|---|
| start/end | date | Período |
| limit | int | Max registros |

**Séries:**
| Nome | Código BCB | Descrição |
|---|---|---|
| `selic` | 11 | Taxa Selic diária |
| `selic_target` | 432 | Meta Selic (Copom) |
| `ipca` | 433 | IPCA mensal |
| `cdi` | 12 | CDI diário |
| `usd_brl` | 1 | USD/BRL PTAX |

---

## 9. HEALTH

### GET /health
Status da API e dependências (PostgreSQL, Redis). Sem autenticação.

---

## 10. API KEYS / USAGE

### GET /keys/usage?api_key=xxx
Uso atual: tier, used_today, daily_limit, remaining.

### POST /keys/register
Registrar nova API key (body: name, email).

---

## 11. MCP (Model Context Protocol)

A bolsai tem um servidor MCP para integração com IAs (Claude, Cursor, ChatGPT).

**Instalação:**
```bash
pip install bolsai-mcp
```

**Configuração para Cursor/Claude Desktop:**
```json
{
  "mcpServers": {
    "bolsai": {
      "command": "uvx",
      "args": ["bolsai-mcp"],
      "env": {
        "BOLSAI_API_KEY": "sk_sua_chave_aqui"
      }
    }
  }
}
```

**10 ferramentas MCP disponíveis:**
1. `screen_stocks` — Screening por indicadores
2. `compare_stocks` — Comparar até 5 ações
3. `get_fundamentals` — 27+ indicadores
4. `get_dividends` — Histórico DY com JCP/Dividendo
5. `get_financial_statements` — DRE, balanço, DFC da CVM
6. `get_fii_details` — Fundamentos e distribuições FIIs
7. `get_price_history` — Preços OHLCV ajustados
8. `get_macro_indicator` — SELIC, IPCA, CDI, USD/BRL
9. `get_stock_quote` — Cotação atual com stats
10. `search_companies` — Busca por nome ou setor

---

## Limites

| Plano | Req/dia | Endpoints | Histórico |
|---|---|---|---|
| Grátis | 200 | Fundamentals, FIIs, quotes, companies | Atual |
| Pro (R$29/mês) | 10.000 | Todos | 10+ anos |

Rate limit: header `X-RateLimit-Remaining`. Excedido → 429 Too Many Requests.
Reset: meia-noite UTC.
