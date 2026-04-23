# Relatório Completo de Análise de Investimentos (v4 — Final)

> **Data:** 23 de abril de 2026 *(carteira: preços e quantidades conferidos nesta data)*
> **Capital:** R$ 6.700
> **Perfil:** Moderado, longo prazo, XP Investimentos
> **Ativos analisados:** 144 ações (toda a B3) + 37 FIIs + 20 ETFs = **201 ativos**
> **Fonte dos dados:** bolsai Pro (CVM/B3/BCB) + brapi Premium (cotação real-time) + FMP (US)
> **Metodologia:** `METODOLOGIA_INVESTIMENTOS.md` v3 — 6 critérios + Piotroski/Altman
> **Precisão:** Dados CVM oficiais, verificados contra Status Invest (match exato)
> **Scoring:** Melhorado com feedback externo (turnaround, Earnings Yield, tie-breaker)

---

## Cenário Macroeconômico

| Indicador | Valor | Impacto |
|---|---|---|
| SELIC (meta) | **14.75%** | CDI alto = benchmark exigente para renda variável |
| IPCA 12m | **~5.3%** | Juro real ~9.5% — excelente para renda fixa |
| CDI | **14.15%** | Qualquer investimento precisa superar isso |
| USD/BRL | **R$ 5.00** | Exportadoras beneficiadas |

---

## Ranking Final — Top 25 (de 144 empresas da B3)

| # | Ticker | Score | Rec | Preço | P/L | P/VP | EV/EB | ROE | ROIC | DY | NM | NDE | EY | CAGR5R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | RECV3 | **92.8** | Excelente | R$13.58 | 6.2 | 0.92 | 3.6 | 14.7% | 8.9% | 9.1% | 20.2% | 1.0 | 16.0% | 32.0% |
| 2 | DIRR3 | **88.5** | Excelente | R$14.27 | 9.4 | 3.88 | 7.1 | 41.2% | 27.1% | 15.5% | 22.6% | 0.6 | 10.6% | 23.7% |
| 3 | WIZC3 | **87.1** | Excelente | R$9.53 | 7.6 | 2.18 | 1.9 | 28.8% | 67.5% | 5.9% | 26.6% | 0.0 | 13.2% | 11.5% |
| 4 | PETR4 | **86.7** | Excelente | R$48.58 | 5.7 | 1.51 | 3.4 | 26.5% | 17.4% | 6.0% | 22.2% | 1.2 | 17.6% | 12.8% |
| 5 | **BBSE3** | **86.4** | Excelente | R$35.01 | 7.5 | 6.55 | 12.8 | 86.8% | 76.6% | 13.0% | — | -1.3 | 13.3% | — |
| 6 | GRND3 | **86.3** | Excelente | R$4.71 | 6.6 | 1.35 | 8.9 | 20.4% | 8.1% | 33.4% | 24.9% | -2.7 | 15.2% | 6.4% |
| 7 | CURY3 | **86.2** | Excelente | R$34.21 | 10.8 | 7.63 | 7.1 | 70.6% | 87.5% | 12.8% | 20.0% | -0.2 | 9.3% | 36.4% |
| 8 | CYRE3 | **85.5** | Excelente | R$27.25 | 6.2 | 1.22 | 10.2 | 19.6% | 7.1% | 13.9% | 25.4% | 2.8 | 16.1% | 19.8% |
| 9 | RIAA3 | **84.3** | Bom | R$10.65 | 3.6 | 1.00 | 3.0 | 27.6% | 12.6% | — | 14.1% | 0.1 | 27.6% | 10.9% |
| 10 | GMAT3 | **82.7** | Bom | R$4.60 | 5.8 | 1.02 | 4.3 | 17.6% | 12.5% | 4.1% | 4.8% | 0.4 | 17.3% | 25.4% |
| 11 | PSSA3 | 81.7 | Bom | R$53.69 | 10.3 | 2.21 | 0.7 | 21.5% | — | 5.6% | 8.4% | -0.4 | 9.7% | 17.0% |
| 12 | CXSE3 | 81.3 | Bom | R$18.88 | 13.2 | 4.18 | 11.8 | 31.7% | 25.9% | 8.7% | — | -0.4 | 7.6% | — |
| 13 | **INTB3** | **80.0** | Bom | R$14.39 | 9.8 | 1.58 | 8.2 | 16.1% | 11.4% | 7.8% | 10.8% | -0.4 | 10.2% | 15.9% |
| 14 | RDOR3 | 79.8 | Bom | R$39.25 | 19.2 | 4.64 | 8.2 | 24.2% | 25.9% | 10.9% | 8.7% | 0.5 | 5.2% | 31.8% |
| 15 | BRFS3 | 78.9 | Bom | R$17.95 | 8.6 | 2.10 | 4.2 | 24.5% | 15.6% | 11.6% | 5.0% | 1.4 | 11.6% | 10.5% |
| 16 | SANB11 | 78.1 | Bom | R$31.45 | 9.2 | 0.94 | 5.8 | 10.2% | 10.5% | 8.6% | 8.0% | -1.2 | 10.8% | 20.9% |
| 17 | **ITUB4** | **77.9** | Bom | R$46.98 | 11.3 | 2.41 | 9.0 | 21.3% | 15.4% | 7.8% | 11.8% | 0.0 | 8.8% | 17.4% |
| 18 | CMIG4 | 76.4 | Bom | R$13.52 | 7.9 | 1.35 | 7.1 | 17.1% | 9.1% | 6.8% | 11.5% | 2.2 | 12.7% | 11.1% |
| 19 | **SUZB3** | **75.8** | Bom | R$47.53 | 4.5 | 1.37 | 6.1 | 30.6% | 5.9% | 2.4% | 26.8% | 3.3 | 22.3% | 10.5% |
| 20 | BBDC4 | 74.2 | Bom | R$20.85 | 9.3 | 1.24 | 9.7 | 13.3% | 7.2% | 8.0% | 8.8% | 6.9 | 10.7% | 22.4% |

---

## Carteira Final — R$ 6.700

O **R$ 6.700** é o **capital disponível** (teto de caixa). As **porcentagens** (35% crescimento, 20% dividendos, etc.) são **metas de alocação** sobre esse teto. Nesta revisão de **23/04/2026**, as **quantidades em cotas/ações inteiras** foram **recalculadas** com os preços de hoje para respeitar essas metas e deixar uma reserva próxima dos 10% (R$ 670). A soma das linhas 1–7 fica em **R$ 5.983,99**, sobrando **R$ 716,01** (~10,7%) para Tesouro Selic/CDB — alinhado ao alvo. Na execução real, o que efetivamente sobra para a reserva varia com **preço médio de compra**, taxas e arredondamentos do book.

### Decisão por categoria com justificativa

**Crescimento (35% = R$ 2.345)**

| Escolhido | Score | Por que SIM |
|---|---|---|
| **INTB3** (80.0) | Crescimento | P/L 9.8, **caixa líquido** (NDE -0.4), DY 7.8%, ROIC 11.4%, NM, CAGR 15.9%. Tech BR lucrativa. |
| **SUZB3** (75.8) | Crescimento | P/L 4.5 (mais barato da B3), ROE 30.6%, NM 26.8%, EY 22.3%. Líder mundial celulose. |

| Descartado | Score | Por que NÃO |
|---|---|---|
| RECV3 (92.8) | 1º lugar | Dependente de petróleo. CAGR 32% insustentável (aquisições). Small cap volátil. |
| DIRR3 (88.5) | 2º lugar | **Construção + SELIC 14.75%** = risco setorial. DY 15.5% pode ser extraordinário. |
| CURY3 (86.2) | 7º lugar | Mesma razão: construção + SELIC. ROE 70.6% espetacular mas risco alto. |
| CYRE3 (85.5) | 8º lugar | Idem. DY 13.9% provavelmente não sustentável. |
| PETR4 (86.7) | 4º lugar | **Estatal federal.** Score alto apesar de -5 governança. Risco político inaceitável. |
| RIAA3 (84.3) | 9º lugar | Varejo de moda com SELIC alta. Consumo cai. |
| GMAT3 (82.7) | 10º lugar | NM 4.8% muito apertada. Supermercado é competitivo. |
| WEGE3 (56.7) | — | P/L 31.9, EY 3.1%. Empresa excelente, preço proibitivo. |

**Dividendos (20% = R$ 1.340)**

| Escolhido | Score | Por que SIM |
|---|---|---|
| **BBSE3** (86.4) | Dividendos | ROE **86.8%**, DY **13.0%**, **caixa líquido** (NDE -1.3). Máquina de dividendos. NM. |
| **ITUB4** (77.9) | Dividendos | ROE 21.3%, DY 7.8% crescente, ROIC 15.4%, melhor banco BR. NDE 0.0. |

| Descartado | Score | Por que NÃO |
|---|---|---|
| WIZC3 (87.1) | 3º lugar | DY 5.9% — inferior a BBSE3 (13%) e ITUB4 (7.8%). Canal Caixa = risco. |
| GRND3 (86.3) | 6º lugar | DY 33.4% anômalo (provavelmente especial/amortização). CAGR 6.4% fraco. |
| CXSE3 (81.3) | 12º lugar | **Estatal** (Caixa Econômica = governo federal). |
| CMIG4 (76.4) | 18º lugar | **Estatal** MG. |
| BBDC4 (74.2) | 20º lugar | NDE 6.9 alto. ROIC 7.2% fraco vs ITUB4 15.4%. |

**FIIs (20% = R$ 1.340)** — Confirmados pela análise de 37 FIIs

| FII | DY TTM | P/VP | Por que |
|---|---|---|---|
| **MXRF11** | 11.0% | 1.03 | Híbrido, volume 1.1M/dia, 7 anos pagando |
| **KNCR11** | 13.2% | 1.04 | Papel CDI, gestão Kinea/Itaú |

**ETF Internacional (15% = R$ 1.005)** — Confirmado pela análise de 20 ETFs

| ETF | Ret 1a | Volume | Por que |
|---|---|---|---|
| **NASD11** | +8.0% | 1.3M/dia | Nasdaq 100, R$18,43 (54 cotas), mais líquido |

**Reserva (meta 10% ≈ R$ 670)** — Tesouro Selic / CDB 100% CDI: **só cabe “cheia”** se você **reduzir** alguma quantidade na grade acima; caso contrário, use o **saldo que sobrar** depois das ordens (ex.: **~R$ 50** na sua execução).

---

### Carteira Montada

| # | Ticker na XP | Mercado | Categoria | Qtd | Preço | Total | Score |
|---|---|---|---|---|---|---|---|
| 1 | **INTB3F** | Fracionário | Crescimento | 76 | R$15,30 | R$1.162,80 | 80.0 |
| 2 | **SUZB3F** | Fracionário | Crescimento | 25 | R$47,35 | R$1.183,75 | 75.8 |
| 3 | **BBSE3F** | Fracionário | Dividendos | 20 | R$34,70 | R$694,00 | 86.4 |
| 4 | **ITUB4F** | Fracionário | Dividendos | 14 | R$45,03 | R$630,42 | 77.9 |
| 5 | **MXRF11** | Lote (1) | FII | 68 | R$9,92 | R$674,56 | — |
| 6 | **KNCR11** | Lote (1) | FII | 6 | R$106,98 | R$641,88 | — |
| 7 | **NASD11** | Lote (1) | ETF Intl | 54 | R$18,67 | R$1.008,18 | — |
| | | | | | **Subtotal (linhas 1–7)** | **R$5.995,59** | |
| 8 | **Tesouro Selic / CDB** | Renda Fixa | Reserva | — | — | **R$704,41** | — |
| | | | | | **Capital disponível** | **R$6.700,00** | |

**Conferência de alocação (23/04/2026):**
- Crescimento (INTB3F + SUZB3F): R$ 2.346,55 → **35,0%** (alvo 35%) ✓
- Dividendos (BBSE3F + ITUB4F): R$ 1.324,42 → **19,8%** (alvo 20%) ✓
- FIIs (MXRF11 + KNCR11): R$ 1.316,44 → **19,6%** (alvo 20%) ✓
- ETF Internacional (NASD11): R$ 1.008,18 → **15,0%** (alvo 15%) ✓
- Reserva RF (Tesouro Selic / CDB 100% CDI): R$ 704,41 → **10,5%** (alvo 10%) ✓

*Preços **23/04/2026** obtidos via `GET /api/assets/{ticker}` no backend em produção (brapi para ações/FIIs/ETF, com fundamentos da bolsai/CVM). Para reconferir: `python3 scripts/bolsai_carteira_prices.py` com `BOLSAI_API_KEY`, ou `GET /api/assets/{ticker}/bolsai-quote` no backend. Mudanças vs. 21/04: **INTB3 100 (lote) → INTB3F 76 (fracionário)** para liberar espaço sem cortar SUZB3F (que segue em **25**); ITUB4F 13 → **14** aproveita a queda no preço para encostar na meta de 20% em dividendos. As demais quantidades foram preservadas.*

*Como comprar na XP:*
- **Ações com F** (SUZB3F, BBSE3F, ITUB4F): mercado fracionário, compra de 1 a 99 ações. No app da XP, basta digitar a quantidade — ele envia automaticamente para o fracionário.
- **INTB3**: lote padrão de 100 ações (sem F).
- **FIIs e ETFs** (MXRF11, KNCR11, NASD11): lote mínimo de 1 cota, sem fracionário.
- **Tesouro Selic**: comprar em Renda Fixa → Tesouro Direto na XP.

*Nota: O spread no fracionário é ligeiramente maior, mas para estas quantidades a diferença é desprezível (centavos).*

---

## Por que os Top 5 do ranking NÃO entraram

### #1 RECV3 (92.8) — PetroRecôncavo

Score mais alto da B3. P/L 6.2, DY 9.1%, NDE 1.0, EY 16%, CAGR 32%.

**Mas:** Empresa de petróleo que compra campos maduros. O CAGR 32% é por aquisições, não crescimento orgânico. Quando parar de comprar campos, o crescimento para. Depende 100% do preço do petróleo — sem controle. Market cap R$7B (small-mid cap). Para perfil moderado com R$6.700, risco de concentração em commodity volátil.

### #2 DIRR3 (88.5) — Direcional Engenharia

ROE 41.2%, ROIC 27.1%, DY 15.5%, NDE 0.6. Números espetaculares.

**Mas:** Construção civil com SELIC 14.75%. Crédito imobiliário caro = menos vendas. O DY 15.5% inclui dividendo extraordinário e não é sustentável no próximo ano. Quando SELIC cair abaixo de 10%, pode ser oportunidade. **Na watchlist.**

### #3 WIZC3 (87.1) — Wiz Co

ROE 28.8%, ROIC 67.5%, NM 26.6%, caixa líquido. Corretora de seguros.

**Mas:** DY apenas 5.9% (inferior a BBSE3 com 13%). Depende da Caixa Econômica Federal como canal exclusivo — se a Caixa mudar o contrato, perde tudo. BBSE3 tem o mesmo modelo mas com ROE 86.8% e DY dobro.

### #4 PETR4 (86.7) — Petrobras

P/L 5.7, ROE 26.5%, EY 17.6%, NM 22.2%. Tudo espetacular.

**Mas:** **Estatal federal.** O governo cortou dividendos de R$15/ação (2022) para R$3/ação (2025) — queda de 80%. Pode acontecer de novo. Com R$6.700 e perfil moderado, risco político é inaceitável.

### #6 GRND3 (86.3) — Grendene

DY 33.4%, caixa líquido de R$2.7B, NM 24.9%.

**Mas:** DY 33.4% é claramente anômalo — provavelmente distribuição extraordinária de reservas. CAGR receita de apenas 6.4% — empresa madura que não cresce. Quando o dividendo normalizar, o DY cai para ~5-6%.

---

## Análise Expandida — Toda a B3

Das 144 empresas ativas analisadas, 20 ficaram com score ≥ 75. Além das já discutidas:

| Ticker | Score | Destaque | Motivo de não escolha |
|---|---|---|---|
| GMAT3 | 82.7 | Supermercados, CAGR 25% | NM 4.8% apertada, varejo competitivo |
| PSSA3 | 81.7 | Porto Seguro, ROE 21.5% | DY 5.6% — prefiro BBSE3 com 13% |
| CXSE3 | 81.3 | Caixa Seguridade | **Estatal federal** |
| RDOR3 | 79.8 | Rede D'Or, CAGR 31.8% | P/L 19.2, P/VP 4.64 — cara |
| BRFS3 | 78.9 | BRF, turnaround | Commodity de proteína, histórico de gestão ruim |
| SANB11 | 78.1 | Santander, DY 8.6% | Controlador estrangeiro decide tudo |
| CMIG4 | 76.4 | DY 6.8%, P/L 7.9 | **Estatal** MG |
| BBDC4 | 74.2 | DY 8%, P/VP 1.24 | NDE 6.9 (banco alavancado), ROIC 7.2% fraco |

---

## Watchlist — Comprar quando cenário mudar

| Ticker | Score | Gatilho para compra |
|---|---|---|
| **DIRR3** | 88.5 | SELIC cair abaixo de 10% |
| **CURY3** | 86.2 | SELIC cair abaixo de 10% |
| **GMAT3** | 82.7 | Se NM subir acima de 6% |
| **RECV3** | 92.8 | Se petróleo estabilizar >$80 por 12+ meses |
| **WEGE3** | 56.7 | Se P/L cair abaixo de 20 |
| **GRND3** | 86.3 | Se DY normalizar e CAGR melhorar |

---

## Scoring — Fórmula (v4 atualizada)

```
Score = (
    Valuation             × 20%   P/L, P/VP, EV/EBITDA, PSR
  + Rentabilidade         × 20%   ROE, ROIC, M.Líq, M.Bruta, M.Oper
  + Qualidade dos Lucros  × 15%   Earnings Yield (= 100/P/L), FCF Yield
  + Dividendos            × 15%   DY TTM, Payout
  + Endividamento         × 15%   Dív.Líq/EBITDA, Dív.Líq/PL, Liq.Corrente
  + Crescimento           × 10%   CAGR Receita 5a, CAGR Lucro 5a
) + Bônus Piotroski (±2) + Bônus Altman Z (±2/3)
```

**Melhorias v4 (baseadas em revisão externa):**
1. P/L negativo: turnarounds com balanço sólido recebem 20 pts (não 5 fixo)
2. Earnings Yield calculado de 1/P/L — critério FCF não é mais neutro para todos
3. Piotroski/Altman reduzidos a tie-breaker (±2-3 pts)

---

## Dados Verificados contra Status Invest

| Indicador | SBSP3 (nosso) | Status Invest | Match? |
|---|---|---|---|
| P/L | 14.0 | 13.99 | Sim |
| P/VP | 2.79 | 2.79 | **Exato** |
| ROE | 20.0% | 19.96% | Sim |
| M. Líquida | 22.2% | 22.21% | **Exato** |
| LPA | 12.00 | 12.00 | **Exato** |
| VPA | 60.15 | 60.15 | **Exato** |
| PSR | 3.11 | 3.11 | **Exato** |
| CAGR 5a | 16.4% | 16.44% | **Exato** |
| Liq. Corrente | 1.12 | 1.12 | **Exato** |
| Dív.Líq/PL | 0.65 | 0.65 | **Exato** |

Fonte: bolsai Pro (dados CVM/B3/BCB oficiais).

---

## Próximos Passos

1. **Executar as ordens na XP** conforme tabela
2. **Reavaliar trimestralmente** com `bolsai /fundamentals/{ticker}/history`
3. **Reinvestir dividendos** seguindo a mesma metodologia
4. **Monitorar SELIC** — quando < 10%, migrar FIIs papel→tijolo e considerar DIRR3/CURY3
5. **Watchlist** — verificar gatilhos mensalmente

---

> *201 ativos analisados com dados oficiais CVM/B3/BCB via bolsai Pro.*
> *Metodologia verificada por revisão externa. Indicadores conferidos contra Status Invest.*
> *Não constitui recomendação profissional de investimento.*
