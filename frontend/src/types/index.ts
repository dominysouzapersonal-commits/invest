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
  description?: string;
  logo_url?: string;
  price?: number;
  change_percent?: number;
  market_cap?: number;
  volume?: number;
  pe_ratio?: number;
  forward_pe?: number;
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
  ebitda_growth_1y?: number;
  eps_growth_1y?: number;
  fcf_growth_1y?: number;
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
  ev_revenue?: number;
  operating_margin?: number;
  quick_ratio?: number;
  interest_coverage?: number;
  debt_to_equity?: number;
  debt_to_assets?: number;
  altman_z_score?: number;
  piotroski_score?: number;
  dcf_value?: number;
  dcf_upside_pct?: number;
  recommendation_key?: string;
  recommendation_mean?: number;
  target_mean_price?: number;
  target_high_price?: number;
  target_low_price?: number;
  number_of_analysts?: number;
  grades_consensus?: Record<string, any>;
  price_target_consensus?: Record<string, any>;
  rsi_14?: number;
  sma_50?: number;
  sma_200?: number;
  eps?: number;
  book_value_per_share?: number;
  fcf_per_share?: number;
  earnings_yield?: number;
  fcf_yield?: number;
  peers?: string[];
  recent_news?: Array<Record<string, any>>;
  insider_trades?: Array<Record<string, any>>;
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
  br_etf: 'ETF BR',
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

export interface AssetAnalysis {
  ticker: string;
  name: string;
  asset_type: string;
  sector?: string;
  price?: number;
  currency: string;
  market_cap?: number;
  logo_url?: string;
  score: number;
  recommendation: string;
  valuation_score: number;
  profitability_score: number;
  dividends_score: number;
  debt_score: number;
  growth_score: number;
  pe_ratio?: number;
  pb_ratio?: number;
  ev_ebitda?: number;
  roe?: number;
  roic?: number;
  net_margin?: number;
  dividend_yield?: number;
  net_debt_ebitda?: number;
  current_ratio?: number;
  revenue_growth_1y?: number;
  profit_growth_1y?: number;
  piotroski_score?: number;
  altman_z_score?: number;
  dcf_value?: number;
  dcf_upside_pct?: number;
  recommendation_key?: string;
  target_mean_price?: number;
  rsi_14?: number;
  why_yes?: string;
  why_no?: string;
}

export interface CategoryRecommendation {
  category: string;
  category_label: string;
  target_pct: number;
  target_amount: number;
  assets: AssetAnalysis[];
  top_pick?: string;
  rationale: string;
}

export interface MacroData {
  selic_current?: number;
  ipca_current?: number;
  usd_brl?: number;
  eur_brl?: number;
}

export interface FullReport {
  generated_at: string;
  investor_profile: Record<string, any>;
  macro: MacroData;
  total_assets_analyzed: number;
  categories: CategoryRecommendation[];
  all_assets: AssetAnalysis[];
  portfolio_summary: Record<string, any>;
  methodology: string;
}
