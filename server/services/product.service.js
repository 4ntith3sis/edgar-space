const prisma = require('../config/db');
const { generateProductSlug } = require('../utils/slugify');

/**
 * Get paginated list of products with database-level filtering, search, and sorting
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   q?: string,
 *   search?: string,
 *   category?: string,
 *   categoryId?: number,
 *   minPrice?: number,
 *   maxPrice?: number,
 *   stockStatus?: 'available' | 'limited' | 'out-of-stock',
 *   featured?: boolean | string,
 *   sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
 * }} filters 
 */
async function getAllProducts(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(filters.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const where = {};

  // Search query (name or description)
  const searchQuery = filters.q || filters.search;
  if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
    const cleanQ = searchQuery.trim();
    where.OR = [
      { name: { contains: cleanQ, mode: 'insensitive' } },
      { description: { contains: cleanQ, mode: 'insensitive' } }
    ];
  }

  // Category filter by slug, name, or ID
  if (filters.category && typeof filters.category === 'string' && filters.category.trim()) {
    const catVal = filters.category.trim();
    where.category = {
      OR: [
        { slug: { equals: catVal, mode: 'insensitive' } },
        { name: { equals: catVal, mode: 'insensitive' } }
      ]
    };
  } else if (filters.categoryId) {
    where.categoryId = Number(filters.categoryId);
  }

  // Price range filters
  if (filters.minPrice !== undefined && filters.minPrice !== '' && !isNaN(Number(filters.minPrice))) {
    where.price = {
      ...(where.price || {}),
      gte: Number(filters.minPrice)
    };
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '' && !isNaN(Number(filters.maxPrice))) {
    where.price = {
      ...(where.price || {}),
      lte: Number(filters.maxPrice)
    };
  }

  // Stock status filter
  if (filters.stockStatus) {
    if (filters.stockStatus === 'available') {
      where.stock = { gt: 5 };
    } else if (filters.stockStatus === 'limited') {
      where.stock = { gt: 0, lte: 5 };
    } else if (filters.stockStatus === 'out-of-stock') {
      where.stock = 0;
    }
  }

  // Featured flag
  if (filters.featured !== undefined && filters.featured !== '') {
    where.isFeatured = filters.featured === true || filters.featured === 'true';
  }

  // Sorting
  let orderBy = { createdAt: 'desc' };
  if (filters.sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (filters.sort === 'price-desc') {
    orderBy = { price: 'desc' };
  } else if (filters.sort === 'name-asc') {
    orderBy = { name: 'asc' };
  } else if (filters.sort === 'name-desc') {
    orderBy = { name: 'desc' };
  } else if (filters.sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  const [total, rawProducts] = await Promise.all([
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
    imageSource: prod.imageSource || null,
    storagePath: prod.storagePath || null,
    images: prod.images && prod.images.length > 0 ? prod.images : (prod.thumbnail ? [prod.thumbnail] : []),
    isFeatured: prod.isFeatured,
    categoryId: prod.categoryId,
    category: prod.category ? prod.category.name : null,
    categorySlug: prod.category ? prod.category.slug : null,
    createdAt: prod.createdAt,
    updatedAt: prod.updatedAt
  }));

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

/**
 * Get product by Slug including related products from same category
 * @param {string} slug 
 */
async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true, description: true }
      }
    }
  });

  if (!product) {
    const error = new Error('Produk tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Fetch up to 4 related products from the same category
  const rawRelated = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  const relatedProducts = rawRelated.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    thumbnail: p.thumbnail,
    isFeatured: p.isFeatured,
    categoryId: p.categoryId,
    category: p.category ? p.category.name : null,
    categorySlug: p.category ? p.category.slug : null
  }));

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.thumbnail ? [product.thumbnail] : []);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    thumbnail: product.thumbnail,
    imageSource: product.imageSource || null,
    storagePath: product.storagePath || null,
    images: galleryImages,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId,
    category: product.category ? product.category.name : null,
    categoryName: product.category ? product.category.name : null,
    categorySlug: product.category ? product.category.slug : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    relatedProducts
  };
}

/**
 * Get product by ID
 * @param {number} id 
 */
async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      },
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          admin: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  if (!product) {
    const error = new Error('Produk tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.thumbnail ? [product.thumbnail] : []);

  return {
    ...product,
    price: Number(product.price),
    images: galleryImages,
    categoryName: product.category ? product.category.name : null,
    categorySlug: product.category ? product.category.slug : null
  };
}

/**
 * Create a new product with initial stock movement transaction
 * @param {{ name: string, description?: string, price: number, stock?: number, categoryId: number, thumbnail?: string, imageSource?: string|null, storagePath?: string|null, isFeatured?: boolean }} data 
 * @param {number} adminId 
 */
async function createProduct(data, adminId) {
  if (!data.name || !data.name.trim()) {
    const error = new Error('Nama produk wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  const priceNum = Number(data.price);
  if (isNaN(priceNum) || priceNum < 0) {
    const error = new Error('Harga produk tidak valid.');
    error.statusCode = 400;
    throw error;
  }

  const categoryId = Number(data.categoryId);
  if (!categoryId || isNaN(categoryId)) {
    const error = new Error('Kategori wajib dipilih.');
    error.statusCode = 400;
    throw error;
  }

  // Check category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    const error = new Error('Kategori yang dipilih tidak ditemukan.');
    error.statusCode = 400;
    throw error;
  }

  const stockNum = data.stock !== undefined ? parseInt(data.stock, 10) : 0;
  if (isNaN(stockNum) || stockNum < 0) {
    const error = new Error('Stok awal tidak boleh kurang dari 0.');
    error.statusCode = 400;
    throw error;
  }

  const slug = await generateProductSlug(data.name.trim());

  // Database transaction for product + initial stock movement
  const created = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description ? data.description.trim() : null,
        price: priceNum,
        stock: stockNum,
        thumbnail: data.thumbnail || null,
        imageSource: data.imageSource !== undefined ? data.imageSource : null,
        storagePath: data.storagePath !== undefined ? data.storagePath : null,
        images: data.thumbnail ? [data.thumbnail] : [],
        isFeatured: data.isFeatured === true || data.isFeatured === 'true',
        categoryId
      },
      include: {
        category: true
      }
    });

    if (stockNum > 0) {
      await tx.stockMovement.create({
        data: {
          productId: newProduct.id,
          type: 'RESTOCK',
          quantity: stockNum,
          previousStock: 0,
          newStock: stockNum,
          note: 'Stok awal pembuatan produk',
          adminId: adminId || null
        }
      });
    }

    return newProduct;
  });

  return {
    ...created,
    price: Number(created.price)
  };
}

/**
 * Update product info (Stock is NOT updated here!)
 * @param {number} id 
 * @param {{ name?: string, description?: string, price?: number, categoryId?: number, thumbnail?: string, imageSource?: string|null, storagePath?: string|null, isFeatured?: boolean }} data 
 */
async function updateProduct(id, data) {
  const productId = Number(id);
  const existing = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!existing) {
    const error = new Error('Produk tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.name && data.name.trim() !== existing.name) {
    updateData.name = data.name.trim();
    updateData.slug = await generateProductSlug(data.name.trim(), productId);
  }

  if (data.description !== undefined) {
    updateData.description = data.description ? data.description.trim() : null;
  }

  if (data.price !== undefined) {
    const priceNum = Number(data.price);
    if (isNaN(priceNum) || priceNum < 0) {
      const error = new Error('Harga produk tidak valid.');
      error.statusCode = 400;
      throw error;
    }
    updateData.price = priceNum;
  }

  if (data.categoryId !== undefined) {
    const categoryId = Number(data.categoryId);
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      const error = new Error('Kategori yang dipilih tidak valid.');
      error.statusCode = 400;
      throw error;
    }
    updateData.categoryId = categoryId;
  }

  if (data.thumbnail !== undefined) {
    updateData.thumbnail = data.thumbnail || null;
    if (data.thumbnail) {
      updateData.images = [data.thumbnail];
    }
  }

  if (data.imageSource !== undefined) {
    updateData.imageSource = data.imageSource;
  }

  if (data.storagePath !== undefined) {
    updateData.storagePath = data.storagePath;
  }

  if (data.isFeatured !== undefined) {
    updateData.isFeatured = data.isFeatured === true || data.isFeatured === 'true';
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      category: true
    }
  });

  return {
    ...updated,
    price: Number(updated.price)
  };
}

/**
 * Delete a product and safely clean up related stock movements
 * @param {number} id 
 */
async function deleteProduct(id) {
  const productId = Number(id);
  const existing = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!existing) {
    const error = new Error('Produk tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    await tx.stockMovement.deleteMany({
      where: { productId }
    });

    return await tx.product.delete({
      where: { id: productId }
    });
  });
}

module.exports = {
  getAllProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
