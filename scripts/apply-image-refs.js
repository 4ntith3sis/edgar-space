/**
 * Apply Supabase image references to the database from a migration mapping.
 *
 * SAFE BY DEFAULT: dry-run. Pass --apply to actually update rows.
 *
 *   node scripts/apply-image-refs.js            # dry-run: prints planned updates
 *   node scripts/apply-image-refs.js --apply    # writes thumbnail/imageSource/storagePath
 *
 * Input: supabase/migration-mapping.json (from scripts/migrate-uploads.js --apply)
 * Target: DATABASE_URL (must point to Supabase). Verifies counts afterwards.
 */
require('../server/utils/loadEnv').loadEnv();

const APPLY = process.argv.includes('--apply');
const fs = require('fs');
const path = require('path');

async function main() {
  const mapFile = path.join(process.cwd(), 'supabase', 'migration-mapping.json');
  if (!fs.existsSync(mapFile)) {
    throw new Error(`Mapping not found: ${mapFile}. Run scripts/migrate-uploads.js --apply first.`);
  }
  const { mapping } = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const ready = mapping.filter((m) => m.url && m.storagePath);

  console.log(`Mapping entries with Supabase URL: ${ready.length}/${mapping.length}`);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    let updated = 0;
    for (const m of ready) {
      // Guard: only update when the row still points at the old local path
      // (protects admin edits made after the mapping was generated).
      if (m.type === 'product') {
        const row = await prisma.product.findUnique({ where: { id: m.id } });
        if (!row || row.thumbnail !== m.oldPath) {
          console.log(`SKIP product ${m.id}: thumbnail changed since mapping`);
          continue;
        }
        if (APPLY) {
          await prisma.product.update({
            where: { id: m.id },
            data: {
              thumbnail: m.url,
              imageSource: m.source,
              storagePath: m.storagePath,
              images: [m.url]
            }
          });
        }
        updated += 1;
      } else {
        const row = await prisma.category.findUnique({ where: { id: m.id } });
        if (!row || row.thumbnail !== m.oldPath) {
          console.log(`SKIP category ${m.id}: thumbnail changed since mapping`);
          continue;
        }
        if (APPLY) {
          await prisma.category.update({
            where: { id: m.id },
            data: { thumbnail: m.url, imageSource: m.source, storagePath: m.storagePath }
          });
        }
        updated += 1;
      }
    }
    console.log(`${APPLY ? 'Updated' : 'Would update'}: ${updated} rows`);

    // Verification: no /uploads/... references should remain
    const [pLeft, cLeft] = await Promise.all([
      prisma.product.count({ where: { thumbnail: { startsWith: '/uploads/' } } }),
      prisma.category.count({ where: { thumbnail: { startsWith: '/uploads/' } } })
    ]);
    console.log(`Remaining /uploads references — products: ${pLeft}, categories: ${cLeft}`);
    if (APPLY && (pLeft > 0 || cLeft > 0)) {
      console.error('WARNING: some rows still reference /uploads/. Re-run mapping for them.');
      process.exit(2);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Apply failed:', e.message);
  process.exit(1);
});
