'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import { useCart } from '@/context/CartContext';
import { fetchApi, getImageUrl } from '@/libs/api';
import { formatRupiah } from '@/libs/utils';
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Package, 
  AlertCircle 
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProductData() {
      if (!slug) return;
      try {
        setLoading(true);
        setError('');

        const res = await fetchApi(`/products/${slug}`);
        if (res.success && res.data) {
          const prodData = res.data;
          setProduct(prodData);
          setQuantity(prodData.stock > 0 ? 1 : 0);

          // Update page document title for SEO
          if (typeof document !== 'undefined') {
            document.title = `${prodData.name} | Edgar Space`;
          }

          // Fetch related products in same category
          if (prodData.categorySlug || prodData.categoryId) {
            const catParam = prodData.categorySlug || prodData.categoryId;
            const relRes = await fetchApi(`/products?category=${catParam}&limit=6`);
            if (relRes.success && relRes.data?.products) {
              const filteredRel = relRes.data.products.filter((p) => p.id !== prodData.id).slice(0, 4);
              setRelatedProducts(filteredRel);
            }
          }
        } else {
          setError('Produk tidak ditemukan.');
        }
      } catch (err) {
        setError(err.message || 'Produk tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-warm-ivory min-h-screen py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-deep-olive" />
        <p className="text-xs text-warm-gray font-sans">Memuat rincian produk...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-warm-ivory min-h-[70vh] py-16 flex items-center justify-center">
        <Container>
          <div className="bg-white rounded-3xl p-12 text-center border border-light-beige shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal font-normal">
              Produk Tidak Ditemukan
            </h1>
            <p className="text-xs text-warm-gray font-light">
              Maaf, produk yang Anda cari mungkin telah dihapus atau tidak tersedia.
            </p>
            <Link
              href="/produk"
              className="inline-block px-6 py-3 rounded-xl bg-deep-olive hover:bg-deep-olive-hover text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Kembali ke Produk
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Handle gallery images
  const images = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail || product.image_url || product.image
    ? [product.thumbnail || product.image_url || product.image]
    : [];

  const mainImageSrc = getImageUrl(images[selectedImageIndex] || images[0]);

  // Stock calculations
  const availableStock = product.stock || 0;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  return (
    <div className="bg-warm-ivory min-h-screen py-8 sm:py-12">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-warm-gray">
            <Link href="/" className="hover:text-charcoal transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/produk" className="hover:text-charcoal transition-colors">
              Produk
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link 
                  href={`/produk?kategori=${product.categorySlug || ''}`} 
                  className="hover:text-charcoal transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-charcoal font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* Main Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT: Product Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image Display */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-soft-beige border border-light-beige shadow-subtle group">
                <Image
                  src={mainImageSrc}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Stock Tag Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-sans shadow-xs ${
                    isOutOfStock
                      ? 'bg-red-600 text-white'
                      : isLowStock
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}>
                    {isOutOfStock ? 'Habis' : isLowStock ? 'Stok Terbatas' : 'Tersedia'}
                  </span>
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => {
                    const thumbSrc = getImageUrl(img);
                    const isSelected = idx === selectedImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                          isSelected
                            ? 'border-terracotta ring-2 ring-terracotta/20 scale-105'
                            : 'border-light-beige opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={thumbSrc}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: Product Information & Purchase Form */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                {/* Category Pill */}
                {product.category && (
                  <span className="text-xs uppercase tracking-widest font-mono text-terracotta font-semibold block mb-1">
                    {product.category}
                  </span>
                )}

                {/* Title */}
                <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal leading-tight">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mt-4 pt-4 border-t border-light-beige">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-terracotta">
                    {formatRupiah(product.price)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Deskripsi Produk
                </h3>
                <p className="text-xs sm:text-sm text-warm-gray leading-relaxed font-light">
                  {product.description || 'Vas dan perabot dekorasi ruangan buatan pengrajin dengan material premium untuk menghidupkan suasana hunian Anda.'}
                </p>
              </div>

              {/* Stock Status Info */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-semibold text-charcoal">Status Stok:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-700'
                    : isLowStock
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isOutOfStock ? 'Habis' : isLowStock ? `Stok Terbatas (Sisa ${availableStock})` : `Tersedia (Stok: ${availableStock})`}
                </span>
              </div>

              {/* Quantity Selector & Add to Cart Action */}
              <div className="pt-4 border-t border-light-beige space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                    Jumlah:
                  </label>

                  <div className="flex items-center border border-light-beige rounded-xl bg-white shadow-xs">
                    <button
                      onClick={handleDecreaseQuantity}
                      disabled={isOutOfStock || quantity <= 1}
                      className="p-2.5 text-warm-gray hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold text-charcoal font-sans">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      onClick={handleIncreaseQuantity}
                      disabled={isOutOfStock || quantity >= availableStock}
                      className="p-2.5 text-warm-gray hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {availableStock > 0 && quantity >= availableStock && (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Mencapai jumlah maksimum stok.
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCartClick}
                  disabled={isOutOfStock}
                  className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 ${
                    isOutOfStock
                      ? 'bg-warm-beige text-warm-gray cursor-not-allowed border border-light-beige'
                      : 'bg-deep-olive hover:bg-deep-olive-hover text-white cursor-pointer active:scale-98'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Produk sedang habis.' : 'Tambah ke Keranjang'}</span>
                </button>
              </div>

              {/* Shipping & Additional Info */}
              <div className="p-4 rounded-2xl bg-white border border-light-beige space-y-3 text-xs text-warm-gray">
                <div className="flex items-start space-x-3">
                  <Truck className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block">Pengiriman Toko:</strong>
                    <span>Informasi pengiriman akan dikonfirmasi secara langsung melalui WhatsApp.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2 border-t border-light-beige">
                  <ShieldCheck className="w-4 h-4 text-deep-olive shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block">Jaminan Kualitas Edgar Space:</strong>
                    <span>Garansi produk dikemas aman hingga tiba di alamat rumah Anda.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Related Products Section ("Produk Serupa") */}
          {relatedProducts.length > 0 && (
            <div className="pt-12 border-t border-light-beige space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-charcoal">
                    Produk Serupa
                  </h2>
                  <p className="text-xs text-warm-gray mt-0.5">
                    Pilihan dekorasi dan furnitur lain dalam kategori {product.category || 'yang sama'}.
                  </p>
                </div>

                <Link
                  href={`/produk?kategori=${product.categorySlug || ''}`}
                  className="text-xs font-semibold text-terracotta hover:underline flex items-center space-x-1"
                >
                  <span>Lihat Kategori</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProd) => (
                  <ProductCard key={relProd.id} product={relProd} />
                ))}
              </div>
            </div>
          )}

        </div>
      </Container>
    </div>
  );
}
