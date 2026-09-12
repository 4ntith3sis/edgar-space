'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { formatRupiah } from '@/libs/utils';
import { getImageUrl } from '@/libs/api';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const name = product?.name || 'Produk';
  const slug = product?.slug || '';
  const price = product?.price || 0;
  const stock = product?.stock !== undefined ? product.stock : 10;
  const category = product?.category || '';

  // Support multiple potential image properties from backend / Prisma / static objects
  const rawImagePath = product?.thumbnail || product?.image_url || product?.image || (Array.isArray(product?.images) && product?.images[0]) || '';
  const resolvedUrl = getImageUrl(rawImagePath);

  const [imgSrc, setImgSrc] = useState(resolvedUrl || '');
  const [imageLoading, setImageLoading] = useState(Boolean(resolvedUrl));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const nextUrl = getImageUrl(rawImagePath) || '';
    setImgSrc(nextUrl);
    setImageLoading(Boolean(nextUrl));
    setHasError(false);
  }, [rawImagePath]);

  if (!product) return null;

  const productUrl = `/produk/${slug}`;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleImageError = () => {
    setHasError(true);
    setImageLoading(false);
  };

  return (
    <article className="group flex flex-col h-full bg-white border border-light-beige rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-1 relative">
      {/* Stock Tag Badge */}
      {isOutOfStock ? (
        <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
          Habis
        </span>
      ) : isLowStock ? (
        <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
          Stok Terbatas
        </span>
      ) : null}

      {/* Image Container */}
      <Link href={productUrl} className="relative aspect-square w-full bg-soft-beige/40 overflow-hidden p-2 flex items-center justify-center cursor-pointer">
        {/* Skeleton Shimmer while loading or if no image */}
        {(imageLoading || !imgSrc || hasError) && (
          <div className="absolute inset-0 bg-soft-beige/70 animate-pulse z-0 flex items-center justify-center text-warm-gray text-xs font-mono">
            {name}
          </div>
        )}

        {imgSrc && !hasError && (
          <Image
            src={imgSrc}
            alt={name}
            fill
            onLoad={() => setImageLoading(false)}
            onError={handleImageError}
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            } ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3.5 lg:p-4 justify-between bg-white">
        <div>
          {category && (
            <span className="text-[10px] uppercase font-mono tracking-wider text-warm-gray block mb-1">
              {category}
            </span>
          )}
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-charcoal group-hover:text-deep-olive transition-colors duration-200 line-clamp-1">
            <Link href={productUrl}>
              {name}
            </Link>
          </h3>
        </div>

        {/* Footer: Price + Cart Button */}
        <div className="mt-3 pt-2.5 border-t border-light-beige/70 flex items-center justify-between">
          <span className="font-sans text-xs sm:text-sm font-bold text-charcoal tracking-tight">
            {formatRupiah(price)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-xs shrink-0 ${
              isOutOfStock
                ? 'bg-warm-beige text-warm-gray cursor-not-allowed border border-light-beige'
                : 'bg-terracotta hover:bg-terracotta-hover text-white cursor-pointer'
            }`}
            aria-label={isOutOfStock ? `${name} sedang habis` : `Tambah ${name} ke keranjang`}
          >
            <ShoppingCart className="w-4 h-4 fill-white/20" />
          </button>
        </div>
      </div>
    </article>
  );
}

