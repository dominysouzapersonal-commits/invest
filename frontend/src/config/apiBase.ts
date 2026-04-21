/**
 * Base do backend (sem /api). Em produção, se VITE_API_URL não vier no build
 * (Vercel sem env ou root errado), usa o Render público para não quebrar o site.
 */
const DEFAULT_PROD = 'https://investanalytics-api.onrender.com';

const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ?? '';

export const API_BASE_URL =
  fromEnv || (import.meta.env.PROD ? DEFAULT_PROD : '');
