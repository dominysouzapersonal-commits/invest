# InvestAnalytics — Documentação Completa do Projeto

> Documento de referência para entender 100% do projeto sem ler código.
> Última atualização: 17 de abril de 2026

---

## 1. O que é

Plataforma web de análise fundamentalista de investimentos. O usuário pesquisa ativos (ações BR, FIIs, ações US, ETFs, BDRs), recebe um score 0-100 baseado em fundamentos, e gerencia seu portfolio.

**URLs ao vivo:**
- Frontend: https://investanalytics.vercel.app
- Backend: https://investanalytics-api.onrender.com
- GitHub: https://github.com/dominysouzapersonal-commits/invest

---

## 2. Stack Técnica

| Camada | Tecnologia | Hospedagem |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite + TailwindCSS v4 | Vercel |
| Backend | Python 3.14 + FastAPI + Motor (MongoDB async) | Render |
| Banco de dados | MongoDB | Atlas (cloud) |
| Autenticação | JWT (jose) + bcrypt + Google OAuth (Authlib) | — |
| APIs de dados | brapi.dev (Premium) + FMP (Pago) | — |
| Charts | Recharts (frontend) | — |
| HTTP Client | httpx (backend), axios (frontend) | — |
| State mgmt | React Query (@tanstack/react-query) | — |

---

## 3. Estrutura de Pastas

```
Investimentos/
├── README.md
├── CONTEXT.md                          ← Contexto privado (gitignored)
├── .gitignore
│
├── docs/
│   ├── PROJETO_COMPLETO.md             ← Este documento
│   ├── METODOLOGIA_INVESTIMENTOS.md    ← Metodologia de análise (10 critérios)
│   ├── RELATORIO_COMPLETO.md           ← Relatório de 77 ativos analisados
│   ├── BRAPI_REFERENCE.md              ← Referência API brapi.dev
│   └── FMP_REFERENCE.md               ← Referência API FMP
│
├── backend/
│   ├── .env                            ← Variáveis de ambiente (gitignored)
│   ├── .env.example                    ← Template do .env
│   ├── requirements.txt                ← Dependências Python
│   ├── render.yaml                     ← Render Blueprint para deploy
│   ├── venv/                           ← Virtual env (gitignored)
│   └── app/
│       ├── main.py                     ← Entry point FastAPI
│       ├── config.py                   ← Settings do Pydantic
│       ├── database.py                 ← Conexão MongoDB (Motor)
│       ├── routers/                    ← Endpoints da API
│       ├── services/                   ← Lógica de negócio
│       ├── models/                     ← Acesso ao MongoDB
│       ├── schemas/                    ← DTOs Pydantic (request/response)
│       └── utils/                      ← Helpers (auth, cache, parser XP)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── vercel.json                     ← Config Vercel (SPA rewrite)
    ├── tsconfig.json
    └── src/
        ├── main.tsx                    ← Entry point React
        ├── App.tsx                     ← Rotas + providers
        ├── index.css                   ← Tailwind import + tokens
        ├── pages/                      ← Páginas da aplicação
        ├── components/                 ← Componentes reutilizáveis
        ├── contexts/                   ← AuthContext
        ├── services/                   ← Cliente API (axios)
        └── types/                      ← Interfaces TypeScript
```

---

## 4. Backend — Detalhamento

### 4.1 Variáveis de Ambiente (.env)

| Variável | Uso |
|---|---|
| `MONGODB_URI` | Connection string do MongoDB Atlas |
| `DATABASE_NAME` | Nome do banco (default: `investimentos`) |
| `BRAPI_TOKEN` | Token premium da brapi.dev |
| `FMP_API_KEY` | API key do Financial Modeling Prep |
| `JWT_SECRET` | Secret para assinar tokens JWT |
| `JWT_ALGORITHM` | Algoritmo (default: HS256) |
| `JWT_EXPIRATION_DAYS` | Dias de validade do token (default: 7) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `FRONTEND_URL` | URL do frontend para CORS |
| `CACHE_TTL_MINUTES` | TTL do cache MongoDB (default: 30) |

### 4.2 Endpoints da API

**Auth** (`/api/auth`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/register` | Não | Cadastro com email/senha/nome |
| POST | `/login` | Não | Login com email/senha, retorna JWT |
| POST | `/google` | Não | Login com access_token do Google |
| GET | `/me` | Sim | Dados do usuário logado |

**Assets** (`/api/assets`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/search?q=PETR` | Não | Busca ativos (brapi BR + FMP US) |
| GET | `/{ticker}?period=1y` | Não | Dados completos: fundamentals + histórico + score |
| GET | `/{ticker}/quote` | Não | Cotação rápida |
| GET | `/{ticker}/history?period=1y` | Não | Histórico de preços OHLCV |

**Analysis** (`/api/analysis`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/{ticker}/score` | Sim | Score do ativo com pesos do usuário |
| POST | `/score?ticker=X` | Não | Score com pesos customizados (body) |
| GET | `/weights` | Sim | Pesos de scoring do usuário |
| PUT | `/weights` | Sim | Atualizar pesos de scoring |

**Portfolio** (`/api/portfolio`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/summary` | Sim | Resumo: total investido, atual, P&L, alocação |
| GET | `/positions` | Sim | Lista de posições |
| POST | `/positions` | Sim | Adicionar posição manual |
| PUT | `/positions/{id}` | Sim | Atualizar quantidade/preço |
| DELETE | `/positions/{id}` | Sim | Remover posição |
| POST | `/import` | Sim | Importar extrato XP (CSV/XLSX) |
| GET | `/transactions` | Sim | Histórico de transações |

**Compare** (`/api/compare`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/` | Não | Comparar até 4 ativos lado a lado |

**Watchlist** (`/api/watchlist`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/` | Sim | Listar watchlist com preços/scores |
| POST | `/` | Sim | Adicionar ativo |
| DELETE | `/{id}` | Sim | Remover |

**Report** (`/api/report`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/full-analysis` | Não | Relatório completo: 49 ativos, macro, carteira sugerida |

### 4.3 Provedores de Dados

**brapi.dev (Primary para BR)**

Usado para: cotações BR, fundamentalistas (módulos financialData, defaultKeyStatistics, summaryProfile, DRE, balanço, fluxo de caixa), dividendos históricos, SELIC, IPCA, câmbio, crypto.

- Batch de até 20 tickers por request
- 16 módulos disponíveis
- SDK oficial `brapi` instalada mas usamos httpx direto por flexibilidade

Arquivo: `backend/app/services/data_providers/brapi.py`

Funções principais:
- `get_quote(ticker)` → cotação + dividendos + módulos básicos
- `get_quotes_batch(tickers)` → até 20 de uma vez
- `get_fundamentals(ticker)` → módulos avançados
- `get_historical(ticker, range_, interval)` → OHLCV
- `get_selic()`, `get_ipca()`, `get_currency()` → macro
- `search_assets(query)`, `list_assets()` → busca

**FMP (Primary para US)**

Usado para: profile, ratios TTM, key metrics TTM, financial scores (Piotroski, Altman), DCF, analyst consensus, price targets, grades, RSI/SMA/EMA, insider trades, news, ETF holdings, growth, income statements, balance sheet, cash flow, dividends.

Arquivo: `backend/app/services/data_providers/fmp.py`

Funções principais:
- `get_fundamentals(ticker)` → profile + ratios + metrics (3 requests merged)
- `get_financial_scores(ticker)` → Piotroski + Altman Z
- `get_dcf(ticker)` → DCF valuation
- `get_grades_consensus(ticker)` → Strong Buy/Buy/Hold/Sell
- `get_price_target_consensus(ticker)` → analyst targets
- `get_rsi(ticker)`, `get_sma(ticker)` → technical
- `get_insider_trades(ticker)` → insider buys/sells
- `get_stock_news(ticker)` → últimas notícias
- `get_etf_holdings(ticker)` → composição ETFs
- `get_growth(ticker)` → crescimento 1a/3a/5a

**Providers legados (não importados mas mantidos):**
- `yfinance_provider.py` — fallback via lib yfinance (sync, lento)
- `fundamentus.py` — scraping do site Fundamentus (frágil)

### 4.4 Motor de Análise

Arquivo: `backend/app/services/analysis_engine.py`

**Fluxo:**
1. `detect_asset_type(ticker)` → classifica: br_stock, fii, bdr, us_stock
2. Se BR: chama brapi (quote + fundamentals) via `asyncio.gather`
3. Se US: chama FMP (profile + ratios + metrics + scores + DCF + grades + RSI) via `asyncio.gather`
4. Monta `FundamentalData` com 60+ campos
5. `calculate_score(data)` → scoring multidimensional
6. Retorna `AssetDetail` (fundamentals + historical + score)

**Detecção de tipo:**
- 4 letras + 1 dígito (PETR4, VALE3) → br_stock
- 4 letras + "11" (HGLG11, MXRF11) → fii
- Termina em 34/35/33 (AAPL34) → bdr
- Tudo mais → us_stock

### 4.5 Sistema de Scoring

Arquivo: `backend/app/services/scoring.py`

**Dimensões:**

| Dimensão | Peso | Indicadores usados |
|---|---|---|
| Valuation | 25% | P/L, P/VP, EV/EBITDA, PSR |
| Rentabilidade | 25% | ROE, ROA, ROIC, M.Líq, M.Bruta, M.Oper |
| Dividendos | 20% | DY, Payout Ratio |
| Endividamento | 20% | Dív/EBITDA, Liq.Corrente, Cob.Juros |
| Crescimento | 10% | Cresc. Receita 1a/5a, Cresc. Lucro 1a |

**Bônus/Penalidade:**
- Piotroski ≥ 8: +4 pts | ≤ 3: -3 pts
- Altman Z > 2.99: +3 pts | < 1.81: -4 pts

**Benchmarks diferentes para:** BR (BENCHMARKS_BR), US (BENCHMARKS_US), FIIs (BENCHMARKS_FII)

**Pesos são customizáveis** por usuário via API `/analysis/weights`

### 4.6 Geração de Relatório

Arquivo: `backend/app/services/report_service.py`

Analisa 49 ativos pré-definidos em 5 categorias:
- Crescimento: 15 tickers
- Dividendos: 14 tickers
- FIIs: 10 tickers
- ETF BR: 3 tickers
- ETF US: 7 tickers

Busca macro (SELIC, IPCA, câmbio), calcula scores, gera "por que sim" e "por que não" automáticos, monta carteira sugerida para R$ 6.700.

### 4.7 Modelos MongoDB

**Collections:**

| Collection | Campos principais | Indexes |
|---|---|---|
| `users` | email, name, hashed_password, google_id | email (unique) |
| `positions` | user_id, ticker, asset_type, quantity, avg_price, currency, broker | ticker, user_id |
| `transactions` | user_id, ticker, operation, quantity, price, total, date | user_id, ticker |
| `watchlist` | user_id, ticker, asset_type, target_price, notes, alert_enabled | (user_id, ticker) unique |
| `cache` | cache_key, data (JSON), provider, expires_at | cache_key (unique), expires_at (TTL) |
| `scoring_config` | user_id, weight_valuation, weight_profitability, etc. | — |

### 4.8 Autenticação

Arquivo: `backend/app/utils/auth.py`

- Senhas: bcrypt hash/verify
- Token: JWT com python-jose, 7 dias de validade
- Google: Authlib verifica access_token, cria/busca usuário
- Middleware: `get_current_user` dependency extrai user do header `Authorization: Bearer <JWT>`

### 4.9 Cache

Arquivo: `backend/app/utils/cache.py`

Cache em MongoDB com TTL automático. Chave string → JSON serializado. Expira em 30 min (configurável). Índice TTL do MongoDB limpa automaticamente.

### 4.10 Parser XP

Arquivo: `backend/app/utils/xp_parser.py`

Parseia extratos CSV/XLSX da XP Investimentos. Detecta colunas de ticker, quantidade, preço médio, data, operação (compra/venda). Normaliza para formato interno.

---

## 5. Frontend — Detalhamento

### 5.1 Páginas

| Rota | Arquivo | Auth | Descrição |
|---|---|---|---|
| `/` | DashboardPage | Sim | Resumo do portfolio: investido, atual, P&L, alocação por tipo/setor |
| `/report` | ReportPage | Sim | Relatório completo de análise de 49 ativos com carteira sugerida |
| `/search` | SearchPage | Sim | Busca de ativos com debounce, lista resultados BR + US |
| `/asset/:ticker` | AssetDetailPage | Sim | Detalhe do ativo: preço, gráfico 1y, score, indicadores, peers |
| `/portfolio` | PortfolioPage | Sim | CRUD de posições, importação de extrato XP |
| `/compare` | ComparePage | Sim | Comparar até 4 ativos lado a lado |
| `/watchlist` | WatchlistPage | Sim | Lista de acompanhamento com preços e scores live |
| `/settings` | SettingsPage | Sim | Ajustar pesos do scoring (valuation, rentabilidade, etc.) |
| `/login` | LoginPage | Não | Login email/senha |
| `/register` | RegisterPage | Não | Cadastro |
| `/auth/google/callback` | GoogleCallbackPage | Não | Callback OAuth Google |

### 5.2 Componentes

| Componente | Arquivo | Uso |
|---|---|---|
| AppLayout | `Layout/AppLayout.tsx` | Shell: Navbar + Outlet |
| Navbar | `Layout/Navbar.tsx` | Navegação top fixa: links + logout |
| Sidebar | `Layout/Sidebar.tsx` | Layout alternativo (não usado atualmente) |
| Card | `common/Card.tsx` | Container estilizado |
| Badge | `common/Badge.tsx` | Label de tipo (Ação BR, FII, etc.) com cores |
| Loading | `common/Loading.tsx` | Spinner + texto |
| MetricCard | `common/MetricCard.tsx` | Label + valor com cor condicional (gain/loss) |
| ScoreGauge | `common/ScoreGauge.tsx` | Score 0-100 com barra colorida |

### 5.3 API Client

Arquivo: `services/api.ts`

Axios instance com:
- Base URL de `VITE_API_URL`
- Interceptor: adiciona `Authorization: Bearer <JWT>` em toda request
- Interceptor de erro: 401 → limpa localStorage → redireciona para `/login`
- Timeout de 120s para o endpoint de relatório

Módulos exportados:
- `authApi` — register, login, googleLogin, me
- `assetsApi` — search, getDetail, getHistory
- `analysisApi` — getScore, getWeights, updateWeights
- `portfolioApi` — getSummary, getPositions, createPosition, deletePosition, importFile
- `compareApi` — compare
- `watchlistApi` — list, add, remove
- `reportApi` — getFullAnalysis

### 5.4 Estado e Auth

Arquivo: `contexts/AuthContext.tsx`

- Estado: `user` + `token` em localStorage
- `login()` / `register()` → chama API, salva token, seta user
- `googleLogin()` → OAuth flow
- `logout()` → limpa tudo
- Provider envolve toda a app em `App.tsx`

### 5.5 Tipos TypeScript

Arquivo: `types/index.ts`

Interfaces que espelham os schemas Pydantic do backend:
- `AssetSearch`, `FundamentalData`, `AssetDetail`, `ScoreResult`
- `PositionResponse`, `PortfolioSummary`
- `CompareResult`, `WatchlistItem`, `ScoringWeights`
- `AssetAnalysis`, `CategoryRecommendation`, `MacroData`, `FullReport`
- Constants: `ASSET_TYPE_LABELS`, `RECOMMENDATION_COLORS`

### 5.6 Estilo

- Dark mode minimalista (Cursor/Vercel-inspired)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Tokens customizados em `index.css`: `--color-bg`, `--color-text-primary`, `--color-gain`, `--color-loss`, etc.
- Tipografia: 14px base, compacta
- Cores: neutras, verde só para gain, vermelho só para loss

---

## 6. Fluxo de Dados Principal

```
Usuário pesquisa "PETR4" no frontend
    ↓
Frontend: GET /api/assets/PETR4?period=1y
    ↓
Backend router (assets.py):
    ├── get_full_asset_data("PETR4")
    │   ├── detect_asset_type → "br_stock"
    │   ├── brapi.get_quote("PETR4")      → preço, market cap, dividendos
    │   └── brapi.get_fundamentals("PETR4") → ROE, margens, P/L, etc.
    │   └── _build_fundamental_data() → FundamentalData (60+ campos)
    │
    ├── get_historical("PETR4", "1y")
    │   └── brapi.get_historical("PETR4", "1y", "1d") → 251 pontos OHLCV
    │
    └── calculate_score(fundamentals)
        ├── _score_valuation() → P/L, P/VP, EV/EBITDA
        ├── _score_profitability() → ROE, ROA, margens
        ├── _score_dividends() → DY, payout
        ├── _score_debt() → Dív/EBITDA, liquidez
        ├── _score_growth() → crescimento receita/lucro
        └── _advanced_score_adjustment() → Piotroski, Altman Z bonus
        → ScoreResult (total + breakdown)
    ↓
Response: AssetDetail { fundamentals, historical_prices, score }
    ↓
Frontend renderiza: gráfico + score gauge + indicadores + peers
```

---

## 7. Deploy

### Backend (Render)

- Serviço: `investanalytics-api` (ID: `srv-d7gin7hj2pic73fbo3f0`)
- Tipo: Web Service, Python
- Root: `backend/`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Auto-deploy: via Render API (`POST /v1/services/{id}/deploys`)
- Env vars configuradas no dashboard do Render

### Frontend (Vercel)

- Projeto conectado ao GitHub
- Root: `frontend/`
- Framework: Vite
- Build: `npm run build` → `dist/`
- Env: `VITE_API_URL=https://investanalytics-api.onrender.com`
- SPA rewrite: `vercel.json` com fallback para `index.html`

### Banco (MongoDB Atlas)

- Cluster: `Invest`
- Banco: `investimentos`
- 6 collections: users, positions, transactions, watchlist, cache, scoring_config
- Network: `0.0.0.0/0` liberado

---

## 8. Dependências

### Backend (Python)

| Pacote | Versão | Uso |
|---|---|---|
| fastapi | latest | Framework web |
| uvicorn | latest | Servidor ASGI |
| pydantic + pydantic-settings | latest | Validação + config |
| motor + pymongo[srv] | latest | MongoDB async |
| httpx | latest | HTTP client async (brapi, FMP) |
| python-jose[cryptography] | latest | JWT |
| bcrypt | latest | Hash de senhas |
| authlib | latest | Google OAuth |
| brapi | 1.2.0 | SDK brapi (instalada, usamos httpx direto) |
| yfinance | latest | Fallback (não importado ativamente) |
| pandas, numpy | latest | Processamento de dados |
| beautifulsoup4, lxml | latest | Scraping Fundamentus (legado) |
| openpyxl | latest | Parser XLS/XLSX da XP |
| python-dotenv | latest | .env loader |
| email-validator | latest | Validação de email |

### Frontend (Node)

| Pacote | Uso |
|---|---|
| react + react-dom | UI |
| react-router-dom | Rotas SPA |
| @tanstack/react-query | Cache + fetching |
| axios | HTTP client |
| recharts | Gráficos (Area, Bar) |
| lucide-react | Ícones |
| tailwindcss + @tailwindcss/vite | CSS utility-first |
| typescript | Tipagem |
| vite + @vitejs/plugin-react | Bundler |

---

## 9. Conta do App

- Email: ynimodazuos@gmail.com
- Senha: invest2026

---

## 10. O que cada arquivo faz (referência rápida)

### Backend

| Arquivo | Responsabilidade |
|---|---|
| `main.py` | Cria FastAPI, CORS, monta routers, health check |
| `config.py` | Carrega .env em Settings (Pydantic) |
| `database.py` | Conecta MongoDB, cria índices |
| `routers/auth.py` | Register, login, Google OAuth, /me |
| `routers/assets.py` | Busca, detalhe, cotação, histórico |
| `routers/analysis.py` | Score por ticker, pesos do usuário |
| `routers/portfolio.py` | CRUD posições, import XP, transações |
| `routers/compare.py` | Comparação lado a lado |
| `routers/watchlist.py` | CRUD watchlist |
| `routers/report.py` | Relatório completo de análise |
| `services/analysis_engine.py` | Orquestra fetch de dados + monta FundamentalData |
| `services/scoring.py` | Calcula score 0-100 multidimensional |
| `services/report_service.py` | Gera relatório de 49 ativos com recomendação |
| `services/portfolio_service.py` | Monta resumo do portfolio com preços live |
| `services/data_providers/brapi.py` | Todos os endpoints brapi (quote, fund, hist, macro) |
| `services/data_providers/fmp.py` | Todos os endpoints FMP (DCF, scores, analyst, tech) |
| `services/data_providers/fundamentus.py` | Scraping Fundamentus (legado, não importado) |
| `services/data_providers/yfinance_provider.py` | yfinance wrapper (legado, não importado) |
| `models/user.py` | CRUD MongoDB collection users |
| `models/portfolio.py` | CRUD positions + transactions |
| `models/watchlist.py` | CRUD watchlist |
| `models/cache.py` | Get/upsert scoring_config |
| `schemas/asset.py` | FundamentalData (60+ campos), AssetDetail, ScoreResult |
| `schemas/analysis.py` | ScoringWeights, CompareResult, FullReport |
| `schemas/portfolio.py` | Position/Transaction/Watchlist DTOs |
| `utils/auth.py` | bcrypt, JWT, get_current_user, Google verify |
| `utils/cache.py` | Cache MongoDB com TTL |
| `utils/xp_parser.py` | Parser de extrato XP (CSV/XLSX) |

### Frontend

| Arquivo | Responsabilidade |
|---|---|
| `main.tsx` | Mount React no DOM |
| `App.tsx` | QueryClient, AuthProvider, BrowserRouter, rotas |
| `index.css` | Tailwind import + custom tokens (cores, fontes) |
| `contexts/AuthContext.tsx` | Estado auth: user, token, login/logout |
| `services/api.ts` | Axios + interceptors + todos os módulos de API |
| `types/index.ts` | Interfaces TS espelhando backend |
| `pages/DashboardPage.tsx` | Home: investido, atual, P&L, alocação |
| `pages/ReportPage.tsx` | Relatório: macro, carteira, análise por categoria |
| `pages/SearchPage.tsx` | Busca com debounce |
| `pages/AssetDetailPage.tsx` | Detalhe: gráfico, score, indicadores, peers |
| `pages/PortfolioPage.tsx` | Posições, importar extrato XP |
| `pages/ComparePage.tsx` | Comparar ativos |
| `pages/WatchlistPage.tsx` | Lista de acompanhamento |
| `pages/SettingsPage.tsx` | Pesos de scoring |
| `pages/LoginPage.tsx` | Formulário login |
| `pages/RegisterPage.tsx` | Formulário cadastro |
| `pages/GoogleCallbackPage.tsx` | OAuth callback |
| `components/Layout/AppLayout.tsx` | Navbar + Outlet |
| `components/Layout/Navbar.tsx` | Navegação top: links + logout |
| `components/common/Badge.tsx` | Label de tipo de ativo |
| `components/common/Card.tsx` | Container visual |
| `components/common/Loading.tsx` | Spinner |
| `components/common/MetricCard.tsx` | Indicador com cor |
| `components/common/ScoreGauge.tsx` | Score visual 0-100 |
