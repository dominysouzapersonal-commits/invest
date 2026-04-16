# InvestAnalytics

Plataforma web de análise fundamentalista de investimentos com autenticação, cobrindo ações BR, FIIs, ações US, ETFs e BDRs. Deploy no Vercel + Render + MongoDB Atlas.

## Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Recharts (Vercel)
- **Backend**: Python, FastAPI, Motor (Render)
- **Database**: MongoDB Atlas
- **Auth**: JWT + Google OAuth
- **Dados**: brapi.dev (Premium), Financial Modeling Prep (Pago)

## Documentação

| Documento | Descrição |
|---|---|
| [`docs/PROJETO_COMPLETO.md`](docs/PROJETO_COMPLETO.md) | **Documentação completa do projeto** (stack, endpoints, arquivos, fluxos, deploy) |
| [`docs/METODOLOGIA_INVESTIMENTOS.md`](docs/METODOLOGIA_INVESTIMENTOS.md) | Metodologia de análise de investimentos (10 critérios, pesos, benchmarks) |
| [`docs/RELATORIO_COMPLETO.md`](docs/RELATORIO_COMPLETO.md) | Relatório de análise de 77 ativos com carteira sugerida para R$ 6.700 |
| [`docs/BRAPI_REFERENCE.md`](docs/BRAPI_REFERENCE.md) | Referência da API brapi.dev (endpoints, módulos, SDK) |
| [`docs/FMP_REFERENCE.md`](docs/FMP_REFERENCE.md) | Referência da API FMP (150+ endpoints, 26 categorias) |

## Desenvolvimento Local

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # preencher com suas keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deploy

### 1. MongoDB Atlas

- Criar cluster free em https://cloud.mongodb.com
- Copiar connection string (`mongodb+srv://...`)
- Em Network Access, liberar `0.0.0.0/0`

### 2. Backend (Render)

- Criar conta em https://render.com
- New Web Service > conectar repositório Git
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Adicionar environment variables: `MONGODB_URI`, `BRAPI_TOKEN`, `FMP_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`

### 3. Frontend (Vercel)

- Criar conta em https://vercel.com
- Import > conectar repositório Git
- Root directory: `frontend`
- Framework: Vite
- Adicionar environment variable: `VITE_API_URL` = URL do Render
