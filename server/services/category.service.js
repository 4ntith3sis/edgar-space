const prisma = require('../config/db');
const { generateCategorySlug } = require('../utils/slugify');

/**
 * Get all categories with product count
 */
async function getAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    thumbnail: cat.thumbnail,
    imageSource: cat.imageSource || null,
    storagePath: cat.storagePath || null,
    productCount: cat._count.products,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt
  }));
}

/**
 * Get category by slug with its paginated/filtered products
 * @param {string} slug 
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   q?: string,
 *   minPrice?: number,
 *   maxPrice?: number,
 *   stockStatus?: string,
 *   sort?: string
 * }} options 
 */
async function getCategoryBySlug(slug, options = {}) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!category) {
    const error = new Error('Kategori tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const where = {
    categoryId: category.id
  };

  if (options.q && typeof options.q === 'string' && options.q.trim()) {
    const cleanQ = options.q.trim();
    where.OR = [
      { name: { contains: cleanQ, mode: 'insensitive' } },
      { description: { contains: cleanQ, mode: 'insensitive' } }
    ];
  }

  if (options.minPrice !== undefined && options.minPrice !== '' && !isNaN(Number(options.minPrice))) {
    where.price = { ...(where.price || {}), gte: Number(options.minPrice) };
  }

  if (options.maxPrice !== undefined && options.maxPrice !== '' && !isNaN(Number(options.maxPrice))) {
    where.price = { ...(where.price || {}), lte: Number(options.maxPrice) };
  }

  if (options.stockStatus) {
    if (options.stockStatus === 'available') {
      where.stock = { gt: 5 };
    } else if (options.stockStatus === 'limited') {
      where.stock = { gt: 0, lte: 5 };
    } else if (options.stockStatus === 'out-of-stock') {
      where.stock = 0;
    }
  }

  let orderBy = { createdAt: 'desc' };
  if (options.sort === 'price-asc') orderBy = { price: 'asc' };
  else if (options.sort === 'price-desc') orderBy = { price: 'desc' };
  else if (options.sort === 'name-asc') orderBy = { name: 'asc' };
  else if (options.sort === 'name-desc') orderBy = { name: 'desc' };

  const [totalProductsInFilter, rawProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })
  ]);

  const products = rawProducts.map((prod) => ({
    id: prod.id,
    name: prod.name,
    slug: prod.slug,
    description: prod.description,
    price: Number(prod.price),
    stock: prod.stock,
    thumbnail: prod.thumbnail,
    images: prod.images && prod.images.length > 0 ? prod.images : (prod.thumbnail ? [prod.thumbnail] : []),
    isFeatured: prod.isFeatured,
    categoryId: prod.categoryId,
    category: prod.category ? prod.category.name : null,
    categorySlug: prod.category ? prod.category.slug : null,
    createdAt: prod.createdAt,
    updatedAt: prod.updatedAt
  }));

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    thumbnail: category.thumbnail,
    imageSource: category.imageSource || null,
    storagePath: category.storagePath || null,
    productCount: category._count.products,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    products,
    pagination: {
      page,
      limit,
      total: totalProductsInFilter,
      totalPages: Math.ceil(totalProductsInFilter / limit) || 1
    }
  };
}

/**
 * Get category by ID
 * @param {number} id 
 */
async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!category) {
    const error = new Error('Kategori tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...category,
    productCount: category._count.products
  };
}

/**
 * Create a new category
 * @param {{ name: string, description?: string, thumbnail?: string, imageSource?: string|null, storagePath?: string|null }} data 
 */
async function createCategory(data) {
  if (!data.name || !data.name.trim()) {
    const error = new Error('Nama kategori wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  const slug = await generateCategorySlug(data.name.trim());

  return await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description ? data.description.trim() : null,
      thumbnail: data.thumbnail || null,
      imageSource: data.imageSource !== undefined ? data.imageSource : null,
      storagePath: data.storagePath !== undefined ? data.storagePath : null
    }
  });
}

/**
 * Update an existing category
 * @param {number} id 
 * @param {{ name?: string, description?: string, thumbnail?: string, imageSource?: string|null, storagePath?: string|null }} data 
 */
async function updateCategory(id, data) {
  const categoryId = Number(id);
  const existing = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!existing) {
    const error = new Error('Kategori tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.name && data.name.trim() !== existing.name) {
    updateData.name = data.name.trim();
    updateData.slug = await generateCategorySlug(data.name.trim(), categoryId);
  }

  if (data.description !== undefined) {
    updateData.description = data.description ? data.description.trim() : null;
  }

  if (data.thumbnail !== undefined) {
    updateData.thumbnail = data.thumbnail || null;
  }

  if (data.imageSource !== undefined) {
    updateData.imageSource = data.imageSource;
  }

  if (data.storagePath !== undefined) {
    updateData.storagePath = data.storagePath;
  }

  return await prisma.category.update({
    where: { id: categoryId },
    data: updateData
  });
}

/**
 * Delete a category (safely prevents deleting categories with products)
 * @param {number} id 
 */
async function deleteCategory(id) {
  const categoryId = Number(id);
  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!existing) {
    const error = new Error('Kategori tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  if (existing._count.products > 0) {
    const error = new Error('Kategori ini masih memiliki produk. Pindahkan produk terlebih dahulu sebelum menghapus kategori.');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.category.delete({
    where: { id: categoryId }
  });
}

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
