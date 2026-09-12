'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import Reveal from '@/components/ui/Reveal';
import { fetchApi } from '@/libs/api';

const REFERENCE_PRODUCTS = [
  { id: 1, name: "Vas Keramik Minimalis", price: 125000, rating: 4.8, reviewsCount: 120, slug: "vas-keramik-minimalis", thumbnail: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Keranjang Penyimpanan", price: 175000, rating: 4.7, reviewsCount: 85, slug: "keranjang-penyimpanan", thumbnail: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Lampu Meja Nordik", price: 299000, rating: 4.9, reviewsCount: 56, slug: "lampu-meja-nordik", thumbnail: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Reed Diffuser Set", price: 149000, rating: 4.8, reviewsCount: 70, slug: "reed-diffuser-set", thumbnail: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Tempat Sabun & Sikat", price: 89000, rating: 4.6, reviewsCount: 30, slug: "tempat-sabun-sikat", thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Pot Tanaman Minimalis", price: 110000, rating: 4.7, reviewsCount: 44, slug: "pot-tanaman-minimalis", thumbnail: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80" }
];

export default function FeaturedProducts({ initialProducts = [] }) {
  const hasInitialData = Array.isArray(initialProducts) && initialProducts.length > 0;
  const [productsList, setProductsList] = useState(hasInitialData ? initialProducts : REFERENCE_PRODUCTS);
  const [loading, setLoading] = useState(!hasInitialData);

  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      setProductsList(initialProducts);
      setLoading(false);
      return;
    }

    async function loadApiProducts() {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
    loadApiProducts();
  }, [initialProducts]);

  const displayProducts = productsList.slice(0, 6);

  return (
    <section id="produk" aria-label="Produk Pilihan" className="bg-warm-ivory py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="font-sans text-2xl sm:text-3xl text-[#2C2A29] font-bold tracking-tight mb-2">
              Produk Pilihan
            </h2>
            <p className="text-xs sm:text-sm text-warm-gray font-sans font-light leading-relaxed">
              Modern furniture and home accessories to make your home more decorative.
            </p>
          </div>
        </Reveal>

        {/* 6 Product Cards Grid - 2 cols mobile, 3 tablet, 6 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Reveal key={`skeleton-${index}`} delay={Math.min(index, 5)}>
                  <ProductCardSkeleton />
                </Reveal>
              ))
            : displayProducts.map((product, index) => (
                <Reveal key={product.id || product.slug} delay={Math.min(index, 5)}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>
      </Container>
    </section>
  );
}


