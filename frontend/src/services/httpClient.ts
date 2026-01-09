// ============================================
// HTTP Client - Wrapper for fetch with JWT handling
// ============================================

import { API_URL } from './config';

/**
 * Get the stored authentication token.
 */
const getToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * Build headers for API requests.
 */
const buildHeaders = (includeAuth: boolean = true, isFormData: boolean = false): HeadersInit => {
    const headers: HeadersInit = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (includeAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

/**
 * API Error class for handling HTTP errors.
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: unknown
    ) {
        super(`API Error: ${status} ${statusText}`);
        this.name = 'ApiError';
    }
}

/**
 * Parse response based on content type.
 */
const parseResponse = async <T>(response: Response): Promise<T> => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text() as unknown as T;
};

/**
 * Handle API response and errors.
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const data = await parseResponse(response).catch(() => null);
        throw new ApiError(response.status, response.statusText, data);
    }
    return parseResponse<T>(response);
};

/**
 * HTTP GET request.
 */
export const get = async <T>(
    endpoint: string,
    options: { auth?: boolean; params?: Record<string, string> } = {}
): Promise<T> => {
    const { auth = true, params } = options;

    let url = `${API_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(auth),
    });

    return handleResponse<T>(response);
};

/**
 * HTTP POST request.
 */
export const post = async <T>(
    endpoint: string,
    body?: unknown,
    options: { auth?: boolean; isFormData?: boolean } = {}
): Promise<T> => {
    const { auth = true, isFormData = false } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: buildHeaders(auth, isFormData),
        body: isFormData ? (body as FormData) : JSON.stringify(body),
    });

    return handleResponse<T>(response);
};

/**
 * HTTP PUT request.
 */
export const put = async <T>(
    endpoint: string,
    body?: unknown,
    options: { auth?: boolean } = {}
): Promise<T> => {
    const { auth = true } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: buildHeaders(auth),
        body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
};

/**
 * HTTP DELETE request.
 */
export const del = async <T>(
    endpoint: string,
    options: { auth?: boolean } = {}
): Promise<T> => {
    const { auth = true } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: buildHeaders(auth),
    });

    return handleResponse<T>(response);
};

/**
 * HTTP PATCH request.
 */
export const patch = async <T>(
    endpoint: string,
    body?: unknown,
    options: { auth?: boolean } = {}
): Promise<T> => {
    const { auth = true } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: buildHeaders(auth),
        body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
};

/**
 * HTTP client object with all methods.
 */
export const httpClient = {
    get,
    post,
    put,
    patch,
    delete: del,
};

export default httpClient;

