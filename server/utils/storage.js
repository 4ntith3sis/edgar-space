/**
 * Supabase Storage helper — SERVER ONLY (uses service role via supabaseAdmin).
 *
 * Buckets (public, one per entity type):
 *   products | categories | banners
 * Object layout (collision-safe):
 *   <bucket>/<entityId|tmp>/<timestamp>-<rand>-<clean-name>.<ext>
 * storagePath stored in DB = "<bucket>/<object-path>"
 *   e.g. "products/12/1787794300-123456789-thumb.webp"
 *
 * Rules:
 * - Only Supabase-hosted objects are ever deleted. Unsplash/external URLs are
 *   never touched (only their DB reference is removed).
 * - Allowed: jpg/jpeg/png/webp, max 5MB, MIME + extension both validated.
 */
const path = require('path');
const { getSupabaseAdmin, getSupabasePublicBaseUrl } = require('./supabaseAdmin');

const PUBLIC_BUCKETS = ['products', 'categories', 'banners'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (same as previous Multer limit)
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

function validateImageFile(file) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    const err = new Error('File gambar tidak ditemukan.');
    err.statusCode = 400;
    throw err;
  }
  if (file.buffer.length > MAX_FILE_SIZE) {
    const err = new Error('Ukuran file maksimal 5MB.');
    err.statusCode = 400;
    throw err;
  }
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_MIME.includes(file.mimetype) || !ALLOWED_EXT.includes(ext)) {
    const err = new Error('Format file tidak didukung. Harap unggah file JPG, JPEG, PNG, atau WEBP.');
    err.statusCode = 400;
    throw err;
  }
  return ext;
}

function cleanBaseName(originalname, ext) {
  return (
    path
      .basename(originalname || 'image', ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30) || 'image'
  );
}

function resolveBucket(folder) {
  const bucket = PUBLIC_BUCKETS.includes(folder) ? folder : 'products';
  return bucket;
}

/**
 * Upload a memory-buffered file to Supabase Storage.
 * @param {{buffer: Buffer, originalname: string, mimetype: string}} file (multer memoryStorage)
 * @param {{bucket?: string, entityId?: number|string|null, source?: 'upload'|'ai'}} opts
 * @returns {Promise<{url: string, storagePath: string, source: string, bucket: string, objectPath: string}>}
 */
async function uploadImageToStorage(file, opts = {}) {
  const ext = validateImageFile(file);
  const bucket = resolveBucket(opts.bucket);
  const folder = opts.entityId ? String(opts.entityId) : 'tmp';
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const objectPath = `${folder}/${unique}-${cleanBaseName(file.originalname, ext)}${ext}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  });
  if (error) {
    const err = new Error(`Gagal mengunggah gambar: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return {
    url: data.publicUrl,
    storagePath: `${bucket}/${objectPath}`,
    source: opts.source || 'upload',
    bucket,
    objectPath
  };
}

/**
 * Parse a DB thumbnail value into { bucket, objectPath } if it points to our Supabase Storage.
 * Returns null for Unsplash/external/legacy-local/null values (never delete those).
 * @param {string|null} thumbnail
 */
function parseStorageRef(thumbnail) {
  if (!thumbnail || typeof thumbnail !== 'string') return null;
  let base;
  try {
    base = getSupabasePublicBaseUrl();
  } catch {
    return null;
  }
  const prefix = `${base}/storage/v1/object/public/`;
  if (!thumbnail.startsWith(prefix)) return null;
  const rest = thumbnail.slice(prefix.length); // "<bucket>/<object-path>"
  const sep = rest.indexOf('/');
  if (sep === -1) return null;
  const bucket = rest.slice(0, sep);
  const objectPath = rest.slice(sep + 1);
  if (!PUBLIC_BUCKETS.includes(bucket) || !objectPath) return null;
  return { bucket, objectPath };
}

/**
 * Parse an explicit storagePath value ("<bucket>/<object-path>").
 */
function parseStoragePath(storagePath) {
  if (!storagePath || typeof storagePath !== 'string') return null;
  const sep = storagePath.indexOf('/');
  if (sep === -1) return null;
  const bucket = storagePath.slice(0, sep);
  const objectPath = storagePath.slice(sep + 1);
  if (!PUBLIC_BUCKETS.includes(bucket) || !objectPath) return null;
  return { bucket, objectPath };
}

/**
 * Resolve the storage object for a record, preferring explicit storagePath,
 * falling back to parsing the thumbnail URL.
 */
function resolveRecordStorage({ thumbnail, storagePath }) {
  return parseStoragePath(storagePath) || parseStorageRef(thumbnail);
}

/**
 * Classify a thumbnail string coming from admin input (URL or legacy path).
 * @returns {{source: string|null, storagePath: string|null}}
 *   upload   — our Supabase Storage URL (storagePath = "<bucket>/<path>")
 *   unsplash — images.unsplash.com URL (kept as-is, never uploaded/deleted)
 *   external — any other http(s) URL (kept as-is)
 *   null     — empty/legacy-local value (kept as-is for backward compatibility)
 */
function classifyImageUrl(thumbnail) {
  if (!thumbnail || thumbnail === 'null' || thumbnail === 'undefined') {
    return { source: null, storagePath: null };
  }
  const stored = parseStorageRef(thumbnail);
  if (stored) {
    return { source: 'upload', storagePath: `${stored.bucket}/${stored.objectPath}` };
  }
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    if (thumbnail.includes('images.unsplash.com')) {
      return { source: 'unsplash', storagePath: null };
    }
    return { source: 'external', storagePath: null };
  }
  return { source: null, storagePath: null };
}

/**
 * Check whether any product/category still references a storagePath.
 * Used to avoid deleting shared objects (orphan prevention in reverse).
 */
async function isStoragePathReferenced(storagePath) {
  if (!storagePath) return false;
  const prisma = require('../config/db');
  const [p, c] = await Promise.all([
    prisma.product.count({ where: { storagePath } }),
    prisma.category.count({ where: { storagePath } })
  ]);
  return p + c > 0;
}

/**
 * Delete a storage object. No-op (returns false) when ref is not ours.
 * @returns {Promise<boolean>} true if an object was deleted
 */
async function deleteStorageObject(ref) {
  const parsed = typeof ref === 'string' ? parseStoragePath(ref) || parseStorageRef(ref) : ref;
  if (!parsed) return false;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.objectPath]);
  if (error) {
    const err = new Error(`Gagal menghapus gambar: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }
  return true;
}

/**
 * Move an object within a bucket (used to relocate tmp/ uploads under the final entity id).
 * Returns the new public URL. Falls back to the old URL if move is impossible.
 */
async function moveStorageObject(bucket, fromPath, toPath) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);
  if (error) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(toPath);
  return data.publicUrl;
}

module.exports = {
  PUBLIC_BUCKETS,
  MAX_FILE_SIZE,
  validateImageFile,
  uploadImageToStorage,
  parseStorageRef,
  parseStoragePath,
  resolveRecordStorage,
  classifyImageUrl,
  isStoragePathReferenced,
  deleteStorageObject,
  moveStorageObject
};
