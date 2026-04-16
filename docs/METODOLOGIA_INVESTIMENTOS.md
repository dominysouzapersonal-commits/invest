# Metodologia de Análise de Investimentos — InvestAnalytics

> Documento de referência permanente. Seguir este padrão em toda análise futura.
> Última atualização: 17 de abril de 2026

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

| Fonte | Tipo | O que fornece |
|---|---|---|
| **brapi.dev (Premium)** | API paga | Cotações BR em tempo real, fundamentalistas desde 2009, DRE, balanço, fluxo de caixa, dividendos históricos, SELIC, IPCA, câmbio |
| **FMP (Financial Modeling Prep)** | API paga | DCF, Piotroski F-Score, Altman Z-Score, insider trades, consenso de analistas, price targets, ETF holdings, receita por segmento |

Nunca usar dados de uma única fonte. Cruzar brapi (melhor para BR) com FMP (melhor para US e scores avançados).

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

## 4. Os 10 Critérios de Análise

### Critério 1: Valuation (Peso 20%)

"Nunca pagar caro, mesmo por uma empresa boa." — Graham

| Indicador | Ideal | Bom | Ruim | Fonte | Quando usar |
|---|---|---|---|---|---|
| P/L (Preço/Lucro) | < 12 | 12-20 | > 30 | brapi/FMP | Sempre (exceto prejuízo) |
| P/VP (Preço/Valor Patrimonial) | < 1.5 | 1.5-3 | > 5 | brapi/FMP | Sempre |
| EV/EBITDA | < 7 | 7-12 | > 18 | brapi/FMP | Sempre (melhor que P/L para endividadas) |
| EV/Revenue (EV/Receita) | < 2 | 2-5 | > 8 | brapi/FMP | Para empresas em prejuízo ou margens baixas (techs, growth) |
| P/FCF (Preço/Free Cash Flow) | < 12 | 12-20 | > 30 | FMP | Sempre que FCF disponível |
| PEG Ratio | < 1 | 1-2 | > 3 | brapi/FMP | Para growth stocks (P/L ajustado pelo crescimento) |

**Regras:**
- P/L negativo = empresa com prejuízo = penalidade máxima.
- Se P/L não disponível (prejuízo), usar EV/Revenue como substituto.
- EV/EBITDA é mais confiável que P/L porque inclui dívida e ignora estrutura de capital.

### Critério 2: Rentabilidade (Peso 20%)

"Procure empresas com ROE consistentemente acima de 15%." — Buffett

| Indicador | Ideal | Bom | Ruim | Referência |
|---|---|---|---|---|
| ROE | > 20% | 12-20% | < 8% | Buffett: >15% sustentado |
| ROA | > 10% | 5-10% | < 3% | Eficiência do ativo total |
| ROIC | > 15% | 8-15% | < 5% | Retorno sobre capital investido |
| Margem Líquida | > 20% | 10-20% | < 5% | Quanto sobra de lucro |
| Margem Bruta | > 40% | 25-40% | < 15% | Poder de precificação |
| Margem Operacional | > 20% | 10-20% | < 5% | Eficiência operacional |

**Regra:** Verificar se o ROE é "real" ou inflado por alavancagem. Se debt/equity > 200% e ROE > 20%, desconfiar.

### Critério 3: Geração de Caixa — FCF (Peso 15%)

"Owner earnings é o que importa — o dinheiro real que sobra." — Buffett

| Indicador | O que mede | Ideal |
|---|---|---|
| FCF (Free Cash Flow) | Caixa gerado após capex | Positivo e crescente por 5 anos |
| FCF Yield | FCF / Market Cap | > 5% |
| FCF/Lucro Líquido | Qualidade do lucro | > 80% (lucro é caixa, não contábil) |
| Capex/Receita | Intensidade de capital | < 15% (empresa leve) |

**Regra:** Se a empresa reporta lucro mas FCF é negativo por 3+ anos, é red flag. Lucro contábil pode ser manipulado; caixa não.

### Critério 4: Dividendos (Peso 15%)

"Invista em empresas que pagam dividendos crescentes." — Barsi / Bazin

| Indicador | Ideal | Bom | Ruim |
|---|---|---|---|
| Dividend Yield (12 meses) | > 6% | 3-6% | < 2% |
| Payout Ratio | 30-60% | 20-80% | > 100% |
| Consistência (anos pagando) | > 10 anos | 5-10 anos | < 3 anos |
| Crescimento do dividendo | Crescente 5 anos | Estável | Decrescente |

**Regra Bazin:** DY > 6% nos últimos 12 meses. Se caiu abaixo de 6%, reavaliar.

**Regra Barsi:** Não vender nunca. Reinvestir os dividendos. Olhar o yield on cost (DY sobre o preço que você pagou, não o preço atual).

**Cálculo do DY:** Somar todos os dividendos e JCP pagos nos últimos 12 meses, dividir pelo preço atual. Usar dados reais da brapi (dividendsData.cashDividends).

**Separação Dividendo vs JCP:**
- **Dividendo** = isento de IR para pessoa física. O que entra na conta é líquido.
- **JCP (Juros sobre Capital Próprio)** = 15% de IR retido na fonte. DY de 10% em JCP = 8.5% líquido.
- Na brapi, o campo `label` em `cashDividends` indica: "DIVIDENDO" ou "JCP".
- **Regra:** Ao comparar DY entre empresas, calcular o **DY líquido** (dividendo integral + JCP × 0.85). Preferir empresas que pagam mais em dividendo do que JCP.

### Critério 5: Endividamento e Solidez (Peso 10%)

| Indicador | Ideal | Bom | Perigoso |
|---|---|---|---|
| Dív. Líquida / EBITDA | < 1.5 | 1.5-3 | > 4 |
| Dív. Líquida / PL | < 0.5 | 0.5-1.5 | > 2.5 |
| Liquidez Corrente | > 2.0 | 1.2-2.0 | < 0.8 |
| Cobertura de Juros | > 8x | 3-8x | < 1.5x |
| **FCF / Dív. Total** | > 25% | 15-25% | < 10% |

**Regra:** Empresa com Dív/EBITDA > 4 em cenário de SELIC alta (> 12%) é risco real de stress financeiro. Aplicar penalidade forte.

**FCF / Dívida Total:** Indica quantos anos a empresa leva para quitar toda a dívida com caixa livre. FCF/Dív > 25% = quita em ~4 anos. FCF/Dív < 10% = levaria 10+ anos = perigoso. Este indicador diferencia empresas com dívida alta mas que geram caixa (aceitável) de empresas com dívida alta e caixa fraco (perigoso).

### Critério 6: Crescimento (Peso 10%)

| Indicador | Ideal | Bom | Ruim |
|---|---|---|---|
| Crescimento Receita 1a | > 15% | 5-15% | < -5% |
| Crescimento Receita 5a (CAGR) | > 10% | 3-10% | < 0% |
| Crescimento Lucro 1a | > 20% | 5-20% | < -10% |
| Crescimento FCF 1a | > 15% | 0-15% | < 0% |

**Regra:** Crescimento passado não garante futuro, mas é o melhor preditor disponível. Preferir crescimento de receita (mais difícil de manipular) sobre crescimento de lucro.

### Critério 7: Consistência Histórica (Peso 5%)

"Prefiro uma empresa com ROE de 15% por 10 anos do que uma com ROE de 40% por 1 ano." — Buffett

| Verificação | Como medir | Fonte |
|---|---|---|
| Receita crescente 5 anos? | Comparar DRE anual 5 anos | brapi incomeStatementHistory |
| Lucro líquido positivo 5 anos? | Sem prejuízo nos últimos 5 anos | brapi incomeStatementHistory |
| FCF positivo 5 anos? | Fluxo de caixa livre positivo | brapi cashflowHistory |
| Dividendo pago 5 anos? | Histórico de dividendos | brapi dividendsData |
| ROE > 10% por 5 anos? | Financials históricos | brapi financialDataHistory |

**Scoring de consistência:**
- 5/5 anos positivos = 100 pontos
- 4/5 = 80
- 3/5 = 55
- 2/5 = 30
- 0-1/5 = 10

### Critério 8: Moat — Vantagem Competitiva (Peso 5%)

Qualitativo. Classificar manualmente:

| Tipo de Moat | Exemplos | Score |
|---|---|---|
| **Marca forte** | WEG, Itaú, Ambev | Alto |
| **Monopólio/Concessão** | Sabesp, Taesa, rodovias | Alto |
| **Efeito de rede** | B3 (bolsa), bancos | Alto |
| **Custo de troca alto** | Totvs (ERP), bancos | Médio-alto |
| **Escala/Custo baixo** | Suzano, Vale | Médio |
| **Regulatório** | Utilities, telecom | Médio |
| **Sem moat claro** | Varejo, siderurgia | Baixo |

**Regra:** Sem moat = precisa ser MUITO barata para justificar. Com moat forte = aceitar pagar um pouco mais.

### Critério 9: Governança Corporativa (Bônus/Penalidade)

| Fator | Bônus | Penalidade |
|---|---|---|
| Novo Mercado (B3) | +3 pontos | — |
| Tag along 100% | +2 pontos | — |
| Estatal (governo controlador) | — | -5 pontos |
| Controlador com > 70% | — | -2 pontos |
| Free float < 20% | — | -3 pontos |
| Histórico de fraude/escândalo | — | -10 pontos |

### Critério 10: Insider Activity e Consenso (Bônus/Penalidade)

| Sinal | Bônus | Penalidade |
|---|---|---|
| Insiders comprando (últimos 3 meses) | +3 pontos | — |
| Insiders vendendo significativamente | — | -3 pontos |
| Consenso analistas: Strong Buy | +2 pontos | — |
| Consenso analistas: Sell | — | -3 pontos |
| Piotroski F-Score ≥ 7 | +4 pontos | — |
| Piotroski F-Score ≤ 3 | — | -3 pontos |
| Altman Z-Score > 2.99 | +3 pontos | — |
| Altman Z-Score < 1.81 | — | -4 pontos |

---

## 5. Fórmula do Score Final (0-100)

```
Score Base = (
    Valuation      × 0.20 +
    Rentabilidade  × 0.20 +
    FCF            × 0.15 +
    Dividendos     × 0.15 +
    Endividamento  × 0.10 +
    Crescimento    × 0.10 +
    Consistência   × 0.05 +
    Moat           × 0.05
)

Score Final = Score Base + Bônus Governança + Bônus Insider/Scores
             (limitado entre 0 e 100)
```

### Classificação

| Score | Classificação | Ação |
|---|---|---|
| 80-100 | Excelente oportunidade | Comprar (alocar mais) |
| 65-79 | Bom investimento | Comprar (alocação normal) |
| 50-64 | Neutro | Watchlist — acompanhar |
| 35-49 | Cautela | Evitar ou posição mínima |
| 0-34 | Evitar | Não comprar |

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

#### Indicadores disponíveis via API (brapi)

| Indicador | Como obter | Benchmarks |
|---|---|---|
| **Dividend Yield 12m** | Somar cashDividends dos últimos 12 meses / preço | Papel: > 10% bom. Tijolo: > 7% bom |
| **P/VP** | defaultKeyStatistics.priceToBook | < 0.95 = desconto. 0.95-1.05 = justo. > 1.10 = prêmio |
| **Valor Patrimonial/cota** | defaultKeyStatistics.bookValue | Referência para P/VP |
| **Dividendo mensal médio** | Total 12m / 12 | Estabilidade mês a mês |
| **Consistência de pagamento** | Contar anos pagando (2019+) | > 5 anos = consistente |
| **Tendência do dividendo** | Comparar 1a metade vs 2a metade do histórico | Crescente = bom |
| **Volume diário** | regularMarketVolume | > 50.000 = liquidez OK |
| **52 semanas alta/baixa** | fiftyTwoWeekHigh/Low | Proximidade da mínima = oportunidade |

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
| **brapi.dev** | Cotação, P/VP, dividendos históricos, book value | API | Já contratada (Premium) |
| **Dados de Mercado** (dadosdemercado.com.br) | Lista de FIIs, dividendos, setor, CNPJ | API REST | Pago (tem free tier) |
| **Funds Explorer** (fundsexplorer.com.br) | Vacância, DY, P/VP, cap rate, relatórios | Site (sem API oficial) | Gratuito (web) |
| **Status Invest** (statusinvest.com.br) | Indicadores completos, histórico | Site (sem API oficial) | Gratuito (web) |
| **Bianco Valuations** (biancovaluations.com) | Screening 400+ FIIs, vacância, cap rate, valuation (DDM, Bazin) | Site | Pago |
| **BrFiis** (brfiis.com.br) | Relatórios gerenciais, documentos CVM | Site | Gratuito |
| **CVM/Fnet** (fnet.bmfbovespa.com.br) | Relatórios gerenciais oficiais (PDF) | Site governo | Gratuito |

**Nota:** Nenhuma API pública fornece vacância, cap rate ou inadimplência programaticamente. Esses dados existem apenas nos relatórios gerenciais mensais (PDFs) ou em plataformas pagas como Bianco Valuations. Para integração futura, seria necessário:
- Scraping de Funds Explorer ou Status Invest (frágil, pode quebrar)
- Assinatura do Bianco Valuations (se tiver API)
- Parser de PDFs dos relatórios gerenciais via CVM/Fnet (complexo)

---

## 7. Regras de Alocação (para R$ 6.700)

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

## 8. Regras de Cenário Macro

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

## 9. Processo de Análise (Passo a Passo)

### Fase 1: Coleta (automatizada)
1. Puxar cotações e fundamentalistas via brapi (batch 20)
2. Puxar dados complementares via FMP (scores, DCF, insiders)
3. Puxar macro: SELIC, IPCA, câmbio

### Fase 2: Screening quantitativo
4. Calcular score de cada dimensão (Critérios 1-7)
5. Aplicar bônus/penalidades (Critérios 9-10)
6. Ranquear por score final

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

## 10. Red Flags — Nunca Comprar Se

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

## 11. Glossário Rápido

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
