# Metodologia de Análise de Investimentos — InvestAnalytics

> Documento de referência permanente. Seguir este padrão em toda análise futura.
> Última atualização: 18 de abril de 2026 (v3 — dados CVM via bolsai)

---

## 1. Filosofia Base

A análise segue a escola **fundamentalista de valor (Value Investing)**, fundada por Benjamin Graham e popularizada por Warren Buffett. O princípio central é:

> "Preço é o que você paga. Valor é o que você recebe." — Warren Buffett

Não usamos análise técnica (gráficos, suportes, resistências, RSI, médias móveis). O foco é exclusivamente em **o que a empresa é** — seus fundamentos financeiros, vantagem competitiva, governança e capacidade de gerar caixa.

### Influências teóricas

| Referência | Autor | Contribuição usada |
|---|---|---|
| *The Intelligent Investor* (1949) | Benjamin Graham | Margem de segurança, P/L baixo, investidor defensivo vs empreendedor |
| *Security Analysis* (1934) | Graham & Dodd | Análise de balanço, valor intrínseco, margem de segurança |
| Cartas aos acionistas Berkshire | Warren Buffett | ROE consistente, moat, owner earnings, comprar empresas excelentes a preço justo |
| *Value Investing: Historical Financial Statements* (2000) | Joseph Piotroski | F-Score de 9 pontos para filtrar value traps |
| *Financial Ratios and Corporate Bankruptcy* (1968) | Edward Altman | Z-Score para prever risco de falência |
| *Faça Fortuna com Ações* (1992) | Décio Bazin | DY > 6% como critério de compra no Brasil |
| Filosofia Luiz Barsi | Luiz Barsi | Comprar pagadoras de dividendos consistentes, reinvestir, longo prazo |
| *Modern Portfolio Theory* (1952) | Harry Markowitz | Diversificação reduz risco sem reduzir retorno esperado |
| *Valuation: Measuring and Managing the Value of Companies* | McKinsey/Koller | DCF como padrão ouro de valuation |

---

## 2. Fontes de Dados

| Fonte | Tipo | Custo | O que fornece | Quando usar |
|---|---|---|---|---|
| **bolsai** (`usebolsai.com`) | API Pro | R$ 29/mês | 27 indicadores CVM/B3, dividendos com JCP split, FIIs, DRE/balanço raw, screener, macro (SELIC/IPCA/CDI/USD) | **PRIMARY para BR** — todos os indicadores fundamentalistas |
| **brapi.dev** (Premium) | API paga | Já contratada | Cotações em tempo real, preço intraday, ETFs BR | **Cotação real-time** e ETFs BR apenas |
| **FMP** (Financial Modeling Prep) | API paga | Já contratada | Profile, ratios TTM, Piotroski, Altman Z, DCF, analyst grades, RSI, insider trades, ETF holdings | **PRIMARY para US stocks** |

**Regra de prioridade para ações BR:**
1. **bolsai** para fundamentos (P/L, P/VP, ROE, ROIC, margens, DY, LPA, VPA, CAGR, dívida) — dados da CVM, batem com Status Invest
2. **brapi** para preço em tempo real, variação do dia, volume, histórico de preço (OHLCV)
3. **FMP** apenas como fallback ou para dados não disponíveis na bolsai (Piotroski, Altman Z)

**Por que bolsai e não brapi para fundamentos:** Os módulos `defaultKeyStatistics` e `financialData` da brapi usam dados do Yahoo Finance global que contam shares incorretamente para ações BR (incluem units/ADRs), corrompendo P/VP, EV/EBITDA e VPA. A bolsai usa dados oficiais da CVM com shares_outstanding corretos da B3. Documentação completa: `docs/BOLSAI_REFERENCE.md`.

---

## 3. Universo de Ativos

Analisar no mínimo 40 ativos distribuídos em:

| Categoria | Qtd mínima | Foco |
|---|---|---|
| Crescimento | 12-15 | Empresas com potencial de valorização, receita crescente |
| Dividendos | 10-14 | Pagadoras consistentes, DY alto, payout saudável |
| FIIs | 8-10 | Renda mensal isenta, diversificação imobiliária |
| ETF Internacional | 5-8 | Diversificação geográfica |
| Reserva | — | Renda fixa (Tesouro Selic, CDB 100% CDI) |

---

## 4. Os 6 Critérios de Análise (Scoring Quantitativo)

Todos os indicadores abaixo são obtidos da **bolsai** (fonte CVM/B3) para ações BR. Para US, via FMP.

### Critério 1: Valuation (Peso 20%)

"Nunca pagar caro, mesmo por uma empresa boa." — Graham

| Indicador | 100 pts | 85 pts | 65 pts | 40 pts | 15 pts | Fonte bolsai |
|---|---|---|---|---|---|---|
| P/L | < 10 | 10-15 | 15-20 | 20-30 | > 30 | `pl` |
| P/VP | < 1.5 | 1.5-2 | 2-3 | 3-5 | > 5 | `pvp` |
| EV/EBITDA | < 6 | 6-8 | 8-10 | 10-14 | > 14 | `ev_ebitda` |
| PSR | < 1.5 | 1.5-2 | 2-3 | 3-5 | > 5 | `p_sr` |

**Regras:**
- P/L negativo = prejuízo = **5 pts** por padrão. **Exceção (turnaround):** se Dív.Líq/EBITDA < 2 OU ROIC > 8%, sobe para **20 pts** — reconhece empresas em prejuízo temporário com balanço sólido (melhoria baseada em revisão Graham)
- EV/EBITDA é mais confiável que P/L porque inclui dívida e ignora estrutura de capital
- PSR é útil para empresas em prejuízo onde P/L não funciona

### Critério 2: Rentabilidade (Peso 20%)

"Procure empresas com ROE consistentemente acima de 15%." — Buffett

| Indicador | 100 pts | 80 pts | 60 pts | 35 pts | 10 pts | Fonte bolsai |
|---|---|---|---|---|---|---|
| ROE | > 25% | 15-25% | 10-15% | 5-10% | < 5% | `roe` |
| ROIC | > 20% | 12-20% | 8-12% | 4-8% | < 4% | `roic` |
| Margem Líquida | > 25% | 15-25% | 8-15% | 3-8% | < 3% | `net_margin` |
| Margem Bruta | > 50% | 35-50% | 20-35% | 10-20% | < 10% | `gross_margin` |
| Margem Operacional | > 25% | 15-25% | 8-15% | 3-8% | < 3% | `ebit_margin` |

**Regra:** Verificar se ROE é real ou inflado por alavancagem. Se debt_equity > 2 e ROE > 20%, desconfiar — o ROIC é mais confiável nesse caso.

**ROIC (Return on Invested Capital):** Melhor indicador de rentabilidade real. Mede o retorno sobre TODO o capital empregado (equity + dívida), eliminando o efeito da alavancagem. Buffett e Greenblatt usam ROIC como filtro principal. Disponível na bolsai via `roic`.

### Critério 3: Qualidade dos Lucros — FCF & Earnings Yield (Peso 15%)

"Owner earnings é o que importa — o dinheiro real que sobra." — Buffett

| Indicador | 100 pts | 75 pts | 50 pts | 30 pts | 10 pts | Fonte |
|---|---|---|---|---|---|---|
| FCF Yield | > 10% | 5-10% | 2-5% | 0-2% | < 0% | Calculado: FCF / Market Cap |
| Earnings Yield | > 12% | 8-12% | 5-8% | 3-5% | < 3% | Calculado: 1 / P/L |

**Cálculo automático no scoring:**
- **Earnings Yield** = 100 / P/L. Calculado automaticamente quando P/L > 0. Ex: P/L 5 → EY 20% (100 pts). P/L 20 → EY 5% (55 pts). Greenblatt usa EY como um dos 2 fatores da Magic Formula.
- **FCF Yield** = não disponível via bolsai (necessitaria DFC raw). Quando ausente, o scoring usa apenas EY.
- **Impacto:** Empresas baratas (P/L baixo) agora ganham pontos reais neste critério em vez de 50 neutro. Ex: SUZB3 P/L 4.5 → EY 22.3% → 100 pts. WEGE3 P/L 31.9 → EY 3.1% → 30 pts.

**Regra:** Se a empresa reporta lucro mas FCF é negativo por 3+ anos, é red flag. Lucro contábil pode ser manipulado; caixa não.

### Critério 4: Dividendos (Peso 15%)

"Invista em empresas que pagam dividendos crescentes." — Barsi / Bazin

| Indicador | 100 pts | 85 pts | 65 pts | 40 pts | 20 pts | Fonte bolsai |
|---|---|---|---|---|---|---|
| DY TTM | > 8% | 6-8% | 4-6% | 2-4% | < 2% | `dividend_yield_ttm` (via `/dividends`) |
| Payout | 30-60% | 20-80% | — | — | > 100% | Calculado: DY × P/L |

**Regra Bazin:** DY > 6% nos últimos 12 meses. Se caiu abaixo de 6%, reavaliar.

**Regra Barsi:** Não vender nunca. Reinvestir os dividendos. Olhar o yield on cost.

**Cálculo do DY:** Usar `dividend_yield_ttm` da bolsai (endpoint `/dividends/{ticker}`) que soma todos os proventos (dividendos + JCP) dos últimos 12 meses e divide pelo preço.

**Separação Dividendo vs JCP:**
- **Dividendo** = isento de IR. O que entra na conta é líquido.
- **JCP** = 15% de IR retido na fonte. DY de 10% em JCP = 8.5% líquido.
- Na bolsai, o campo `type` em `payments` indica: `"Dividendo"` ou `"JCP"`.
- **Regra:** Ao comparar, calcular DY líquido (dividendo integral + JCP × 0.85).

### Critério 5: Endividamento e Solidez (Peso 15%)

| Indicador | 100 pts | 80 pts | 55 pts | 30 pts | 10 pts | Fonte bolsai |
|---|---|---|---|---|---|---|
| Dív.Líq / EBITDA | < 1 ou negativo | 1-2 | 2-3 | 3-4 | > 4 | `net_debt_ebitda` |
| Dív.Líq / PL | < 0.5 ou negativo | 0.5-1 | 1-2 | 2-3 | > 3 | `net_debt_equity` |
| Liquidez Corrente | > 2.0 | 1.5-2.0 | 1.0-1.5 | 0.7-1.0 | < 0.7 | `current_ratio` |

**Regra:** Dív.Líq negativa (= caixa líquido) = 100 pts automático — a empresa tem mais caixa que dívida.

**Regra SELIC:** Com SELIC > 12%, empresa com Dív/EBITDA > 4 paga juros pesados sobre a dívida. Penalizar fortemente.

### Critério 6: Crescimento (Peso 10%)

| Indicador | 100 pts | 80 pts | 55 pts | 35 pts | 10 pts | Fonte bolsai |
|---|---|---|---|---|---|---|
| CAGR Receita 5 anos | > 20% | 10-20% | 5-10% | 0-5% | < 0% | `cagr_revenue_5y` |
| CAGR Lucro 5 anos | > 25% | 15-25% | 5-15% | 0-5% | < 0% | `cagr_earnings_5y` |

**Regra:** CAGR 5 anos é o melhor indicador de crescimento sustentável. Dados da bolsai calculados automaticamente a partir dos balanços CVM. Preferir CAGR receita (mais difícil de manipular) sobre CAGR lucro.

### Bônus/Penalidade: Piotroski F-Score e Altman Z-Score

Usados como **tie-breaker** (desempate), não como fator principal. Piotroski funciona melhor para value stocks; Altman para manufatura/indústria — ambos menos precisos para bancos e tech.

| Score | Bônus | Fonte |
|---|---|---|
| Piotroski F-Score ≥ 7 | **+2 pontos** | FMP `/financial-scores` |
| Piotroski F-Score ≤ 3 | **-2 pontos** | FMP |
| Altman Z-Score > 2.99 | **+2 pontos** | FMP |
| Altman Z-Score < 1.81 | **-3 pontos** | FMP |

---

## 5. Fórmula do Score Final (0-100)

```
Score Base = (
    Valuation             × 0.20 +
    Rentabilidade         × 0.20 +
    FCF / Earnings Quality × 0.15 +
    Dividendos            × 0.15 +
    Endividamento         × 0.15 +
    Crescimento           × 0.10 +
    [remanescente 0.05 → neutro 50 pts]
)

Score Final = Score Base + Bônus Piotroski + Bônus Altman Z
             (limitado entre 0 e 100)
```

**Nota:** Os critérios qualitativos (Moat, Governança, Insiders) documentados abaixo NÃO entram no score automatizado. São avaliados manualmente na análise qualitativa (Fase 3 do processo) e influenciam a decisão final de compra, mas não o número do score.

### Classificação

| Score | Classificação | Ação |
|---|---|---|
| 80-100 | Excelente oportunidade | Comprar (alocar mais) |
| 65-79 | Bom investimento | Comprar (alocação normal) |
| 50-64 | Razoável | Watchlist — acompanhar |
| 35-49 | Cautela | Evitar ou posição mínima |
| 0-34 | Evitar | Não comprar |

### Campos disponíveis na bolsai (referência completa)

Todos retornados pelo endpoint `GET /fundamentals/{ticker}`:

| Campo | Descrição | Usado no scoring? |
|---|---|---|
| `pl` | P/L (Preço/Lucro) | Sim — Valuation |
| `pvp` | P/VP (Preço/Valor Patrimonial) | Sim — Valuation |
| `ev_ebitda` | EV/EBITDA | Sim — Valuation |
| `p_sr` | PSR (Preço/Receita) | Sim — Valuation |
| `ev_ebit` | EV/EBIT | Exibido no site |
| `p_ebitda` | Preço/EBITDA | Exibido no site |
| `p_ebit` | Preço/EBIT | Exibido no site |
| `p_assets` | Preço/Ativos | Exibido no site |
| `lpa` | Lucro por Ação | Exibido no site |
| `vpa` | Valor Patrimonial por Ação | Exibido no site |
| `roe` | Return on Equity | Sim — Rentabilidade |
| `roa` | Return on Assets | Exibido no site |
| `roic` | Return on Invested Capital | Sim — Rentabilidade |
| `net_margin` | Margem Líquida | Sim — Rentabilidade |
| `gross_margin` | Margem Bruta | Sim — Rentabilidade |
| `ebitda_margin` | Margem EBITDA | Exibido no site |
| `ebit_margin` | Margem EBIT/Operacional | Sim — Rentabilidade |
| `debt_equity` | Dívida/PL | Exibido no site |
| `net_debt_equity` | Dív.Líquida/PL | Sim — Endividamento |
| `net_debt_ebitda` | Dív.Líquida/EBITDA | Sim — Endividamento |
| `net_debt_ebit` | Dív.Líquida/EBIT | Exibido no site |
| `current_ratio` | Liquidez Corrente | Sim — Endividamento |
| `asset_turnover` | Giro do Ativo | Exibido no site |
| `ebit_over_assets` | EBIT/Ativos | Exibido no site |
| `cagr_revenue_5y` | CAGR Receita 5 anos | Sim — Crescimento |
| `cagr_earnings_5y` | CAGR Lucro 5 anos | Sim — Crescimento |
| `dividend_yield_ttm` | DY TTM (via `/dividends`) | Sim — Dividendos |

### Critérios Qualitativos (avaliação manual)

Estes critérios NÃO entram no score numérico mas são analisados na Fase 3 e podem **vetar** ou **reforçar** a decisão de compra.

**Moat (Vantagem Competitiva):**

| Tipo | Exemplos | Força |
|---|---|---|
| Marca forte | WEG, Itaú, Ambev | Alta |
| Monopólio/Concessão | Sabesp, Taesa | Muito Alta |
| Custo de troca | Totvs, bancos | Média-Alta |
| Escala/Custo baixo | Suzano, Vale | Média |
| Sem moat claro | Varejo, siderurgia | Baixa |

**Governança:** Novo Mercado (+), estatal (-), tag along, free float.

**Insiders:** FMP `/insider-trading` — diretores comprando = sinal positivo.

---

## 6. Análise de FIIs — Metodologia Específica

FIIs não são empresas. Não têm DRE, não têm ROE, não têm margem líquida. A análise de FIIs usa critérios **completamente diferentes** de ações. Esta seção documenta como analisar FIIs de forma completa.

### 6.1 Tipos de FIIs

| Tipo | Exemplos | Renda vem de | Sensibilidade à SELIC |
|---|---|---|---|
| **Papel (CRI/CRA)** | KNCR11, KNIP11, MXRF11, CPTS11 | Juros de recebíveis imobiliários | Beneficiado pela SELIC alta (renda sobe) |
| **Tijolo — Logística** | HGLG11, BTLG11, XPLG11 | Aluguel de galpões | Prejudicado pela SELIC alta (cotas caem) |
| **Tijolo — Shoppings** | XPML11, VISC11, HSML11 | Aluguel de lojas + % vendas | Prejudicado (consumo cai) |
| **Tijolo — Lajes corporativas** | HGRE11, BRCR11, PVBI11 | Aluguel de escritórios | Prejudicado |
| **Híbrido** | MXRF11, KNRI11 | Mix papel + tijolo | Intermediário |
| **FoF (Fundo de Fundos)** | SNFF11, BCFF11 | Dividendos de outros FIIs | Intermediário |
| **Agro** | RZTR11 | Arrendamento de terras | Pouco sensível à SELIC |
| **Renda Urbana** | TRXF11, RBVA11 | Contratos atípicos (lojas, agências) | Intermediário |

### 6.2 Indicadores para FIIs

#### Indicadores disponíveis via API (bolsai)

| Indicador | Endpoint bolsai | Benchmarks |
|---|---|---|
| **Dividend Yield TTM** | `GET /fiis/{ticker}` → `dividend_yield_ttm` | Papel: > 10% bom. Tijolo: > 7% bom |
| **P/VP** | `GET /fiis/{ticker}` → `pvp` | < 0.95 = desconto. 0.95-1.05 = justo. > 1.10 = prêmio |
| **VPA (Valor Patrimonial/cota)** | `GET /fiis/{ticker}` → `book_value_per_share` | Referência para P/VP |
| **NAV (Patrimônio Líquido)** | `GET /fiis/{ticker}` → `net_asset_value` | Tamanho do fundo |
| **Nº Cotistas** | `GET /fiis/{ticker}` → `total_shareholders` | > 50k = base sólida |
| **Distribuições mensais** | `GET /fiis/{ticker}/distributions` → `payments` | R$/cota, dy_month_pct |
| **Histórico mensal P/VP/DY** | `GET /fiis/{ticker}/history` | Tendência de P/VP e DY |
| **Segmento / Tipo de Gestão** | `GET /fiis/{ticker}` → `segment`, `management_type` | Classificação do fundo |

#### Indicadores NÃO disponíveis via API (só no relatório gerencial mensal)

| Indicador | O que mede | Onde encontrar | Aplicável a |
|---|---|---|---|
| **Vacância física** | % da área desocupada | Relatório gerencial (PDF na CVM/Fnet) | Tijolo |
| **Vacância financeira** | % da receita potencial não recebida | Relatório gerencial | Tijolo |
| **Cap Rate** | Renda / valor dos imóveis | Relatório gerencial ou Bianco Valuations | Tijolo |
| **WALE** | Prazo médio dos contratos (anos) | Relatório gerencial | Tijolo e Renda Urbana |
| **Inadimplência** | % dos CRIs/inquilinos inadimplentes | Relatório gerencial | Papel e Tijolo |
| **Duration / prazo médio** | Prazo médio dos CRIs | Relatório gerencial | Papel |
| **Indexador** | CDI, IPCA, IGP-M, fixo | Relatório gerencial ou site do fundo | Papel |
| **Concentração** | % em um único ativo/inquilino | Relatório gerencial | Todos |
| **Aluguel/m² médio** | Receita por metro quadrado | Relatório gerencial | Lajes e Logística |

### 6.3 Scoring de FIIs (adaptado)

Para FIIs, o scoring usa pesos diferentes de ações:

```
Score FII = (
    DY 12m                × 0.35 +
    Consistência/Tendência × 0.20 +
    P/VP                   × 0.20 +
    Liquidez (volume)      × 0.10 +
    Tipo vs Cenário Macro  × 0.15
)
```

| Componente | Score 100 | Score 65 | Score 30 |
|---|---|---|---|
| DY 12m (papel) | > 12% | 8-12% | < 6% |
| DY 12m (tijolo) | > 8% | 6-8% | < 4% |
| Consistência | > 5 anos + crescente | 3-5 anos + estável | < 3 anos ou declinante |
| P/VP | < 0.95 (desconto) | 0.95-1.10 (justo) | > 1.15 (prêmio) |
| Volume | > 100k/dia | 30-100k/dia | < 10k/dia |
| Tipo vs Macro | Papel com SELIC > 12% | Híbrido | Tijolo com SELIC > 12% |

### 6.4 Regras de decisão para FIIs

**SELIC > 12% (cenário atual):**
- Priorizar **papel** (CDI+, IPCA+)
- Evitar tijolo (cotas tendem a cair)
- FIIs de papel pagam DY > CDI líquido = melhor que CDB

**SELIC entre 8-12%:**
- Mix papel + tijolo
- Começar a posicionar em tijolo de qualidade (HGLG11, BTLG11)

**SELIC < 8%:**
- Priorizar **tijolo** (cotas se valorizam, DY nominal cai mas ganho de capital compensa)
- Papel paga menos, migrar gradualmente

**Red flags de FIIs:**
1. DY > 18% sustentado — pode ser insustentável ou amortização de capital (não é rendimento real)
2. P/VP > 1.20 — pagando 20% acima do patrimônio
3. Volume < 5.000/dia — liquidez perigosa, spread alto
4. Vacância > 20% (tijolo) — muita área vazia
5. Concentração > 50% em um único ativo — risco concentrado
6. Gestora desconhecida — preferir Kinea, Patria, XP, BTG, Vinci, RBR, Capitânia

### 6.5 APIs para Dados de FIIs

| Fonte | O que fornece | Tipo | Custo |
|---|---|---|---|
| **bolsai** (`usebolsai.com`) | P/VP, DY TTM, NAV, cotistas, distribuições mensais, histórico | API Pro | R$ 29/mês (já contratada) |
| **brapi.dev** | Cotação em tempo real, volume | API Premium | Já contratada |
| **Funds Explorer** | Vacância, cap rate, relatórios gerenciais | Site (sem API) | Gratuito |
| **CVM/Fnet** | Relatórios gerenciais oficiais (PDF) | Site governo | Gratuito |

**Nota:** Vacância, cap rate e inadimplência NÃO estão disponíveis via API. Existem apenas nos relatórios gerenciais mensais (PDFs na CVM).

---

## 7. Análise de ETFs — Metodologia Específica

ETFs são fundos passivos que replicam índices. Não têm ROE, margem, ou P/L próprios. A análise é sobre **o produto** (custo, eficiência, exposição), não sobre a "empresa".

### 7.1 Critérios de Avaliação de ETFs

| Critério | O que mede | Importância | Fonte |
|---|---|---|---|
| **Taxa de administração** | Custo anual (expense ratio) | Alta — corrói retorno composto | FMP `/etf/info` |
| **Índice replicado** | Qual mercado/setor acompanha | Alta — define a exposição | Prospecto |
| **Preço unitário** | Acessibilidade para o budget | Alta para portfolios pequenos | brapi / FMP |
| **Volume/Liquidez** | Facilidade de compra/venda, spread | Média-alta | brapi |
| **Tracking error** | Quanto desvia do índice | Média | Não disponível via API |
| **Patrimônio (AUM)** | Tamanho do fundo | Média — fundo pequeno pode fechar | FMP `/etf/info` |
| **Nº de holdings** | Diversificação interna | Média | FMP `/etf/info` |
| **Composição** | Quais empresas/setores estão dentro | Informativo | FMP `/etf/holdings`, `/etf/sector-weightings` |
| **Exposição cambial** | Se embute variação do dólar | Informativo | Estrutura do fundo |

### 7.2 Comparação real dos ETFs analisados

**ETFs BR (negociados na B3 em reais):**

| Ticker | Índice | Preço | Volume/dia | Exposição |
|---|---|---|---|---|
| **NASD11** | Nasdaq 100 | R$ 18.32 | 1,3M | Tech US (Apple, Nvidia, Google) |
| **IVVB11** | S&P 500 | R$ 395.85 | 77k | 500 maiores US |
| **HASH11** | Crypto | R$ 49.74 | 270k | Bitcoin, Ethereum |
| BOVA11 | Ibovespa | R$ 193.05 | 5,8M | Mercado BR |
| SMAL11 | Small Caps BR | R$ 122.41 | 2,3M | Small caps BR |
| DIVO11 | Dividendos BR | R$ 140.20 | 53k | Ações de dividendos BR |
| XFIX11 | IFIX (FIIs) | R$ 13.80 | 14k | Índice de FIIs |

**ETFs US (dados FMP):**

| Ticker | Índice | Preço | Taxa | Holdings | Exposição |
|---|---|---|---|---|---|
| **VOO** | S&P 500 | $644.86 | 0.03% | 505 | 500 maiores US |
| **VTI** | Total Market US | $346.03 | 0.03% | 3.598 | TODO o mercado US |
| SPY | S&P 500 | $701.66 | 0.09% | 504 | = VOO mas mais caro |
| QQQ | Nasdaq 100 | $640.47 | 0.18% | 102 | = NASD11 mas em dólar |
| **SCHD** | Dividendos US | $30.81 | 0.06% | 104 | Blue chips de dividendos |
| **VT** | Total World | $148.79 | 0.06% | 9.773 | MUNDO INTEIRO |
| VXUS | Internacional ex-US | $82.63 | 0.05% | 8.602 | Mundo sem EUA |
| VEA | Desenvolvidos ex-US | $68.63 | 0.03% | 3.873 | Europa, Japão, Austrália |
| VWO | Emergentes | $58.21 | 0.06% | 5.942 | China, Índia, Brasil |

### 7.3 Por que escolhi NASD11

| Critério | NASD11 | IVVB11 | HASH11 |
|---|---|---|---|
| Preço | R$ 18.32 | R$ 395.85 | R$ 49.74 |
| Cotas com R$ 1.005 | **54 cotas** | 2 cotas | 20 cotas |
| Desperdício do budget | R$ 16 | R$ 213 | R$ 10 |
| Volume/dia | 1,3M (excelente) | 77k (bom) | 270k (bom) |
| Exposição | Tech global | S&P 500 amplo | Cripto (volátil) |
| Risco | Moderado | Moderado | **Alto** (perfil incompatível) |

NASD11 venceu por **acessibilidade** (54 cotas vs 2) e **liquidez** (1,3M/dia é o mais líquido dos 3). O IVVB11 é mais diversificado (500 empresas vs 100), mas a R$ 395.85 só cabem 2 cotas no budget — precisão de alocação ruim.

### 7.4 Para portfolios maiores: comprar direto nos EUA

Com R$ 6.700, ETFs BR fazem sentido pela praticidade. Mas com capital maior (R$ 50k+), comprar direto nos EUA via conta internacional da XP é mais vantajoso:

| Fator | ETF BR (IVVB11) | ETF US direto (VOO) |
|---|---|---|
| Taxa do ETF | ~0.23% | 0.03% |
| Spread cambial | Embutido (opaco) | Visível (você controla) |
| Dividendos | Reinvestidos automaticamente | Pagos em dólares (30% IR retido) |
| Imposto de herança | Não | Sim (estate tax US acima de $60k) |
| Simplicidade | Compra na B3 como ação | Precisa de conta internacional |

### 7.5 Regras para seleção de ETFs

1. **Taxa de administração:** preferir < 0.10% (US) ou < 0.30% (BR)
2. **Volume:** mínimo 50.000/dia para ETFs BR
3. **Preço unitário:** deve permitir comprar pelo menos 10 cotas no budget alocado
4. **Não duplicar exposição:** IVVB11 + VOO é redundante (ambos S&P 500)
5. **Cripto (HASH11):** somente para perfil arrojado, máximo 5% do portfolio
6. **ETFs de índice BR (BOVA11, SMAL11):** normalmente não faz sentido se já tem ações BR individuais na carteira

---

## 8. Regras de Alocação (para R$ 6.700)

### Estrutura aprovada

| Categoria | % | Valor | Racional |
|---|---|---|---|
| Crescimento | 35% | R$ 2.345 | Maior fatia = horizonte longo, maior potencial de valorização |
| Dividendos | 20% | R$ 1.340 | Renda passiva desde o dia 1, reinvestir os dividendos |
| FIIs | 20% | R$ 1.340 | Renda mensal isenta de IR, diversificação imobiliária |
| ETF Internacional | 15% | R$ 1.005 | Proteção cambial, diversificação geográfica |
| Reserva (Renda Fixa) | 10% | R$ 670 | Liquidez, SELIC alta rende bem, colchão de segurança |

### Regras de seleção dentro de cada categoria

1. **Máximo 2-3 ativos por categoria** (com R$ 6.700, diversificar demais dilui posições)
2. **Score mínimo para compra:** 60 para crescimento, 70 para dividendos
3. **Priorizar preço unitário acessível** (melhor 50 ações de R$ 40 do que 1 de R$ 2.000)
4. **Nunca mais de 25% em um único ativo** do total do portfolio
5. **Não comprar duas empresas do mesmo setor** na mesma categoria

### Regras de FIIs (com SELIC alta > 12%)

- Preferir FIIs de **papel** (CRI/CRA) — se beneficiam do CDI alto
- FIIs de **tijolo** (shoppings, galpões) só quando SELIC < 10%
- DY mínimo: 8% para papel, 7% para tijolo
- Preferir preço unitário baixo (mais cotas = mais diversificação)

### Regras de ETF Internacional

- Preferir ETFs na **B3** (IVVB11, NASD11) por praticidade
- Priorizar preço unitário acessível para encaixar no budget
- Não alocar em cripto (HASH11) com perfil moderado

---

## 9. Regras de Cenário Macro

A análise deve considerar o cenário macroeconômico:

### SELIC alta (> 12%)
- Renda fixa rende bem → reserva mínima obrigatória de 10%
- FIIs de papel se beneficiam, tijolo sofre
- Bancos se beneficiam (spread maior)
- Varejo e construção civil sofrem (crédito caro)
- Empresas alavancadas sofrem (juros da dívida sobem)

### SELIC baixa (< 8%)
- Renda fixa rende pouco → reduzir reserva para 5%
- FIIs de tijolo se valorizam, papel paga menos
- Varejo e construção se recuperam
- Growth stocks se valorizam (múltiplos expandem)

### Dólar alto (> R$ 5.00)
- Exportadoras se beneficiam (Suzano, Vale, Petrobras, celulose, minério)
- Importadoras sofrem
- ETFs internacionais ficam "caros" em reais

### Inflação alta (> 5%)
- Preferir empresas com poder de repasse (utilities, bancos, seguros)
- FIIs de papel indexados ao IPCA pagam mais
- Evitar empresas com margens apertadas

---

## 10. Processo de Análise (Passo a Passo)

### Fase 1: Coleta (automatizada)
1. Puxar fundamentos de ações BR via **bolsai** `/fundamentals/{ticker}` (27 indicadores CVM)
2. Puxar dividendos via **bolsai** `/dividends/{ticker}` (DY TTM + JCP split)
3. Puxar cotação em tempo real via **brapi** `/quote/{ticker}`
4. Puxar FIIs via **bolsai** `/fiis/{ticker}` + `/fiis/{ticker}/distributions`
5. Puxar dados US via **FMP** (profile + ratios + DCF + scores)
6. Puxar macro via **bolsai** `/macro/selic_target`, `/macro/ipca`, `/macro/usd_brl`

### Fase 2: Screening quantitativo
7. Calcular score de cada dimensão (6 critérios: val/prof/fcf/div/debt/growth)
8. Aplicar bônus Piotroski/Altman Z
9. Ranquear por score final
10. Usar **bolsai screener** (`GET /screener?roe_gt=10&pl_lt=15`) para descobrir ativos adicionais

### Fase 3: Análise qualitativa
7. Avaliar moat de cada empresa (Critério 8)
8. Verificar governança (Novo Mercado, estatal, etc.)
9. Ler últimos resultados trimestrais dos top picks
10. Checar se há evento extraordinário (M&A, reestruturação, crise)

### Fase 4: Montagem da carteira
11. Selecionar top 1-3 por categoria com score > mínimo
12. Calcular quantidade de ações dentro do budget
13. Verificar que nenhum ativo > 25% do total
14. Documentar "por que sim" e "por que não" de cada ativo

### Fase 5: Monitoramento (pós-compra)
15. Reavaliar trimestralmente (quando saem resultados)
16. Recalcular score com novos dados
17. Se score cair abaixo de 40, considerar venda
18. Se DY cair abaixo de 4% (para ações de dividendo), reavaliar
19. Reinvestir dividendos seguindo a mesma metodologia

---

## 11. Red Flags — Nunca Comprar Se

1. Prejuízo líquido nos últimos 3 anos consecutivos
2. FCF negativo nos últimos 3 anos consecutivos
3. Dív. Líquida / EBITDA > 5
4. ROE negativo (exceto se empresa em turnaround claro com catalisador)
5. Payout > 100% (pagando mais dividendo do que lucra)
6. Insiders vendendo massivamente nos últimos 3 meses
7. Altman Z-Score < 1.0 (risco alto de falência)
8. Empresa envolvida em fraude contábil recente
9. Free float < 10% (liquidez perigosa)
10. Governança: sem tag along para minoritários

---

## 12. Glossário Rápido

| Termo | Significado |
|---|---|
| P/L | Preço / Lucro por ação. Quantos anos de lucro para pagar o preço |
| P/VP | Preço / Valor Patrimonial. Quanto o mercado paga pelo patrimônio |
| EV/EBITDA | Enterprise Value / EBITDA. Valuation que inclui dívida |
| ROE | Return on Equity. Lucro / Patrimônio Líquido |
| ROIC | Return on Invested Capital. Retorno sobre todo capital empregado |
| FCF | Free Cash Flow. Caixa operacional - Capex |
| DY | Dividend Yield. Dividendo anual / Preço |
| Payout | % do lucro distribuído como dividendo |
| Moat | Vantagem competitiva durável (Buffett) |
| F-Score | Piotroski: score 0-9 de saúde financeira |
| Z-Score | Altman: preditor de falência (> 2.99 = seguro) |
| DCF | Discounted Cash Flow: valor intrínseco |
| CAGR | Compound Annual Growth Rate: crescimento anualizado |
| TTM | Trailing Twelve Months: últimos 12 meses |
