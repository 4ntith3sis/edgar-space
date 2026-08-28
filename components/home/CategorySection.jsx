'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/components/ui/Container';
import CategoryCard from '@/components/category/CategoryCard';
import { fetchApi } from '@/libs/api';

const defaultReferenceCategories = [
  { id: 1, name: "Kebutuhan Kamar Mandi", slug: "kebutuhan-kamar-mandi" },
  { id: 2, name: "Organisasi Rumah", slug: "organisasi-rumah" },
  { id: 3, name: "Pintu & Perlengkapan", slug: "pintu-perlengkapan" },
  { id: 4, name: "Lampu & Pencahayaan", slug: "lampu-pencahayaan" },
  { id: 5, name: "Dekorasi Rumah", slug: "dekorasi-rumah" },
  { id: 6, name: "Dapur & Ruang Makan", slug: "dapur-ruang-makan" },
  { id: 7, name: "Sanitasi & Perlengkapan", slug: "sanitasi-perlengkapan" },
];

export default function CategorySection({ initialCategories = [] }) {
  const [categoriesList, setCategoriesList] = useState(
    initialCategories && initialCategories.length > 0
      ? initialCategories.slice(0, 7)
      : defaultReferenceCategories
  );

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories.slice(0, 7));
      return;
    }

    async function loadApiCategories() {
      try {
        const res = await fetchApi('/categories');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCategoriesList(res.data.slice(0, 7));
          return;
        }
      } catch (err) {
        console.error('Failed fetching homepage categories:', err);
      }
    }
    loadApiCategories();
  }, [initialCategories]);

  return (
    <section id="kategori" aria-label="Belanja Berdasarkan Kategori" className="bg-warm-ivory py-12 sm:py-16">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl text-charcoal font-bold tracking-tight">
            Belanja Berdasarkan Kategori
          </h2>
        </div>

        {/* Max 7 Cards displayed in 1 Row on Desktop */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-4">
          {categoriesList.slice(0, 7).map((category) => (
            <CategoryCard key={category.id || category.slug} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}


