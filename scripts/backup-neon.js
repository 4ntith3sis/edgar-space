/**
 * Backup existing (Neon) data to a JSON file — READ ONLY, no writes.
 * Excludes secrets (passwordHash never exported).
 *
 * Usage:
 *   node scripts/backup-neon.js            # uses current DATABASE_URL (Neon)
 *
 * Output: backups/neon-backup-<timestamp>.json
 */
const fs = require('fs');
const path = require('path');
require('../server/utils/loadEnv').loadEnv();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [admins, categories, products, stockMovements, storeSettings] = await Promise.all([
    prisma.admin.findMany({ select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } }),
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.stockMovement.findMany(),
    prisma.storeSetting.findMany()
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    source: 'DATABASE_URL (Neon, pre-migration)',
    counts: {
      admins: admins.length,
      categories: categories.length,
      products: products.length,
      stockMovements: stockMovements.length,
      storeSettings: storeSettings.length
    },
    admins,
    categories,
    products: products.map((p) => ({ ...p, price: p.price != null ? String(p.price) : null })),
    stockMovements,
    storeSettings
  };

  const dir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `neon-backup-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`Backup written: ${file}`);
  console.log(`Counts: ${JSON.stringify(backup.counts)}`);
}

main()
  .catch((e) => {
    console.error('Backup failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
