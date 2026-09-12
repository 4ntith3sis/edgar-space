const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://edgar-space.vercel.app/api';

/**
 * Standard API fetch wrapper with cookie credentials and JSON handling
 * @param {string} endpoint
 * @param {RequestInit} [options={}]
 */
export async function fetchApi(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (typeof window !== 'undefined') {
    url = `/api${cleanEndpoint}`;
  } else {
    url = `${API_BASE_URL}${cleanEndpoint}`;
  }

  const headers = {
    ...(options.headers || {})
  };

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  try {
    const response = await fetch(url, config);

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        result.message ||
          `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.data = result;

      throw error;
    }

    return result;
  } catch (err) {
    if (!err.status) {
      console.error('[API Network Error]:', err);
    }

    throw err;
  }
}

/**
 * Helper to resolve image URLs — SUPABASE STORAGE FIRST.
 * Priority:
 *  1. image_url from Supabase database (Supabase Storage public URL,
 *     Unsplash URL, or any external URL) — returned as-is
 *  2. legacy upload paths starting with "/uploads/..."
 *  3. returns empty string if path is null/undefined/empty
 */
export function getImageUrl(path) {
  if (typeof path !== 'string' || !path.trim() || path === 'null' || path === 'undefined') {
    return '';
  }

  const cleanPath = path.trim();

  if (cleanPath === 'null' || cleanPath === 'undefined' || !cleanPath) {
    return '';
  }

  // URL database langsung digunakan (Supabase Storage / Unsplash / eksternal)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Legacy upload path
  if (cleanPath.startsWith('/uploads/')) {
    return cleanPath;
  }

  // Local absolute paths
  if (cleanPath.startsWith('/')) {
    return cleanPath;
  }

  return cleanPath;
}

