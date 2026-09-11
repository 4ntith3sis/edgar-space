-- Backfill: store_settings table existed in the legacy database (via db push)
-- but was never captured in migration history. Additive only, non-destructive.
-- Safe to apply on an empty or existing Supabase database.

-- CreateTable
CREATE TABLE IF NOT EXISTS "store_settings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "storeName" TEXT NOT NULL DEFAULT 'Edgar Space',
  "whatsappNumber" TEXT NOT NULL DEFAULT '6281234567890',
  "email" TEXT NOT NULL DEFAULT 'hello@edgarspace.com',
  "address" TEXT NOT NULL DEFAULT 'Bandung, Jawa Barat, Indonesia',
  "description" TEXT DEFAULT 'Showroom furnitur dan dekorasi rumah bergaya hangat, natural, dan modern.',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
