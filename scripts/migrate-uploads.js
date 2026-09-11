/**
 * Migrate referenced files from public/uploads → Supabase Storage.
 *
 * SAFE BY DEFAULT: dry-run. Pass --apply to actually upload.
 *
 *   node scripts/migrate-uploads.js            # dry-run: prints plan + writes mapping with null urls
 *   node scripts/migrate-uploads.js --apply    # uploads + writes supabase/migration-mapping.json
 *
 * Prerequisites:
 *   - DATABASE_URL points to the TARGET database (Supabase, after data migration)
 *   - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY set (server env, never committed)
 *   - Buckets created via supabase/storage.sql
 *
 * Rules:
 *   - Only files REFERENCED by DB thumbnails are migrated (21 of 50).
 *     Unreferenced (orphan) disk files are listed, never uploaded, never deleted.
 *   - Filenames containing chatgpt/ai markers are tagged source='ai', else 'upload'.
 *   - Layout: <bucket>/<entityId>/<timestamp>-<rand>-<clean>.<ext>
 *   - DB is NOT touched here; run scripts/apply-image-refs.js afterwards.
 */
const fs = require('fs');
const path = require('path');
require('../server/utils/loadEnv').loadEnv();

const APPLY = process.argv.includes('--apply');

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, thumbnail: true }
    });
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, thumbnail: true }
    });

    const refs = [
      ...products.filter((p) => p.thumbnail && p.thumbnail.startsWith('/uploads/'))
        .map((p) => ({ type: 'product', bucket: 'products', id: p.id, slug: p.slug, oldPath: p.thumbnail })),
      ...categories.filter((c) => c.thumbnail && c.thumbnail.startsWith('/uploads/'))
        .map((c) => ({ type: 'category', bucket: 'categories', id: c.id, slug: c.slug, oldPath: c.thumbnail }))
    ];

    console.log(`DB references to /uploads: ${refs.length}`);

    let supabase = null;
    let baseUrl = null;
    if (APPLY) {
      const { getSupabaseAdmin, getSupabasePublicBaseUrl } = require('../server/utils/supabaseAdmin');
      supabase = getSupabaseAdmin(); // throws when env missing
      baseUrl = getSupabasePublicBaseUrl();
    }

    const mapping = [];
    const problems = [];
    for (const ref of refs) {
      const diskPath = path.join(process.cwd(), 'public', ref.oldPath.replace(/^\//, ''));
      if (!fs.existsSync(diskPath)) {
        problems.push({ ...ref, error: 'FILE_MISSING_ON_DISK' });
        continue;
      }
      const source = /chatgpt|dall|midjourney|\bai\b|gemini|firefly/i.test(path.basename(diskPath))
        ? 'ai'
        : 'upload';
      const ext = path.extname(diskPath).toLowerCase();
      const clean = path.basename(diskPath, ext).toLowerCase()
        .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30);
      const objectPath = `${ref.id}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${clean}${ext}`;

      if (!APPLY) {
        mapping.push({ ...ref, source, objectPath, storagePath: `${ref.bucket}/${objectPath}`, url: null });
        continue;
      }

      const buffer = fs.readFileSync(diskPath);
      const contentType =
        ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const { error } = await supabase.storage.from(ref.bucket).upload(objectPath, buffer, {
        contentType,
        upsert: false
      });
      if (error) {
        problems.push({ ...ref, error: `UPLOAD_FAILED: ${error.message}` });
        continue;
      }
      const { data } = supabase.storage.from(ref.bucket).getPublicUrl(objectPath);
      mapping.push({
        ...ref,
        source,
        objectPath,
        storagePath: `${ref.bucket}/${objectPath}`,
        url: data.publicUrl
      });
      console.log(`OK ${ref.oldPath} -> ${ref.bucket}/${objectPath} [${source}]`);
    }

    // Orphan disk files (safety report only)
    const diskFiles = [];
    for (const d of ['products', 'categories']) {
      const dir = path.join(process.cwd(), 'public', 'uploads', d);
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((f) => diskFiles.push(`/uploads/${d}/${f}`));
      }
    }
    const refSet = new Set(refs.map((r) => r.oldPath));
    const orphans = diskFiles.filter((f) => !refSet.has(f));

    const outDir = path.join(process.cwd(), 'supabase');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const mapFile = path.join(outDir, 'migration-mapping.json');
    fs.writeFileSync(mapFile, JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', mapping, problems, orphans }, null, 1));

    console.log(`Mapping written: ${mapFile}`);
    console.log(`Migrated: ${mapping.filter((m) => m.url).length}/${refs.length}, problems: ${problems.length}`);
    console.log(`Orphan disk files (not migrated, not deleted): ${orphans.length}`);
    if (problems.length) console.log(JSON.stringify(problems, null, 1));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
