import axios from 'axios';
import type {
  AssetSearch, AssetDetail, ScoreResult, PortfolioSummary,
  PositionResponse, CompareResult, WatchlistItem, ScoringWeights,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, name }).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  googleLogin: (access_token: string) =>
    api.post<AuthResponse>('/auth/google', { access_token }).then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data),
};

export const assetsApi = {
  search: (q: string) =>
    api.get<AssetSearch[]>('/assets/search', { params: { q } }).then(r => r.data),

  getDetail: (ticker: string, period = '1y') =>
    api.get<AssetDetail>(`/assets/${ticker}`, { params: { period } }).then(r => r.data),

  getHistory: (ticker: string, period = '1y') =>
    api.get(`/assets/${ticker}/history`, { params: { period } }).then(r => r.data),
};

export const analysisApi = {
  getScore: (ticker: string) =>
    api.get<ScoreResult>(`/analysis/${ticker}/score`).then(r => r.data),

  getWeights: () =>
    api.get<ScoringWeights>('/analysis/weights').then(r => r.data),

  updateWeights: (weights: ScoringWeights) =>
    api.put<ScoringWeights>('/analysis/weights', weights).then(r => r.data),
};

export const portfolioApi = {
  getSummary: () =>
    api.get<PortfolioSummary>('/portfolio/summary').then(r => r.data),

  getPositions: () =>
    api.get<PositionResponse[]>('/portfolio/positions').then(r => r.data),

  createPosition: (data: { ticker: string; asset_type: string; quantity: number; avg_price: number }) =>
    api.post<PositionResponse>('/portfolio/positions', data).then(r => r.data),

  deletePosition: (id: string) =>
    api.delete(`/portfolio/positions/${id}`).then(r => r.data),

  importFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/portfolio/import', form).then(r => r.data);
  },
};

export const compareApi = {
  compare: (tickers: string[], weights?: ScoringWeights) =>
    api.post<CompareResult[]>('/compare/', { tickers, weights }).then(r => r.data),
};

export const watchlistApi = {
  list: () =>
    api.get<WatchlistItem[]>('/watchlist/').then(r => r.data),

  add: (data: { ticker: string; asset_type: string; target_price?: number; notes?: string }) =>
    api.post<WatchlistItem>('/watchlist/', data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/watchlist/${id}`).then(r => r.data),
};
