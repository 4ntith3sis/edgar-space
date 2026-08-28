'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/product/ProductCardSkeleton';
import { fetchApi, getImageUrl } from '@/libs/api';
import { Package, RotateCcw, AlertCircle, Search, FolderTree, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract query parameters
  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const categoryFilter = searchParams.get('kategori') || searchParams.get('category') || '';
  const sortOption = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // State for active filters
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedSort, setSelectedSort] = useState(sortOption);
  const [searchQueryText, setSearchQueryText] = useState(searchQuery);
  const [activeSearch, setActiveSearch] = useState(searchQuery);
  const [currentPageNum, setCurrentPageNum] = useState(currentPage);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryObj, setActiveCategoryObj] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync initial query params from URL
  useEffect(() => {
    setSelectedCategory(categoryFilter);
    setSelectedSort(sortOption);
    setSearchQueryText(searchQuery);
    setActiveSearch(searchQuery);
    setCurrentPageNum(currentPage);
  }, [categoryFilter, sortOption, searchQuery, currentPage]);

  // Load Categories list
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchApi('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Update URL helper
  const syncUrlParams = useCallback((cat, searchVal, sortVal, pageNum) => {
    const params = new URLSearchParams();
    if (cat) params.set('kategori', cat);
    if (searchVal) params.set('q', searchVal);
    if (sortVal && sortVal !== 'newest') params.set('sort', sortVal);
    if (pageNum && pageNum > 1) params.set('page', pageNum.toString());

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl, { scroll: false });
  }, [pathname, router]);

  // Fetch Products matching current filter states
  useEffect(() => {
    async function fetchCatalogProducts() {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        params.append('page', currentPageNum.toString());
        params.append('limit', '12');
        if (activeSearch.trim()) params.append('q', activeSearch.trim());
        if (selectedCategory.trim()) params.append('category', selectedCategory.trim());
        if (selectedSort) params.append('sort', selectedSort);

        const res = await fetchApi(`/products?${params.toString()}`);

        if (res.success && res.data) {
          const fetchedProds = Array.isArray(res.data.products) ? res.data.products : (res.data || []);
          setProducts(fetchedProds);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          } else {
            setPagination({ page: 1, limit: 12, total: fetchedProds.length, totalPages: 1 });
          }
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError('Gagal memuat produk. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogProducts();
  }, [activeSearch, selectedCategory, selectedSort, currentPageNum]);

  // Find active category details
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const match = categories.find((c) => c.slug === selectedCategory.trim() || c.name === selectedCategory.trim());
      setActiveCategoryObj(match || null);
    } else {
      setActiveCategoryObj(null);
    }
  }, [selectedCategory, categories]);

  // Category Selection Handler
  const handleSelectCategory = (slug) => {
    const nextCat = slug || '';
    setSelectedCategory(nextCat);
    setCurrentPageNum(1);
    syncUrlParams(nextCat, activeSearch, selectedSort, 1);
  };

  // Sort Selection Handler
  const handleSelectSort = (sortVal) => {
    setSelectedSort(sortVal);
    setCurrentPageNum(1);
    syncUrlParams(selectedCategory, activeSearch, sortVal, 1);
  };

  // Search Submit Handler
  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = searchQueryText.trim();
    setActiveSearch(cleanQuery);
    setCurrentPageNum(1);
    syncUrlParams(selectedCategory, cleanQuery, selectedSort, 1);
  };

  // Reset All Filters Handler
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedSort('newest');
    setSearchQueryText('');
    setActiveSearch('');
    setCurrentPageNum(1);
    syncUrlParams('', '', 'newest', 1);
  };

  return (
    <div className="bg-warm-ivory min-h-screen py-8 sm:py-12">
      <Container>
        <div className="space-y-8">
          
          {/* Header Banner */}
          {activeCategoryObj ? (
            <div className="relative rounded-3xl overflow-hidden bg-charcoal text-white p-8 sm:p-10 min-h-[180px] flex flex-col justify-end shadow-md border border-light-beige">
              {activeCategoryObj.thumbnail && (
                <div className="absolute inset-0 opacity-30">
                  <Image
                    src={getImageUrl(activeCategoryObj.thumbnail)}
                    alt={activeCategoryObj.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
                </div>
              )}
              <div className="relative z-10 space-y-1.5">
                <span className="text-[11px] uppercase tracking-widest text-terracotta font-semibold font-mono">
                  Kategori Koleksi
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#FAF7F2]">
                  {activeCategoryObj.name}
                </h1>
                {activeCategoryObj.description && (
                  <p className="text-xs sm:text-sm text-[#C5C1B8] max-w-2xl font-light leading-relaxed">
                    {activeCategoryObj.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden bg-[#1E251E] text-white p-8 sm:p-10 min-h-[180px] flex flex-col justify-end shadow-md border border-[#2D382D]">
              <div className="absolute inset-0 opacity-20">
                <Image
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
                  alt="Katalog Edgar Space"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E251E] via-[#1E251E]/70 to-transparent" />
              </div>
              <div className="relative z-10 space-y-1.5">
                <span className="text-[11px] uppercase tracking-widest text-terracotta font-semibold font-mono">
                  Katalog Resmi
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#FAF7F2]">
                  Koleksi Perabot & Dekorasi Rumah
                </h1>
                <p className="text-xs sm:text-sm text-[#C5C1B8] max-w-xl font-light leading-relaxed">
                  Jelajahi karya rancangan interior bergaya hangat, natural, dan modern di Edgar Space.
                </p>
              </div>
            </div>
          )}

          {/* Mobile Filter Toggle Button */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-light-beige rounded-xl text-xs font-semibold text-charcoal shadow-xs hover:border-deep-olive transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-deep-olive" />
              <span>Filter & Kategori</span>
              {(selectedCategory || activeSearch || selectedSort !== 'newest') && (
                <span className="w-2 h-2 rounded-full bg-terracotta" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-warm-gray">Urutkan:</label>
              <select
                value={selectedSort}
                onChange={(e) => handleSelectSort(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-light-beige bg-white text-charcoal text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="name-asc">Nama A-Z</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)} />
              <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between px-5 py-4 border-b border-light-beige">
                  <h3 className="font-sans font-bold text-sm text-charcoal">Filter Produk</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-2 rounded-full hover:bg-soft-beige text-warm-gray">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Mobile Search */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                      <Search className="w-3.5 h-3.5 text-deep-olive" />
                      <span>Cari Produk</span>
                    </h4>
                    <form onSubmit={(e) => { handleSearchFormSubmit(e); setMobileFilterOpen(false); }} className="relative">
                      <input
                        type="text"
                        value={searchQueryText}
                        onChange={(e) => setSearchQueryText(e.target.value)}
                        placeholder="Cari nama produk..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-light-beige bg-warm-ivory/30 text-charcoal text-xs focus:outline-none focus:border-deep-olive"
                      />
                      <button type="submit" className="absolute left-3 top-2.5 text-warm-gray hover:text-charcoal">
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Mobile Category List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-deep-olive" />
                        <span>Kategori</span>
                      </h4>
                      {selectedCategory && (
                        <button onClick={() => { handleSelectCategory(''); }} className="text-[11px] font-semibold text-terracotta hover:underline">Reset</button>
                      )}
                    </div>
                    <nav className="space-y-1">
                      <button type="button" onClick={() => { handleSelectCategory(''); setMobileFilterOpen(false); }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${!selectedCategory ? 'bg-deep-olive text-white shadow-xs font-semibold' : 'text-charcoal hover:bg-warm-ivory'}`}>
                        <span>Semua Kategori</span>
                        <ChevronRight className={`w-3.5 h-3.5 ${!selectedCategory ? 'text-white' : 'opacity-40'}`} />
                      </button>
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.slug;
                        return (
                          <button key={cat.id} type="button" onClick={() => { handleSelectCategory(cat.slug); setMobileFilterOpen(false); }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isSelected ? 'bg-deep-olive text-white shadow-xs font-semibold' : 'text-charcoal hover:bg-warm-ivory'}`}>
                            <span className="truncate max-w-[170px] text-left">{cat.name}</span>
                            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'opacity-40'}`} />
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {(activeSearch || selectedCategory || selectedSort !== 'newest') && (
                    <button type="button" onClick={() => { handleResetFilters(); setMobileFilterOpen(false); }}
                      className="w-full py-2.5 px-3 rounded-xl border border-terracotta/30 text-terracotta hover:bg-terracotta/10 text-xs font-semibold flex items-center justify-center space-x-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Hapus Semua Filter</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main 2-Column Layout (Left Sidebar + Right Product Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Category Sidebar — hidden on mobile, uses drawer instead */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-xs space-y-6">
                
                {/* Search Bar Input */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5 text-deep-olive" />
                    <span>Cari Produk</span>
                  </h3>
                  <form onSubmit={handleSearchFormSubmit} className="relative">
                    <input
                      type="text"
                      value={searchQueryText}
                      onChange={(e) => setSearchQueryText(e.target.value)}
                      placeholder="Cari nama produk..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-light-beige bg-warm-ivory/30 text-charcoal text-xs focus:outline-none focus:border-deep-olive transition-colors"
                    />
                    <button type="submit" className="absolute left-3 top-2.5 text-warm-gray hover:text-charcoal">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Category List */}
                <div className="space-y-3 pt-2 border-t border-light-beige">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-deep-olive" />
                      <span>Kategori</span>
                    </h3>
                    {selectedCategory && (
                      <button
                        onClick={() => handleSelectCategory('')}
                        className="text-[11px] font-semibold text-terracotta hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <nav className="space-y-1">
                    {/* All Categories Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        !selectedCategory
                          ? 'bg-deep-olive text-white shadow-xs font-semibold'
                          : 'text-charcoal hover:bg-warm-ivory hover:text-deep-olive'
                      }`}
                    >
                      <span>Semua Kategori</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${!selectedCategory ? 'text-white' : 'opacity-40'}`} />
                    </button>

                    {/* Dynamic Category Items */}
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat.slug)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-deep-olive text-white shadow-xs font-semibold'
                              : 'text-charcoal hover:bg-warm-ivory hover:text-deep-olive'
                          }`}
                        >
                          <span className="truncate max-w-[170px] text-left">{cat.name}</span>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'opacity-40'}`} />
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Reset All Filters Button */}
                {(activeSearch || selectedCategory || selectedSort !== 'newest') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full py-2.5 px-3 rounded-xl border border-terracotta/30 text-terracotta hover:bg-terracotta/10 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hapus Semua Filter</span>
                  </button>
                )}

              </div>
            </aside>

            {/* RIGHT COLUMN: Product Catalog Grid */}
            <main className="lg:col-span-9 space-y-6">
              
              {/* Header Info Bar */}
              <div className="hidden lg:flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-light-beige shadow-xs text-xs">
                <div>
                  <span className="text-warm-gray font-light">Menampilkan </span>
                  <strong className="text-charcoal font-semibold">
                    {activeCategoryObj ? activeCategoryObj.name : activeSearch ? `Hasil untuk "${activeSearch}"` : 'Semua Produk'}
                  </strong>
                  <span className="text-warm-gray font-light"> ({pagination.total || products.length} item)</span>
                </div>

                {/* Sort Option Dropdown */}
                <div className="flex items-center space-x-2">
                  <label className="text-warm-gray font-medium hidden sm:inline-block">
                    Urutkan:
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSelectSort(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-light-beige bg-warm-ivory/50 text-charcoal text-xs font-medium focus:outline-none focus:border-deep-olive cursor-pointer"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="name-asc">Nama A-Z</option>
                    <option value="price-asc">Harga Terendah</option>
                    <option value="price-desc">Harga Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                  <button
                    onClick={() => setCurrentPageNum(1)}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-light-beige shadow-xs max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center text-warm-gray mx-auto">
                    <Package className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-charcoal">
                    {activeSearch
                      ? 'Tidak ada produk yang sesuai dengan pencarianmu.'
                      : selectedCategory
                      ? 'Belum ada produk dalam kategori ini.'
                      : 'Produk tidak ditemukan.'}
                  </h3>
                  <p className="text-xs text-warm-gray font-light">
                    Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda pada sidebar.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-block px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Lihat Semua Produk
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Simple Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                  <button
                    onClick={() => {
                      const prevPage = currentPageNum - 1;
                      setCurrentPageNum(prevPage);
                      syncUrlParams(selectedCategory, activeSearch, selectedSort, prevPage);
                    }}
                    disabled={currentPageNum <= 1}
                    className="px-4 py-2 rounded-xl border border-light-beige bg-white text-xs font-semibold text-charcoal hover:bg-warm-ivory disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    &larr; Sebelumnya
                  </button>
                  <span className="px-4 py-2 text-xs font-semibold text-warm-gray">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const nextPage = currentPageNum + 1;
                      setCurrentPageNum(nextPage);
                      syncUrlParams(selectedCategory, activeSearch, selectedSort, nextPage);
                    }}
                    disabled={currentPageNum >= pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-light-beige bg-white text-xs font-semibold text-charcoal hover:bg-warm-ivory disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Berikutnya &rarr;
                  </button>
                </div>
              )}

            </main>

          </div>

        </div>
      </Container>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-xs text-warm-gray font-sans">
        Memuat katalog produk Edgar Space...
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
