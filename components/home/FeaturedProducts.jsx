'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import { fetchApi } from '@/libs/api';

const REFERENCE_PRODUCTS = [
  { id: 1, name: "Vas Keramik Minimalis", price: 125000, rating: 4.8, reviewsCount: 120, slug: "vas-keramik-minimalis" },
  { id: 2, name: "Keranjang Penyimpanan", price: 175000, rating: 4.7, reviewsCount: 85, slug: "keranjang-penyimpanan" },
  { id: 3, name: "Lampu Meja Nordik", price: 299000, rating: 4.9, reviewsCount: 56, slug: "lampu-meja-nordik" },
  { id: 4, name: "Reed Diffuser Set", price: 149000, rating: 4.8, reviewsCount: 70, slug: "reed-diffuser-set" },
  { id: 5, name: "Tempat Sabun & Sikat", price: 89000, rating: 4.6, reviewsCount: 30, slug: "tempat-sabun-sikat" },
  { id: 6, name: "Pot Tanaman Minimalis", price: 110000, rating: 4.7, reviewsCount: 44, slug: "pot-tanaman-minimalis" }
];

export default function FeaturedProducts({ initialProducts = [] }) {
  const [productsList, setProductsList] = useState(
    initialProducts && initialProducts.length > 0 ? initialProducts : REFERENCE_PRODUCTS
  );

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProductsList(initialProducts);
      return;
    }

    async function loadApiProducts() {
      try {
        const res = await fetchApi('/products?limit=6');
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : (res.data.products || []);
          if (items.length > 0) {
            setProductsList(items);
            return;
          }
        }
      } catch (err) {
        // Fallback to reference products
      }
    }
    loadApiProducts();
  }, [initialProducts]);

  const displayProducts = productsList.slice(0, 6);

  return (
    <section id="produk" aria-label="Produk Pilihan" className="bg-warm-ivory py-12 sm:py-16">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl text-charcoal font-bold tracking-tight mb-2">
            Produk Pilihan
          </h2>
          <p className="text-xs sm:text-sm text-warm-gray font-sans font-light leading-relaxed">
            Modern furniture and home accessories to make your home more decorative.
          </p>
        </div>

        {/* 6 Product Cards Grid - 2 cols mobile, 3 tablet, 6 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}

