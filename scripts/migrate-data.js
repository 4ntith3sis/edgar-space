/**
 * Copy structured data from legacy Neon (.env file) to Supabase (.env.local).
 * READ-ONLY on source. Never drops, resets, or deletes anything.
 *
 *   node scripts/migrate-data.js            # dry-run: compare counts, print plan
 *   node scripts/migrate-data.js --apply    # copy rows (upsert by id), fix sequences, verify
 *
 * Source = DATABASE_URL parsed from the `.env` FILE (legacy Neon).
 * Target = process DATABASE_URL after loadEnv (must be `.env.local` Supabase).
 * Aborts unless source provider is neon AND target provider is supabase.
 * Aborts on non-empty target unless --force (merge by id, still non-destructive).
 */
require('../server/utils/loadEnv').loadEnv();
const fs = require('fs');
const dotenv = require('dotenv');

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');

function providerOf(url) {
  try {
    const h = new URL(url).hostname;
    if (h.includes('supabase.co')) return 'supabase';
    if (h.includes('neon.tech')) return 'neon';
    return 'other-host';
  } catch {
    return 'unparseable';
  }
}

async function counts(prisma) {
  const [admins, categories, products, stockMovements, storeSettings] = await Promise.all([
    prisma.admin.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.stockMovement.count(),
    prisma.storeSetting.count()
  ]);
  return { admins, categories, products, stockMovements, storeSettings };
}

async function main() {
  // Source strictly from `.env` FILE (never from process env, never printed).
  const fileEnv = dotenv.parse(fs.readFileSync('.env', 'utf8'));
  const sourceUrl = fileEnv.DATABASE_URL || '';
  const targetUrl = process.env.DATABASE_URL || '';

  const sourceProvider = providerOf(sourceUrl);
  const targetProvider = providerOf(targetUrl);
  console.log(`source provider: ${sourceProvider}, target provider: ${targetProvider}`);
  if (!sourceUrl || !targetUrl || sourceUrl === targetUrl) {
    throw new Error('Source/target misconfigured. Source must be legacy Neon (.env file), target Supabase (.env.local).');
  }
  if (sourceProvider !== 'neon' || targetProvider !== 'supabase') {
    throw new Error('Refusing to copy: source must be neon and target must be supabase.');
  }

  const { PrismaClient } = require('@prisma/client');
  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });
  try {
    const sCounts = await counts(source);
    const tCounts = await counts(target);
    console.log(`source counts: ${JSON.stringify(sCounts)}`);
    console.log(`target counts: ${JSON.stringify(tCounts)}`);
    const targetEmpty = Object.values(tCounts).every((n) => n === 0);
    if (!targetEmpty && !FORCE) {
      throw new Error('Target is not empty. Re-run with --force to merge by id (non-destructive upsert).');
    }
    if (!APPLY) {
      console.log('Dry-run only. Re-run with --apply to copy.');
      return;
    }

    // Copy in FK-safe order, preserving ids and timestamps. No deletes.
    const settings = await source.storeSetting.findMany();
    for (const r of settings) {
      await target.storeSetting.upsert({
        where: { id: r.id },
        update: { storeName: r.storeName, whatsappNumber: r.whatsappNumber, email: r.email, address: r.address, description: r.description },
        create: { id: r.id, storeName: r.storeName, whatsappNumber: r.whatsappNumber, email: r.email, address: r.address, description: r.description }
      });
    }
    const admins = await source.admin.findMany();
    for (const r of admins) {
      await target.admin.upsert({
        where: { id: r.id },
        update: { name: r.name, email: r.email },
        create: { id: r.id, name: r.name, email: r.email, passwordHash: r.passwordHash, createdAt: r.createdAt, updatedAt: r.updatedAt }
      });
    }
    // NOTE: source (Neon) predates imageSource/storagePath columns, so source
    // reads use explicit legacy-column selects. Target fills the new columns
    // by classifying the legacy thumbnail value.
    const { classifyImageUrl } = require('../server/utils/storage');
    const categories = await source.category.findMany({
      select: { id: true, name: true, slug: true, description: true, thumbnail: true, createdAt: true, updatedAt: true }
    });
    for (const r of categories) {
      const classified = classifyImageUrl(r.thumbnail);
      await target.category.upsert({
        where: { id: r.id },
        update: {},
        create: { id: r.id, name: r.name, slug: r.slug, description: r.description, thumbnail: r.thumbnail, imageSource: classified.source, storagePath: classified.storagePath, createdAt: r.createdAt, updatedAt: r.updatedAt }
      });
    }
    const products = await source.product.findMany({
      select: { id: true, name: true, slug: true, description: true, price: true, stock: true, thumbnail: true, images: true, isFeatured: true, categoryId: true, createdAt: true, updatedAt: true }
    });
    for (const r of products) {
      const classified = classifyImageUrl(r.thumbnail);
      await target.product.upsert({
        where: { id: r.id },
        update: {},
        create: { id: r.id, name: r.name, slug: r.slug, description: r.description, price: r.price.toString(), stock: r.stock, thumbnail: r.thumbnail, images: r.images, imageSource: classified.source, storagePath: classified.storagePath, isFeatured: r.isFeatured, categoryId: r.categoryId, createdAt: r.createdAt, updatedAt: r.updatedAt }
      });
    }
    const movements = await source.stockMovement.findMany();
    for (const r of movements) {
      await target.stockMovement.upsert({
        where: { id: r.id },
        update: {},
        create: { id: r.id, productId: r.productId, type: r.type, quantity: r.quantity, previousStock: r.previousStock, newStock: r.newStock, note: r.note, adminId: r.adminId, createdAt: r.createdAt }
      });
    }

    // Repair autoincrement sequences after explicit-id inserts.
    for (const table of ['admins', 'categories', 'products', 'stock_movements']) {
      await target.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"','id'), (SELECT COALESCE(MAX(id),1) FROM "${table}"))`
      );
    }

    const final = await counts(target);
    console.log(`target counts after copy: ${JSON.stringify(final)}`);
    const match = Object.keys(sCounts).every((k) => sCounts[k] === final[k]);
    console.log(`counts match source: ${match}`);
    if (!match) process.exit(2);
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((e) => {
  console.error('Data migration failed:', e.message);
  process.exit(1);
});
