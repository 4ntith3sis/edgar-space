const multer = require('multer');
const path = require('path');

// Multer is used ONLY as an in-memory multipart parser. Files are buffered
// in RAM and uploaded to Supabase Storage (server/utils/storage.js).
// NOTHING is written to the local filesystem (Vercel-safe).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Harap unggah file JPG, JPEG, PNG, atau WEBP.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

module.exports = upload;
