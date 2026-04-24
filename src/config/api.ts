/**
 * API base URL. Use server IP while domain is expired; set VITE_API_URL in .env to override.
 * Example: VITE_API_URL=https://api.unlimitedhealthcares.com/api or https://api.unlimitedhealthcares.com/api
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  'https://healthcare-backend-8tfs.onrender.com/api';
