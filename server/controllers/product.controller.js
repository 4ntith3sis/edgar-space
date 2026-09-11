const productService = require('../services/product.service');
const { sendSuccess } = require('../utils/response');
const {
  uploadImageToStorage,
  classifyImageUrl,
  resolveRecordStorage,
  isStoragePathReferenced,
  deleteStorageObject,
  moveStorageObject,
  parseStoragePath
} = require('../utils/storage');

async function getProducts(req, res, next) {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      q: req.query.q || req.query.search,
      category: req.query.category,
      categoryId: req.query.categoryId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      stockStatus: req.query.stockStatus,
      featured: req.query.featured,
      sort: req.query.sort
    };
    const result = await productService.getAllProducts(filters);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      categoryId: req.body.categoryId,
      isFeatured: req.body.isFeatured === true || req.body.isFeatured === 'true'
    };

    let tmpStorageRef = null;
    if (req.file) {
      // New upload -> Supabase Storage tmp/ folder (no local filesystem)
      const uploaded = await uploadImageToStorage(req.file, { bucket: 'products' });
      data.thumbnail = uploaded.url;
      data.imageSource = uploaded.source;
      data.storagePath = uploaded.storagePath;
      tmpStorageRef = parseStoragePath(uploaded.storagePath);
    } else if (req.body.thumbnail) {
      data.thumbnail = req.body.thumbnail;
      const classified = classifyImageUrl(req.body.thumbnail);
      data.imageSource = classified.source;
      data.storagePath = classified.storagePath;
    }

    const adminId = req.admin ? req.admin.id : null;
    const newProduct = await productService.createProduct(data, adminId);

    // Relocate tmp/ object under the final product id: products/<id>/<file>
    // Falls back to the tmp URL when move is impossible (still valid + referenced).
    if (tmpStorageRef) {
      try {
        const filename = tmpStorageRef.objectPath.split('/').pop();
        const finalPath = `${newProduct.id}/${filename}`;
        const finalUrl = await moveStorageObject('products', tmpStorageRef.objectPath, finalPath);
        if (finalUrl) {
          const relocated = await productService.updateProduct(newProduct.id, {
            thumbnail: finalUrl,
            imageSource: 'upload',
            storagePath: `products/${finalPath}`
          });
          return sendSuccess(res, relocated, 'Produk berhasil ditambahkan.', 201);
        }
      } catch {
        // keep tmp reference — verified valid, no orphan
      }
    }

    return sendSuccess(res, newProduct, 'Produk berhasil ditambahkan.', 201);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId,
      isFeatured: req.body.isFeatured !== undefined
        ? (req.body.isFeatured === true || req.body.isFeatured === 'true')
        : undefined
    };

    if (req.file) {
      // New upload lands directly in products/<id>/...
      const uploaded = await uploadImageToStorage(req.file, {
        bucket: 'products',
        entityId: req.params.id
      });
      data.thumbnail = uploaded.url;
      data.imageSource = uploaded.source;
      data.storagePath = uploaded.storagePath;
    } else if (req.body.thumbnail !== undefined) {
      data.thumbnail = req.body.thumbnail;
      const classified = classifyImageUrl(req.body.thumbnail);
      data.imageSource = classified.source;
      data.storagePath = classified.storagePath;
    }

    const oldRecord = await productService.getProductById(req.params.id);
    const oldStorage = resolveRecordStorage(oldRecord);
    const updatedProduct = await productService.updateProduct(req.params.id, data);

    // Delete replaced Supabase object (never touches Unsplash/external/legacy).
    // resolveRecordStorage returns non-null ONLY for our own Storage URLs.
    if (data.thumbnail !== undefined && oldStorage) {
      const newStorage = resolveRecordStorage(updatedProduct);
      const replaced =
        !newStorage ||
        newStorage.bucket !== oldStorage.bucket ||
        newStorage.objectPath !== oldStorage.objectPath;
      if (replaced) {
        const oldPath = `${oldStorage.bucket}/${oldStorage.objectPath}`;
        try {
          if (!(await isStoragePathReferenced(oldPath))) {
            await deleteStorageObject(oldStorage);
          }
        } catch {
          // best-effort cleanup; DB is already correct
        }
      }
    }

    return sendSuccess(res, updatedProduct, 'Produk berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const oldRecord = await productService.getProductById(req.params.id);
    const oldStorage = resolveRecordStorage(oldRecord);
    await productService.deleteProduct(req.params.id);

    // Remove Supabase object when nothing else references it.
    if (oldStorage) {
      const oldPath = `${oldStorage.bucket}/${oldStorage.objectPath}`;
      try {
        if (!(await isStoragePathReferenced(oldPath))) {
          await deleteStorageObject(oldStorage);
        }
      } catch {
        // best-effort cleanup; DB row is already deleted
      }
    }

    return sendSuccess(res, null, 'Produk berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
