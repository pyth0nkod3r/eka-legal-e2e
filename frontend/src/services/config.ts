// ============================================
// API Configuration
// ============================================

/**
 * Detect if running in Docker/production where nginx proxies /api to backend
 * When accessed via port 8080, we use the nginx proxy (/api/v1)
 * When accessed via port 5173 (dev), we call backend directly
 */
const isProxied = typeof window !== 'undefined' && window.location.port === '8080';

/**
 * Base URL for the API.
 * In Docker/production (port 8080): use relative path for nginx proxy
 * In development (port 5173): use localhost:8000
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isProxied ? '' : 'http://localhost:8000');

/**
 * API version prefix.
 */
export const API_VERSION = '/api/v1';

/**
 * Full API URL combining base URL and version.
 */
export const API_URL = `${API_BASE_URL}${API_VERSION}`;
