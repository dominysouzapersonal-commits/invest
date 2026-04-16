# InvestAnalytics

Plataforma web de analise fundamentalista de investimentos com autenticacao, cobrindo acoes BR, FIIs, acoes US, ETFs e BDRs. Deploy no Vercel + Render + MongoDB Atlas.

## Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Recharts (Vercel)
- **Backend**: Python, FastAPI, Motor (Render)
- **Database**: MongoDB Atlas
- **Auth**: JWT + Google OAuth
- **Dados**: brapi.dev, yfinance, Financial Modeling Prep, Fundamentus

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
- New Web Service > conectar repositorio Git
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Adicionar environment variables: `MONGODB_URI`, `BRAPI_TOKEN`, `FMP_API_KEY`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`

### 3. Frontend (Vercel)

- Criar conta em https://vercel.com
- Import > conectar repositorio Git
- Root directory: `frontend`
- Framework: Vite
- Adicionar environment variable: `VITE_API_URL` = URL do Render (ex: `https://investanalytics-api.onrender.com`)
- Opcional: `VITE_GOOGLE_CLIENT_ID` para login com Google

### 4. Google OAuth (opcional)

- Ir em https://console.cloud.google.com
- APIs & Services > Credentials > Create OAuth 2.0 Client ID
- Tipo: Web application
- Authorized redirect URIs: `https://seu-app.vercel.app/auth/google/callback`
- Copiar Client ID e Client Secret para as env vars
