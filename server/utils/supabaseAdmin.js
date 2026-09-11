/**
 * Supabase ADMIN client — SERVER ONLY (Express handlers, scripts, server utils).
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS. NEVER import this file
 * from client components or expose it via NEXT_PUBLIC_*.
 *
 * Required env (server):
 *   SUPABASE_URL (fallback: NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require('@supabase/supabase-js');

let cached = null;

function getSupabaseAdmin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-side only).'
    );
  }
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

function getSupabasePublicBaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Supabase URL env missing. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.');
  }
  return url.replace(/\/$/, '');
}

module.exports = { getSupabaseAdmin, getSupabasePublicBaseUrl };
