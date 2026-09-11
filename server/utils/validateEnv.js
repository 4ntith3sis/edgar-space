/**
 * Environment validation — SAFE BY DESIGN.
 * Error messages mention ONLY variable names, never values.
 * Never console.log / return process.env values from here.
 */

const REQUIRED_SERVER_ENV = [
  'DATABASE_URL', // Supabase PostgreSQL (Prisma)
  'SUPABASE_SERVICE_ROLE_KEY', // Supabase privileged ops (server-only)
  'JWT_SECRET' // Admin session signing
];

const REQUIRED_PUBLIC_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL', // Supabase project URL (browser-safe)
  'NEXT_PUBLIC_SUPABASE_ANON_KEY' // Supabase anon key (browser-safe, RLS-limited)
];

function missingEnvVars(names) {
  return names.filter((name) => {
    const value = process.env[name];
    return !value || String(value).trim() === '';
  });
}

function validateServerEnv() {
  const missing = missingEnvVars([...REQUIRED_SERVER_ENV, ...REQUIRED_PUBLIC_ENV]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Silakan isi sendiri di `.env.local` (development) atau Vercel Dashboard (production).'
    );
  }
}

module.exports = { REQUIRED_SERVER_ENV, REQUIRED_PUBLIC_ENV, missingEnvVars, validateServerEnv };
