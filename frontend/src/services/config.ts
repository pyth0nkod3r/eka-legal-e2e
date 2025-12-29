// ============================================
// API Configuration
// ============================================

/**
 * Base URL for the API.
 * Defaults to localhost:8000 for development.
 * Can be overridden via VITE_API_BASE_URL environment variable.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * API version prefix.
 */
export const API_VERSION = '/api/v1';

/**
 * Full API URL combining base URL and version.
 */
export const API_URL = `${API_BASE_URL}${API_VERSION}`;
