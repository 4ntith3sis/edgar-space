const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const authController = require('../controllers/auth.controller');
const settingsController = require('../controllers/settings.controller');

const productController = require('../controllers/product.controller');
const categoryController = require('../controllers/category.controller');
const stockController = require('../controllers/stock.controller');
const dashboardController = require('../controllers/dashboard.controller');
const { sendSuccess, sendError } = require('../utils/response');

// --- Public Admin Auth Endpoints ---
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Apply authentication middleware to all subsequent admin endpoints
router.use(authMiddleware);

// --- Admin Auth Me ---
router.get('/me', authController.getMe);

// --- Admin Image Upload (Supabase Storage, Vercel-safe, no local filesystem) ---
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'File gambar tidak ditemukan.', 400);
    }
    const folder =
      req.query.folder || req.body.folder ||
      (req.baseUrl.includes('categories') || req.path.includes('categories') ? 'categories' : 'products');
    // entityId optional (?entityId=12) so object lands in "<bucket>/<id>/..." directly.
    // Without it, file goes to "<bucket>/tmp/..." and is relocated on create.
    const entityId = req.query.entityId || req.body.entityId || null;
    const { uploadImageToStorage } = require('../utils/storage');
    const uploaded = await uploadImageToStorage(req.file, { bucket: folder, entityId });
    return sendSuccess(
      res,
      { url: uploaded.url, storagePath: uploaded.storagePath, source: uploaded.source },
      'Gambar berhasil diunggah.'
    );
  } catch (error) {
    next(error);
  }
});

// --- Admin Dashboard ---
router.get('/dashboard', dashboardController.getDashboard);

// --- Admin Product Management ---
router.get('/products', productController.getProducts);
router.post('/products', upload.single('thumbnail'), productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', upload.single('thumbnail'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// --- Admin Category Management ---
router.get('/categories', categoryController.getCategories);
router.post('/categories', upload.single('thumbnail'), categoryController.createCategory);
router.get('/categories/:id', categoryController.getCategoryById);
router.put('/categories/:id', upload.single('thumbnail'), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// --- Admin Stock Management ---
router.get('/stock', productController.getProducts);
router.get('/stock/history', stockController.getStockHistory);
router.post('/products/:id/stock', stockController.updateStock);
router.patch('/products/:id/stock', stockController.updateStock);

// --- Admin Settings ---
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router;

