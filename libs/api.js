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
 * Helper to resolve image URLs — DATABASE FIRST.
 * Priority:
 *  1. image_url from Supabase database (Supabase Storage public URL,
 *     Unsplash URL, or any external URL) — returned as-is
 *  2. legacy local "/uploads/..." path (backward compat during migration)
 *  3. static local fallback "/images/products/<slug>.svg"
 *  4. global placeholder "/images/placeholder.svg"
 *
 * New uploads NEVER produce "/uploads/..." — they return Supabase Storage URLs.
 */
export function getImageUrl(path, slug) {
  if (!path || path === 'null' || path === 'undefined') {
    if (slug) return `/images/products/${slug}.svg`;
    return '/images/placeholder.svg';
  }

  // URL database langsung digunakan (Supabase Storage / Unsplash / eksternal)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Legacy local upload (masa transisi migrasi ke Supabase Storage)
  if (path.startsWith('/uploads/')) {
    return path;
  }

  return path;
}
