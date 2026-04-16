export interface AssetSearch {
  ticker: string;
  name: string;
  asset_type: string;
  exchange: string;
  currency: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundamentalData {
  ticker: string;
  name: string;
  asset_type: string;
  sector?: string;
  industry?: string;
  currency: string;
  price?: number;
  change_percent?: number;
  market_cap?: number;
  volume?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  ev_ebitda?: number;
  psr?: number;
  price_to_assets?: number;
  roe?: number;
  roa?: number;
  roic?: number;
  net_margin?: number;
  ebitda_margin?: number;
  gross_margin?: number;
  revenue_growth_1y?: number;
  revenue_growth_3y?: number;
  revenue_growth_5y?: number;
  profit_growth_1y?: number;
  profit_growth_3y?: number;
  profit_growth_5y?: number;
  dividend_yield?: number;
  payout_ratio?: number;
  dividend_consistency?: number;
  net_debt_ebitda?: number;
  net_debt_equity?: number;
  current_ratio?: number;
  avg_volume?: number;
  volatility?: number;
  beta?: number;
  high_52w?: number;
  low_52w?: number;
  fii_type?: string;
  vacancy_rate?: number;
  cap_rate?: number;
  peg_ratio?: number;
  price_to_fcf?: number;
  operating_margin?: number;
  quick_ratio?: number;
  interest_coverage?: number;
  altman_z_score?: number;
  piotroski_score?: number;
  recommendation_key?: string;
  target_mean_price?: number;
  number_of_analysts?: number;
  peers?: string[];
}

export interface ScoreResult {
  total_score: number;
  recommendation: string;
  valuation_score: number;
  profitability_score: number;
  dividends_score: number;
  debt_score: number;
  growth_score: number;
  details: Record<string, Record<string, { value: number; score: number }>>;
}

export interface AssetDetail {
  fundamentals: FundamentalData;
  historical_prices: HistoricalPrice[];
  score?: ScoreResult;
}

export interface PositionResponse {
  id: string;
  ticker: string;
  asset_type: string;
  quantity: number;
  avg_price: number;
  currency: string;
  broker: string;
  current_price?: number;
  current_value?: number;
  profit_loss?: number;
  profit_loss_pct?: number;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current: number;
  total_profit_loss: number;
  total_profit_loss_pct: number;
  positions: PositionResponse[];
  allocation_by_type: Record<string, number>;
  allocation_by_sector: Record<string, number>;
}

export interface CompareResult {
  ticker: string;
  name: string;
  asset_type: string;
  price?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  roe?: number;
  dividend_yield?: number;
  net_debt_ebitda?: number;
  score: number;
  recommendation: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  asset_type: string;
  target_price?: number;
  target_score?: number;
  notes?: string;
  alert_enabled: boolean;
  current_price?: number;
  current_score?: number;
}

export interface ScoringWeights {
  weight_valuation: number;
  weight_profitability: number;
  weight_dividends: number;
  weight_debt: number;
  weight_growth: number;
}

export const ASSET_TYPE_LABELS: Record<string, string> = {
  br_stock: 'Ação BR',
  fii: 'FII',
  us_stock: 'Ação US',
  us_etf: 'ETF US',
  bdr: 'BDR',
};

export const RECOMMENDATION_COLORS: Record<string, string> = {
  'Excelente oportunidade': 'text-emerald-400',
  'Bom investimento': 'text-green-400',
  'Neutro': 'text-yellow-400',
  'Cautela': 'text-orange-400',
  'Evitar': 'text-red-400',
};
