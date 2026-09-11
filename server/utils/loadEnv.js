/**
 * Shared env loader: loads `.env`, then overlays `.env.local` (override).
 * This respects the user's manually-filled `.env.local` (Supabase target)
 * while keeping legacy `.env` as base. Values are never printed here.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  const root = process.cwd();
  const base = path.join(root, '.env');
  const local = path.join(root, '.env.local');
  if (fs.existsSync(base)) dotenv.config({ path: base });
  if (fs.existsSync(local)) dotenv.config({ path: local, override: true });
}

module.exports = { loadEnv };
