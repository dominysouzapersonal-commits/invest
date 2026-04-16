# brapi.dev - Referência Completa da API (Plano Premium)

## Plano Contratado: Premium (melhor plano)
- 500.000 requisições/mês
- 20 ativos por request (batch)
- Dados atualizados a cada 5 minutos
- Fundamentalistas completos desde 2009
- Suporte técnico prioritário

## Autenticação
- Token: via header `Authorization: Bearer TOKEN` (recomendado)
- Ou via query param `?token=TOKEN`
- URL Base: `https://brapi.dev/api`

## SDK Python Oficial
```bash
pip install brapi
```
```python
from brapi import Brapi, AsyncBrapi

# Síncrono
client = Brapi(api_key="TOKEN")
quote = client.quote.retrieve(tickers="PETR4")

# Assíncrono
async with AsyncBrapi(api_key="TOKEN") as client:
    quote = await client.quote.retrieve(tickers="PETR4")
```

---

## ENDPOINTS

### 1. Cotação de Ativos (O principal)
```
GET /api/quote/{tickers}
```
- **Tickers**: separados por vírgula, até 20 por request. Ex: `PETR4,VALE3,ITUB4`
- **Parâmetros**:
  - `range`: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
  - `interval`: 1d, 5d, 1wk, 1mo, 3mo
  - `fundamental`: true/false (P/L, LPA básicos)
  - `dividends`: true/false (histórico completo de dividendos e JCP)
  - `modules`: lista de módulos separados por vírgula (dados avançados)

#### Campos retornados na cotação:
- symbol, shortName, longName, currency
- regularMarketPrice, regularMarketChange, regularMarketChangePercent
- regularMarketDayHigh, regularMarketDayLow, regularMarketVolume
- regularMarketPreviousClose, regularMarketOpen
- fiftyTwoWeekHigh, fiftyTwoWeekLow
- twoHundredDayAverage, twoHundredDayAverageChange
- marketCap, priceEarnings, earningsPerShare
- logourl
- historicalDataPrice (array OHLCV quando range/interval fornecidos)
- dividendsData (quando dividends=true)

#### Módulos Disponíveis (param `modules`):
| Módulo | Descrição |
|--------|-----------|
| `summaryProfile` | Perfil da empresa: CNPJ, setor, descrição, website, funcionários |
| `financialData` | Indicadores TTM: ROE, ROA, margens, EBITDA, FCF, dívida, caixa, target price, recommendation |
| `defaultKeyStatistics` | Estatísticas-chave TTM: P/L, P/VP, EV/EBITDA, PEG, DY, marketCap |
| `balanceSheetHistory` | Balanço Patrimonial ANUAL (desde 2009) |
| `balanceSheetHistoryQuarterly` | Balanço Patrimonial TRIMESTRAL |
| `incomeStatementHistory` | DRE ANUAL (desde 2009) |
| `incomeStatementHistoryQuarterly` | DRE TRIMESTRAL |
| `cashflowHistory` | Fluxo de Caixa ANUAL |
| `cashflowHistoryQuarterly` | Fluxo de Caixa TRIMESTRAL |
| `financialDataHistory` | Indicadores financeiros ANUAIS |
| `financialDataHistoryQuarterly` | Indicadores financeiros TRIMESTRAIS |
| `defaultKeyStatisticsHistory` | Estatísticas-chave ANUAIS |
| `defaultKeyStatisticsHistoryQuarterly` | Estatísticas-chave TRIMESTRAIS |
| `valueAddedHistory` | DVA ANUAL |
| `valueAddedHistoryQuarterly` | DVA TRIMESTRAL |

#### Campos do módulo `financialData`:
- currentPrice, ebitda, quickRatio, currentRatio
- debtToEquity, revenuePerShare
- returnOnAssets (ROA), returnOnEquity (ROE)
- earningsGrowth, revenueGrowth
- grossMargins, ebitdaMargins, operatingMargins, profitMargins
- totalCash, totalCashPerShare, totalDebt, totalRevenue
- grossProfits, operatingCashflow, freeCashflow
- financialCurrency
- targetHighPrice, targetLowPrice, targetMeanPrice, targetMedianPrice
- recommendationMean, recommendationKey, numberOfAnalystOpinions

#### Campos do módulo `defaultKeyStatistics`:
- enterpriseValue, enterpriseToEbitda, enterpriseToRevenue
- trailingPE, forwardPE, pegRatio
- priceToBook, profitMargins
- bookValue, earningsPerShare, trailingEps
- dividendYield, yield
- sharesOutstanding, floatShares
- marketCap, netIncomeToCommon

#### Campos do Balanço Patrimonial (balanceSheetHistory):
- cash, shortTermInvestments, netReceivables, inventory
- totalCurrentAssets, longTermInvestments, propertyPlantEquipment
- totalAssets, accountsPayable, shortLongTermDebt, longTermDebt
- totalCurrentLiabilities, totalLiab, totalStockholderEquity

#### Campos da DRE (incomeStatementHistory):
- Receita, custos, lucro bruto, EBIT, lucro líquido, etc.

#### Campos do Fluxo de Caixa (cashflowHistory):
- Operacional, investimento, financiamento, FCF

#### Dividendos (dividendsData):
- cashDividends: array com rate (valor/ação), paymentDate, label (DIVIDENDO/JCP), lastDatePrior (data-com)
- stockDividends: desdobramentos, grupamentos
- subscriptions: subscrições

---

### 2. Listar Ativos
```
GET /api/quote/list
```
- **Parâmetros**: search, sortBy (volume/close/market_cap_basic/name), sortOrder (asc/desc), limit, page, sector, type (stock/fund/bdr)
- **Retorna**: lista paginada com stock, name, close, change, volume, market_cap, logo, sector, type
- **Setores disponíveis**: Finance, Energy Minerals, Technology Services, Health Services, Retail Trade, Utilities, etc.

---

### 3. Criptomoedas
```
GET /api/v2/crypto?coin=BTC,ETH&currency=BRL
GET /api/v2/crypto/available
```
- Suporta range/interval para histórico
- Moedas: BRL, USD, EUR

### 4. Câmbio
```
GET /api/v2/currency?currency=USD-BRL,EUR-BRL
GET /api/v2/currency/available
```
- Retorna bid, ask, high, low, variação

### 5. Inflação (IPCA)
```
GET /api/v2/inflation?country=brazil
GET /api/v2/inflation/available
```
- Histórico desde 2000
- Filtros: start, end (DD/MM/YYYY), sortBy, sortOrder

### 6. Taxa SELIC
```
GET /api/v2/prime-rate?country=brazil
GET /api/v2/prime-rate/available
```
- Histórico desde 2000
- Mesmos filtros da inflação

---

## DICAS DE OTIMIZAÇÃO

1. **Batch de 20 tickers**: `/api/quote/PETR4,VALE3,ITUB4,...` (até 20 por request)
2. **Módulos combinados**: `?modules=financialData,defaultKeyStatistics` (uma request, todos os dados)
3. **Cache no backend**: dados fundamentalistas mudam pouco, cachear por 30-60 min
4. **Dividends separado**: só pedir `dividends=true` quando precisar (é mais pesado)
5. **Historical separado**: só pedir `range=1y&interval=1d` quando precisar de gráfico

## EXEMPLOS IMPORTANTES

```bash
# Análise completa de 1 ativo (tudo que existe)
curl -H "Authorization: Bearer TOKEN" \
  "https://brapi.dev/api/quote/PETR4?fundamental=true&dividends=true&modules=financialData,defaultKeyStatistics,summaryProfile,balanceSheetHistory,incomeStatementHistory,cashflowHistory"

# Batch de 20 ações com fundamentais
curl -H "Authorization: Bearer TOKEN" \
  "https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,BBDC4,WEGE3,PRIO3,RENT3,TOTS3,SUZB3,SBSP3,BBAS3,CMIG4,BBSE3,EGIE3,ITSA4,RADL3,VIVT3,EQTL3,RAIL3,HAPV3?modules=financialData,defaultKeyStatistics&fundamental=true&dividends=true"

# Screener: top 10 por volume, setor financeiro
curl -H "Authorization: Bearer TOKEN" \
  "https://brapi.dev/api/quote/list?sector=Finance&sortBy=volume&sortOrder=desc&limit=10"

# Dólar + Euro + Bitcoin
curl -H "Authorization: Bearer TOKEN" \
  "https://brapi.dev/api/v2/currency?currency=USD-BRL,EUR-BRL"

# IPCA últimos 12 meses
curl -H "Authorization: Bearer TOKEN" \
  "https://brapi.dev/api/v2/inflation?country=brazil"

# SELIC atual
curl -H "Authorization: Bearer TOKEN" \
  "https://brapi.dev/api/v2/prime-rate?country=brazil"
```

## MCP (Model Context Protocol) - Para IAs
A brapi tem um servidor MCP que pode ser integrado diretamente no Cursor:

Arquivo `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "brapi": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://brapi.dev/api/mcp/mcp",
        "--header",
        "Authorization:Bearer ${BRAPI_API_KEY}"
      ],
      "env": {
        "BRAPI_API_KEY": "TOKEN"
      }
    }
  }
}
```

Ferramentas MCP disponíveis:
- get_stock_quotes: cotações de ações
- get_currency_rates: câmbio
- get_crypto_prices: criptomoedas
- get_inflation_data: inflação
- get_prime_rate_data: SELIC
- get_available_stocks: listar ativos
