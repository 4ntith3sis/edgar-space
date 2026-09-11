const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { categories } = require('../data/categories');
const { products } = require('../data/products');
require('../server/utils/loadEnv').loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Edgar Space Phase 2...');

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@edgarspace.id';
  const adminName = process.env.ADMIN_NAME || 'Admin Edgar Space';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: passwordHash
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: passwordHash
    }
  });
  console.log(`Admin account ready: ${admin.email} (ID: ${admin.id})`);

  // 2. Seed Categories
  const categoryMap = new Map();

  for (const cat of categories) {
    // Seed image metadata: Unsplash URLs stay as Unsplash (never re-uploaded).
    const thumbSource = !cat.thumbnail
      ? null
      : cat.thumbnail.includes('images.unsplash.com')
        ? 'unsplash'
        : cat.thumbnail.startsWith('http')
          ? 'external'
          : null;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description || null,
        thumbnail: cat.thumbnail || null,
        imageSource: thumbSource,
        storagePath: null
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        thumbnail: cat.thumbnail || null,
        imageSource: thumbSource,
        storagePath: null
      }
    });
    categoryMap.set(cat.slug, category);
    categoryMap.set(cat.name, category);
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 3. Seed Products
  let seededProductsCount = 0;
  for (const prod of products) {
    const category = categoryMap.get(prod.categorySlug) || categoryMap.get(prod.category);
    if (!category) {
      console.warn(`Category not found for product ${prod.name}`);
      continue;
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: prod.slug }
    });

    if (!existingProduct) {
      const prodSource = !prod.thumbnail
        ? null
        : prod.thumbnail.includes('images.unsplash.com')
          ? 'unsplash'
          : prod.thumbnail.startsWith('http')
            ? 'external'
            : null;
      const createdProduct = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description || null,
          price: prod.price,
          stock: prod.stock,
          thumbnail: prod.thumbnail || null,
          imageSource: prodSource,
          storagePath: null,
          isFeatured: Boolean(prod.isFeatured),
          categoryId: category.id
        }
      });

      // Record initial stock movement
      if (prod.stock > 0) {
        await prisma.stockMovement.create({
          data: {
            productId: createdProduct.id,
            type: 'RESTOCK',
            quantity: prod.stock,
            previousStock: 0,
            newStock: prod.stock,
            note: 'Stok awal produk (Seed Phase 1)',
            adminId: admin.id
          }
        });
      }
      seededProductsCount++;
    } else {
      // Update existing product details without altering stock.
      // Never overwrite a Supabase Storage reference with seed data when the
      // record already points to Storage (protects migrated/admin uploads).
      const seedSource = !prod.thumbnail
        ? null
        : prod.thumbnail.includes('images.unsplash.com')
          ? 'unsplash'
          : prod.thumbnail.startsWith('http')
            ? 'external'
            : null;
      const keepExistingImage =
        existingProduct.storagePath || existingProduct.imageSource === 'upload' || existingProduct.imageSource === 'ai';
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: prod.name,
          description: prod.description || null,
          price: prod.price,
          ...(keepExistingImage
            ? {}
            : { thumbnail: prod.thumbnail || null, imageSource: seedSource, storagePath: null }),
          isFeatured: Boolean(prod.isFeatured),
          categoryId: category.id
        }
      });
      seededProductsCount++;
    }
  }

  console.log(`Seeded ${seededProductsCount} products successfully.`);

  // 4. Seed Store Settings
  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'Edgar Space',
      whatsappNumber: '6281234567890',
      email: 'hello@edgarspace.com',
      address: 'Bandung, Jawa Barat, Indonesia',
      description: 'Showroom furnitur dan dekorasi rumah bergaya hangat, natural, dan modern.'
    }
  });
  console.log('Store settings seeded.');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
