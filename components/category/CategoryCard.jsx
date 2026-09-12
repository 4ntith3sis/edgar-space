'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/libs/api';

const slugToPhotoMap = {
  'kebutuhan-kamar-mandi': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  'organisasi-rumah': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
  'pintu-perlengkapan': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  'lampu-pencahayaan': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  'dekorasi-rumah': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  'dapur-ruang-makan': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  'sanitasi-perlengkapan': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
};

export default function CategoryCard({ category }) {
  const name = category?.name;
  const slug = category?.slug;
  const thumbnail = category?.thumbnail;

  const resolvedApiImage = getImageUrl(thumbnail);
  const isCustomThumbnail = thumbnail && thumbnail !== 'null' && thumbnail !== 'undefined';
  const fallbackPhoto = slugToPhotoMap[slug] || `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80`;

  const initialPhotoUrl = (isCustomThumbnail ? resolvedApiImage : fallbackPhoto) || fallbackPhoto;

  const [imgSrc, setImgSrc] = useState(initialPhotoUrl);
  const [imageLoading, setImageLoading] = useState(true);

  if (!category) return null;

  const targetUrl = `/produk?kategori=${slug || ''}`;

  const handleImageError = () => {
    setImgSrc(fallbackPhoto);
    setImageLoading(false);
  };

  return (
    <Link
      href={targetUrl}
      className="group relative block aspect-[3/4.8] w-full rounded-2xl overflow-hidden border border-light-beige shadow-subtle bg-soft-beige transition-all duration-300 hover:shadow-hover hover:-translate-y-1"
    >
      {imageLoading && (
        <div className="absolute inset-0 bg-soft-beige/70 animate-pulse z-0" />
      )}

      <Image
        src={imgSrc}
        alt={name || 'Kategori'}
        fill
        onLoad={() => setImageLoading(false)}
        onError={handleImageError}
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
          imageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
      />
      
      {/* Dark Gradient Overlay at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity" />
      
      {/* Category Name in White */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-center transition-transform duration-300 group-hover:-translate-y-1">
        <h3 className="font-sans text-xs sm:text-sm font-semibold text-white tracking-wide leading-snug drop-shadow-sm">
          {name}
        </h3>
      </div>
    </Link>
  );
}



