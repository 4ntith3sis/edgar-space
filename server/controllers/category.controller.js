const categoryService = require('../services/category.service');
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

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

async function getCategoryBySlug(req, res, next) {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      q: req.query.q || req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      stockStatus: req.query.stockStatus,
      sort: req.query.sort
    };
    const category = await categoryService.getCategoryBySlug(req.params.slug, options);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description
    };

    let tmpStorageRef = null;
    if (req.file) {
      const uploaded = await uploadImageToStorage(req.file, { bucket: 'categories' });
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

    const newCategory = await categoryService.createCategory(data);

    // Relocate tmp/ object under the final category id: categories/<id>/<file>
    if (tmpStorageRef) {
      try {
        const filename = tmpStorageRef.objectPath.split('/').pop();
        const finalPath = `${newCategory.id}/${filename}`;
        const finalUrl = await moveStorageObject('categories', tmpStorageRef.objectPath, finalPath);
        if (finalUrl) {
          const relocated = await categoryService.updateCategory(newCategory.id, {
            thumbnail: finalUrl,
            imageSource: 'upload',
            storagePath: `categories/${finalPath}`
          });
          return sendSuccess(res, relocated, 'Kategori berhasil ditambahkan.', 201);
        }
      } catch {
        // keep tmp reference — verified valid, no orphan
      }
    }

    return sendSuccess(res, newCategory, 'Kategori berhasil ditambahkan.', 201);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description
    };

    if (req.file) {
      const uploaded = await uploadImageToStorage(req.file, {
        bucket: 'categories',
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

    const oldRecord = await categoryService.getCategoryById(req.params.id);
    const oldStorage = resolveRecordStorage(oldRecord);
    const updatedCategory = await categoryService.updateCategory(req.params.id, data);

    if (data.thumbnail !== undefined && oldStorage) {
      const newStorage = resolveRecordStorage({
        thumbnail: updatedCategory.thumbnail,
        storagePath: updatedCategory.storagePath
      });
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

    return sendSuccess(res, updatedCategory, 'Kategori berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const oldRecord = await categoryService.getCategoryById(req.params.id);
    const oldStorage = resolveRecordStorage(oldRecord);
    await categoryService.deleteCategory(req.params.id);

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

    return sendSuccess(res, null, 'Kategori berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
