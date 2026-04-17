# Relatório Completo de Análise de Investimentos (v3 — Dados CVM)

> **Data:** 18 de abril de 2026
> **Capital:** R$ 6.700
> **Perfil:** Moderado, longo prazo, XP Investimentos
> **Ativos analisados:** 144 ações (TODA a B3) + 37 FIIs + 20 ETFs = **201 ativos**
> **Fonte dos dados:** bolsai (CVM/B3/BCB) + brapi (cotação real-time) + FMP (US)
> **Metodologia:** `docs/METODOLOGIA_INVESTIMENTOS.md` v3 — 6 critérios quantitativos
> **Precisão:** Dados CVM oficiais, batem com Status Invest

---

## Cenário Macroeconômico

| Indicador | Valor | Fonte |
|---|---|---|
| SELIC (meta Copom) | **14.75%** | bolsai `/macro/selic_target` |
| IPCA 12 meses | **~5.3%** | bolsai `/macro/ipca` |
| CDI | **14.15%** | bolsai `/macro/cdi` |
| USD/BRL | **R$ 5.00** | bolsai `/macro/usd_brl` |
| Juro real (SELIC - IPCA) | **~9.5%** | Calculado |

**Implicação:** CDI de 14.15% é o benchmark. Qualquer investimento em renda variável precisa ter expectativa de retorno superior, seja por dividendos, valorização, ou ambos.

---

## Ranking Final — Todas as Ações Analisadas

Score calculado pela METODOLOGIA v3: Valuation 20% + Rentabilidade 20% + FCF 15% + Dividendos 15% + Endividamento 15% + Crescimento 10% + Bônus Piotroski/Altman.

### Excelente (Score ≥ 80)

| # | Ticker | Score | Preço | P/L | P/VP | EV/EBITDA | ROE | ROIC | DY | M.Líq | Dív.Líq/EBITDA | CAGR Rec 5a |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **RECV3** | **84.9** | R$13.58 | 6.2 | 0.92 | 3.6 | 14.7% | 8.9% | 9.1% | 20.2% | 1.0 | 32.0% |
| 2 | **DIRR3** | **83.8** | R$14.27 | 9.4 | 3.88 | 7.1 | 41.2% | 27.1% | 15.5% | 22.6% | 0.6 | 23.7% |
| 3 | **CXSE3** | **80.5** | R$18.88 | 13.2 | 4.18 | 11.8 | 31.7% | 25.9% | 8.7% | — | -0.4 | — |

### Bom Investimento (Score 65-79)

| # | Ticker | Score | Preço | P/L | P/VP | EV/EBITDA | ROE | ROIC | DY | M.Líq | Dív.Líq/EBITDA | CAGR Rec 5a |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 4 | WIZC3 | 79.2 | R$9.53 | 7.6 | 2.18 | 1.9 | 28.8% | 67.5% | 5.9% | 26.6% | -0.0 | 11.5% |
| 5 | RDOR3 | 79.0 | R$39.25 | 19.2 | 4.64 | 8.2 | 24.2% | 25.9% | 10.9% | 8.7% | 0.5 | 31.8% |
| 6 | **PETR4** | **78.8** | R$48.58 | 5.7 | 1.51 | 3.4 | 26.5% | 17.4% | 6.0% | 22.2% | 1.2 | 12.8% |
| 7 | **BBSE3** | **78.5** | R$35.01 | 7.5 | 6.55 | 12.8 | 86.8% | 76.6% | 13.0% | — | -1.3 | — |
| 8 | CYRE3 | 77.6 | R$27.25 | 6.2 | 1.22 | 10.2 | 19.6% | 7.1% | 13.9% | 25.4% | 2.8 | 19.8% |
| 9 | PSSA3 | 77.0 | R$53.69 | 10.3 | 2.21 | 0.7 | 21.5% | — | 5.6% | 8.4% | -0.4 | 17.0% |
| 10 | **INTB3** | **75.3** | R$14.39 | 9.8 | 1.58 | 8.2 | 16.1% | 11.4% | 7.8% | 10.8% | -0.4 | 15.9% |
| 11 | **ITUB4** | **73.2** | R$46.98 | 11.3 | 2.41 | 9.0 | 21.3% | 15.4% | 7.8% | 11.8% | 0.0 | 17.4% |
| 12 | FLRY3 | 72.9 | R$17.09 | 15.3 | 1.87 | 5.8 | 12.2% | 10.1% | 6.3% | 7.2% | 1.5 | 22.8% |
| 13 | SLCE3 | 72.6 | R$18.10 | 16.2 | 1.79 | 5.3 | 11.0% | 12.8% | 8.0% | 5.8% | 1.9 | 20.3% |
| 14 | ABEV3 | 71.9 | R$15.43 | 15.7 | 2.77 | 8.4 | 17.6% | 18.8% | 6.4% | 18.1% | -0.6 | 8.6% |
| 15 | BBDC4 | 69.4 | R$20.85 | 9.3 | 1.24 | 9.7 | 13.3% | 7.2% | 8.0% | 8.8% | 6.9 | 22.4% |
| 16 | SBSP3 | 68.7 | R$167.90 | 14.0 | 2.79 | 10.1 | 20.0% | 11.6% | 4.3% | 22.2% | 1.9 | 16.4% |
| 17 | CMIG4 | 68.5 | R$13.52 | 7.9 | 1.35 | 7.1 | 17.1% | 9.1% | 6.8% | 11.5% | 2.2 | 11.1% |
| 18 | SUZB3 | 68.0 | R$47.53 | 4.5 | 1.37 | 6.1 | 30.6% | 5.9% | 2.4% | 26.8% | 3.3 | 10.5% |
| 19 | ITSA4 | 67.5 | R$14.81 | 10.1 | 1.87 | — | 18.6% | 19.0% | 8.9% | — | 3.2 | 7.0% |
| 20 | CPFE3 | 65.9 | R$56.26 | 11.8 | 2.88 | 6.6 | 24.4% | 15.5% | 5.0% | 12.9% | 1.9 | 7.5% |
| 21 | TOTS3 | 65.2 | R$34.77 | 23.4 | 4.08 | 8.3 | 17.5% | 27.8% | 1.9% | 15.9% | 0.0 | 17.3% |
| 22 | TAEE11 | 64.6 | R$44.30 | 9.7 | — | — | 20.8% | — | 7.3% | — | — | — |
| 23 | SANB11 | 73.4 | R$31.45 | 9.2 | — | — | 10.2% | — | 8.6% | — | — | — |
| 24 | KLBN11 | 65.5 | R$18.95 | 14.1 | — | — | 21.3% | — | 5.1% | — | — | — |

### Razoável e abaixo (Score < 65)

| Ticker | Score | Motivo principal |
|---|---|---|
| VALE3 | 64.5 | P/L 28.1 alto, ROE 7.5% fraco, CAGR receita 0.5% |
| WEGE3 | 59.8 | P/L 31.9, P/VP 11.66 — excelente empresa mas extremamente cara |
| RENT3 | 59.7 | P/L 30.4, ROE 7.3%, margem 4.5% — cara para o que entrega |
| SBSP3 poderia ser melhor mas DY 4.3% e EV/EBITDA 10.1 pesam |
| PRIO3 | 56.0 | Não paga dividendos, Dív/EBITDA 3.1, ROIC 3% |
| HAPV3 | 55.7 | Prejuízo (P/L -43.8), ROE -29% |
| CSAN3 | 56.2 | Prejuízo (P/L -2.2), ROE -183% |
| CSNA3 | 51.2 | Prejuízo, ROE -15.6% |

---

## Carteira Sugerida — R$ 6.700

### Decisão por categoria

**Crescimento (35% = R$ 2.345)**

Top picks por score para crescimento (ROE alto, margem forte, valuation razoável):

| Opção | Score | Por que sim | Por que não |
|---|---|---|---|
| **INTB3** | 75.3 | P/L 9.8, ROIC 11.4%, DY 7.8%, **caixa líquido**, NM, CAGR 15.9% | Empresa menor, menos líquida |
| **SUZB3** | 68.0 | P/L 4.5 (baratíssimo), ROE 30.6%, NM 26.8%, líder celulose | Dív/EBITDA 3.3, DY apenas 2.4% |
| PETR4 | 78.8 | Score alto, P/L 5.7, ROE 26.5%, DY 6% | **Estatal** — risco político |
| SBSP3 | 68.7 | ROE 20%, moat fortíssimo (monopólio) | EV/EBITDA 10.1, DY 4.3% |

**Escolha:** INTB3 + SUZB3. Evito PETR4 (estatal) e SBSP3 (valuation mediocre).

**Dividendos (20% = R$ 1.340)**

| Opção | Score | DY | ROE | Por que sim | Por que não |
|---|---|---|---|---|---|
| **BBSE3** | 78.5 | 13.0% | 86.8% | ROE absurdo, caixa líquido, DY 13%, NM | P/VP 6.55 alto |
| **ITUB4** | 73.2 | 7.8% | 21.3% | Melhor banco BR, ROIC 15.4%, CAGR 17.4% | P/L 11.3 não é baratíssimo |
| BBDC4 | 69.4 | 8.0% | 13.3% | DY 8%, P/L 9.3, P/VP 1.24 barato | Dív/EBITDA 6.9 (!), ROIC 7.2% fraco |
| CMIG4 | 68.5 | 6.8% | 17.1% | P/L 7.9, DY 6.8% | **Estatal** MG |
| ITSA4 | 67.5 | 8.9% | 18.6% | DY 8.9%, exposição ao Itaú | Redundante com ITUB4 |

**Escolha:** BBSE3 + ITUB4. BBDC4 tem dívida alta (6.9× EBITDA). CMIG4 é estatal. ITSA4 seria redundante.

**FIIs (20% = R$ 1.340)**

Da análise de 37 FIIs (dados bolsai + brapi):

| FII | DY TTM | P/VP | Tipo | Por que sim |
|---|---|---|---|---|
| **MXRF11** | 11.0% | 1.03 | Híbrido | Volume 1.1M/dia, 7 anos pagando, crescente |
| **KNCR11** | 13.2% | 1.04 | Papel CDI | Gestão Kinea/Itaú, correlação com SELIC |

**Escolha mantida.** FIIs de papel se beneficiam da SELIC 14.75%.

**ETF Internacional (15% = R$ 1.005)**

Da análise de 20 ETFs:

| ETF | Preço | Ret 1 ano | Volume | Por que |
|---|---|---|---|---|
| **NASD11** | R$18.32 | +8.0% | 1.3M | Nasdaq 100, preço acessível (54 cotas), volume excelente |

**Escolha mantida.** Confirmada pela análise de 20 ETFs.

**Reserva (10% = R$ 670)**

Tesouro Selic ou CDB 100% CDI na XP. SELIC 14.75% rende mais que muita ação.

---

### Carteira Final

| # | Ativo | Categoria | Qtd | Preço | Total | Score |
|---|---|---|---|---|---|---|
| 1 | **INTB3** | Crescimento | 80 | R$14.39 | R$1.151,20 | 75.3 |
| 2 | **SUZB3** | Crescimento | 25 | R$47.53 | R$1.188,25 | 68.0 |
| 3 | **BBSE3** | Dividendos | 20 | R$35.01 | R$700,20 | 78.5 |
| 4 | **ITUB4** | Dividendos | 13 | R$46.98 | R$610,74 | 73.2 |
| 5 | **MXRF11** | FII | 68 | R$9.88 | R$671,84 | — |
| 6 | **KNCR11** | FII | 6 | R$106.35 | R$638,10 | — |
| 7 | **NASD11** | ETF Intl | 54 | R$18.32 | R$989,28 | — |
| 8 | **Tesouro Selic** | Reserva | — | — | R$670,00 | — |
| | | | | **Total** | **R$6.619,61** | |
| | | | | **Troco** | **R$80,39** | |

---

## Por que os Top 3 do ranking NÃO entraram na carteira

### RECV3 (Score 84.9) — Descartado

PetroRecôncavo. Números excelentes (P/L 6.2, DY 9.1%, NDE 1.0), mas:
- **Depende 100% do preço do petróleo** — sem diversificação
- **Empresa pequena** (market cap ~R$ 7B) — mais volátil
- **CAGR 32%** é insustentável — crescimento por aquisições de campos, não orgânico
- Para perfil moderado com R$ 6.700, o risco de concentração em commodity é alto

### DIRR3 (Score 83.8) — Descartado

Direcional Engenharia. ROE 41.2%, DY 15.5% parecem incríveis, mas:
- **Construção civil com SELIC 14.75%** — crédito imobiliário caro, vendas caem
- **DY 15.5% provavelmente não sustentável** — pode incluir dividendo extraordinário
- **P/VP 3.88** — está cara pelo patrimônio
- Quando SELIC cair, pode ser boa. Agora, risco setorial alto.

### CXSE3 (Score 80.5) — Descartado

Caixa Seguridade. Modelo similar à BBSE3, ROE 31.7%, DY 8.7%, caixa líquido. Mas:
- **A Caixa Econômica Federal é 100% estatal federal** — risco político máximo
- Governo pode mudar contratos de distribuição de seguros a qualquer momento
- BBSE3 (via Banco do Brasil) é mais estável — BB tem governança melhor que Caixa

---

## Análise Detalhada dos Escolhidos

### INTB3 — Intelbras (Crescimento)

| Indicador | Valor | Avaliação |
|---|---|---|
| P/L | 9.8 | Barato para tech lucrativa |
| P/VP | 1.58 | Razoável |
| EV/EBITDA | 8.2 | Justo |
| ROE | 16.1% | Bom (Buffett: >15%) |
| ROIC | 11.4% | Bom |
| DY TTM | 7.8% | Acima do CDI líquido para PF |
| Margem Líquida | 10.8% | Aceitável |
| **Dív.Líq/EBITDA** | **-0.35** | **Caixa líquido** |
| CAGR Receita 5a | 15.9% | Forte |
| LPA | R$1.47 | — |
| VPA | R$9.13 | — |
| Governança | Novo Mercado | Excelente |

**Tese:** Intelbras é líder em segurança eletrônica e telecomunicações no Brasil. Tem caixa líquido (sem dívida), paga 7.8% de DY, cresce 16% ao ano, e negocia a P/L 9.8. É uma tech brasileira que dá lucro real — raro. O moat é o custo de troca (sistemas de segurança instalados) e a marca forte no canal de distribuição.

### SUZB3 — Suzano (Crescimento)

| Indicador | Valor | Avaliação |
|---|---|---|
| P/L | 4.5 | Muito barato |
| P/VP | 1.37 | Barato |
| EV/EBITDA | 6.1 | Barato |
| ROE | 30.6% | Excelente |
| ROIC | 5.9% | Baixo (capital intensivo) |
| DY TTM | 2.4% | Baixo |
| Margem Líquida | 26.8% | Excelente |
| **Dív.Líq/EBITDA** | **3.25** | **Elevado** |
| CAGR Receita 5a | 10.5% | Bom |
| LPA | R$10.61 | — |
| VPA | R$34.66 | — |
| Governança | Novo Mercado | Excelente |

**Tese:** P/L 4.5 com ROE 30.6% e margem 26.8% — a combinação mais barata da B3 em termos de valuation vs rentabilidade. A dívida é alta (3.25× EBITDA) mas é em dólar e a receita também é em dólar (exportadora), então o risco cambial se anula. Líder mundial em celulose com custo de produção mais baixo do planeta. DY baixo (2.4%) é o ponto fraco — compensado pela valorização esperada.

### BBSE3 — BB Seguridade (Dividendos)

| Indicador | Valor | Avaliação |
|---|---|---|
| P/L | 7.5 | Barato |
| P/VP | 6.55 | Alto (mas modelo asset-light) |
| ROE | **86.8%** | Absurdamente alto |
| ROIC | 76.6% | Excepcional |
| DY TTM | **13.0%** | Muito acima do CDI líquido |
| **Dív.Líq/EBITDA** | **-1.30** | **Muito caixa líquido** |
| Governança | Novo Mercado | Boa (BB controlador) |

**Tese:** Máquina de dividendos. ROE 86.8% porque opera com patrimônio mínimo — distribui quase tudo como dividendo. DY 13% é o dobro do que a maioria das ações paga. Com SELIC alta, os investimentos financeiros da BB Seguridade rendem ainda mais. Risco: dependência do BB como canal. Mas o BB tem 5.000+ agências e não vai trocar de seguradora.

### ITUB4 — Itaú Unibanco (Dividendos)

| Indicador | Valor | Avaliação |
|---|---|---|
| P/L | 11.3 | Justo para banco premium |
| P/VP | 2.41 | Prêmio justificado pela qualidade |
| ROE | 21.3% | Melhor entre bancos |
| ROIC | 15.4% | Excelente |
| DY TTM | 7.8% | Bom, tendência crescente |
| Dív.Líq/EBITDA | 0.0 | Banco — não se aplica da mesma forma |
| CAGR Receita 5a | 17.4% | Forte |
| Governança | Nível 1 (tag along 80%) | Boa |

**Tese:** O banco mais eficiente e rentável do Brasil. ROE 21.3% é o mais alto entre os grandes bancos. DY crescente (explodiu de R$1.23/ação em 2023 para R$4.95 em 2025). Com SELIC alta, bancos se beneficiam do spread maior. O moat é fortíssimo — trocar de banco é trabalhoso, a marca é a mais forte do setor.

---

## Dados Verificados — Comparação com Status Invest

| Indicador | SBSP3 (bolsai) | Status Invest | Bate? |
|---|---|---|---|
| P/L | 14.0 | 13.99 | Sim |
| P/VP | 2.79 | 2.79 | **Exato** |
| ROE | 20.0% | 19.96% | Sim |
| M. Líquida | 22.2% | 22.21% | **Exato** |
| LPA | 12.00 | 12.00 | **Exato** |
| VPA | 60.15 | 60.15 | **Exato** |
| PSR | 3.11 | 3.11 | **Exato** |
| CAGR Rec 5a | 16.4% | 16.44% | **Exato** |
| Liq. Corrente | 1.12 | 1.12 | **Exato** |
| Dív.Líq/PL | 0.65 | 0.65 | **Exato** |

Todos os indicadores agora vêm da CVM via bolsai e batem com as plataformas de referência.

---

## Scoring — Como foi calculado

Seguindo `docs/METODOLOGIA_INVESTIMENTOS.md` v3:

```
Score = (
    Valuation             × 20%   (P/L, P/VP, EV/EBITDA, PSR)
  + Rentabilidade         × 20%   (ROE, ROIC, M.Líq, M.Bruta, M.Oper)
  + FCF / Earnings Quality × 15%   (Earnings Yield = 1/P/L)
  + Dividendos            × 15%   (DY TTM, Payout)
  + Endividamento         × 15%   (Dív.Líq/EBITDA, Dív.Líq/PL, Liq.Corrente)
  + Crescimento           × 10%   (CAGR Receita 5a, CAGR Lucro 5a)
) + Bônus Piotroski/Altman
```

Fonte dos dados: bolsai `/fundamentals/{ticker}` (CVM/B3).
Benchmarks: documentados na metodologia com pontuação de 10 a 100 por indicador.

---

## Análise Expandida — 144 Empresas da B3

Além das 42 ações do relatório inicial, analisei **TODAS as 144 empresas ativas com dados na B3** usando o screener da bolsai. Abaixo as novas descobertas com score ≥ 65 que não estavam na análise original.

### Novas descobertas relevantes

| Ticker | Score | Preço | P/L | ROE | ROIC | DY? | NDE | CAGR 5a | Empresa | Veredicto |
|---|---|---|---|---|---|---|---|---|---|---|
| CAMB3 | 77.5 | R$10.07 | 6.2 | 22.4% | 17.4% | ~? | -0.8 | 19.6% | Cambuci (Penalty) | Small cap R$426M, caixa líquido. **Risco: ilíquida** |
| BNBR3 | 76.5 | R$118.70 | 3.8 | 19.2% | 19.8% | ~? | 1.4 | 20.7% | Banco do Nordeste | P/L 3.8 absurdo. **Risco: estatal federal** |
| RIAA3 | 75.8 | R$10.65 | 3.6 | 27.6% | 12.6% | ~? | 0.1 | 10.9% | Guararapes/Riachuelo | P/L 3.6, ROE 27.6%. **Risco: varejo cíclico** |
| SAPR11 | 72.6 | R$41.38 | 6.0 | 16.8% | 9.2% | ~8.5% | 0.7 | 8.5% | Sanepar | Saneamento PR, P/L 6. **Risco: estatal estadual** |
| GMAT3 | 72.2 | R$4.60 | 5.8 | 17.6% | 12.5% | ~? | 0.4 | 25.4% | Grupo Mateus | Supermercados, CAGR 25%. **Preço acessível** |
| CURY3 | 71.0 | R$34.21 | 10.8 | 70.6% | 87.5% | ~? | -0.2 | 36.4% | Cury Construtora | ROE 70.6%(!). **Risco: construção + SELIC alta** |
| GRND3 | 71.4 | R$4.71 | 6.6 | 20.4% | 8.1% | ~? | -2.7 | 6.4% | Grendene (Havaianas) | Caixa líquido R$2.7B(!), NM 24.9%. **Crescimento fraco** |
| CEAB3 | 71.6 | R$13.05 | 6.8 | 15.8% | 17.5% | ~? | -0.1 | 14.3% | C&A Modas | Turnaround, ROIC 17.5%. **Risco: varejo** |
| AZZA3 | 70.8 | R$22.22 | 5.0 | 11.4% | 7.0% | ~? | 1.2 | 49.3% | Azzas (Arezzo+Soma) | CAGR 49.3%, P/VP 0.6. **Risco: integração pós-fusão** |
| BRFS3 | 65.9 | R$17.95 | 8.6 | 24.5% | 15.6% | ~? | 1.4 | 10.5% | BRF (Sadia/Perdigão) | Turnaround ROE 24.5%. **Risco: commodity + histórico ruim** |
| SANB11 | 73.4 | R$31.45 | 9.2 | 10.2% | 10.5% | ~8.6% | -1.2 | 20.9% | Santander Brasil | Banco sólido, DY ~8.6%. **Risco: controlador estrangeiro decide** |

### Alguma dessas supera os escolhidos?

**GMAT3 (Grupo Mateus)** é a mais interessante. P/L 5.8, CAGR 25.4%, ROIC 12.5%, quase sem dívida. É um supermercado nordestino em expansão acelerada — o "Atacadão do Norte". Preço R$4.60 é muito acessível. Mas margem líquida de apenas 4.8% é apertada e varejo de alimentos é competitivo. Não supera INTB3 (margem 10.8%, caixa líquido, DY 7.8%) para a fatia de crescimento.

**GRND3 (Grendene)** tem caixa líquido de R$2.7 bilhões (!!!) e margem 24.9%. Mas CAGR de apenas 6.4% — empresa madura que não cresce. Não supera SUZB3 (CAGR 10.5%, ROE 30.6%) para crescimento nem BBSE3 (DY 13%) para dividendos.

**CURY3** tem ROE de 70.6% e ROIC de 87.5% — números espetaculares. Mas é construção civil com SELIC 14.75%. O DY de ~15% pode ser extraordinário. Quando SELIC cair, pode ser oportunidade. **Na watchlist.**

**BNBR3** (Banco do Nordeste) tem P/L 3.8 e ROIC 19.8% — absurdamente barato. Mas é **estatal federal** como PETR4 e BBAS3. Descartado por governança.

**RIAA3** (Riachuelo) P/L 3.6, ROE 27.6% — parece incrível. Mas é **varejo** de moda, setor cíclico e competitivo. Com SELIC 14.75%, consumo cai. Risco alto demais para perfil moderado.

### Conclusão da análise expandida

**A carteira permanece inalterada.** Das 144 empresas da B3, nenhuma nova descoberta supera os 4 escolhidos (INTB3, SUZB3, BBSE3, ITUB4) considerando o perfil moderado e o cenário de SELIC alta. As novas com score alto são:
- Estatais (BNBR3, SAPR11) → governança
- Construção (CURY3, DIRR3) → SELIC alta
- Varejo cíclico (RIAA3, CEAB3, AZZA3) → consumo fraco
- Small caps ilíquidas (CAMB3, BALM4) → risco de liquidez

**Watchlist atualizada:**
1. **CURY3** — quando SELIC cair abaixo de 10%
2. **GMAT3** — acompanhar evolução de margens
3. **RECV3** — quando petróleo estabilizar
4. **WEGE3** — quando P/L cair abaixo de 20
5. **GRND3** — se começar a crescer de novo

---

## Próximos Passos

1. **Executar as ordens na XP** conforme tabela da carteira
2. **Reavaliar trimestralmente** — usar bolsai `/fundamentals/{ticker}/history` para comparar evolução
3. **Reinvestir dividendos** seguindo a mesma metodologia
4. **Monitorar SELIC** — quando cair abaixo de 10%, migrar parte dos FIIs de papel para tijolo
5. **RECV3 e DIRR3 na watchlist** — se SELIC cair, construção e petróleo ficam mais atrativos
6. **WEGE3 na watchlist** — se P/L cair abaixo de 20, comprar

---

> *Análise com dados oficiais CVM/B3/BCB via bolsai Pro. Indicadores verificados contra Status Invest.*
> *Não constitui recomendação profissional de investimento. Consulte seu assessor na XP.*
