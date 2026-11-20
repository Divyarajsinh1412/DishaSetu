/**
 * Centralized API Configuration for DishaSetu
 * Presidency University Bengaluru Campus Navigation Platform
 */

// Read VITE_API_BASE_URL or VITE_API_URL from environment variables
const envApiUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim()
  : '';

/**
 * Resolves the active backend API base URL
 */
export const API_BASE_URL = (() => {
  if (typeof window !== 'undefined' && window.location) {
    // When running locally on Vite dev server (port 5173) or local backend (port 5000),
    // use relative path so requests go through local Vite proxy or local server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (envApiUrl && (envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1'))) {
        return envApiUrl.replace(/\/+$/, '');
      }
      return '';
    }
  }

  if (envApiUrl && envApiUrl !== '') {
    return envApiUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    if (window.location.origin) {
      return window.location.origin;
    }
  }

  // Fallback to official deployed Render backend
  return 'https://dishasetu-jx71.onrender.com';
})();

export const VITE_API_BASE_URL = API_BASE_URL;

/**
 * Builds a fully qualified API endpoint URL
 * @param {string} endpoint - Relative path (e.g., '/api/locations')
 * @returns {string} Fully qualified URL or proxied relative path
 */
export const getApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL || '/';
  // If endpoint is already an absolute URL, return as-is
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Centralized, resilient HTTP client for all frontend API calls
 * Features:
 * - Automatic base URL resolution
 * - Automatic Authorization header injection
 * - Request timeout via AbortController (default 12s)
 * - Safe JSON parsing with fallback
 * - Standardized error reporting
 */
export const apiFetch = async (endpoint, options = {}) => {
  const {
    timeout = 12000,
    headers = {},
    token,
    ...fetchOptions
  } = options;

  const url = getApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Retrieve auth token from options or localStorage
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('dishasetu_admin_token') : null);

  const requestHeaders = {
    'Accept': 'application/json',
    ...headers
  };

  // If sending body and Content-Type not explicitly set, set application/json
  if (fetchOptions.body && !requestHeaders['Content-Type'] && !(fetchOptions.body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (authToken && !requestHeaders['Authorization']) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parse response
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseErr) {
        console.warn(`[API] Failed to parse JSON response from ${endpoint}:`, parseErr.message);
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && typeof data === 'object' && (data.message || data.error)) ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request to ${endpoint} timed out after ${timeout}ms`);
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  }
};

export default {
  API_BASE_URL,
  getApiUrl,
  apiFetch
};
