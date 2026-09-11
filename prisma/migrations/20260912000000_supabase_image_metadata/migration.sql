-- Supabase image metadata (backward-compatible: nullable columns only, no data loss)
-- Apply to Supabase PostgreSQL AFTER pointing DATABASE_URL to Supabase.
-- Do NOT apply to Neon before backup. Safe to apply on Supabase: ADD COLUMN is non-blocking.

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "imageSource" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "storagePath" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "imageSource" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "storagePath" TEXT;
