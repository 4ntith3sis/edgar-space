'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, 
  FolderTree, 
  CheckCircle2,
  XCircle, 
  AlertTriangle,
  Plus, 
  Eye,
  Edit,
  ArrowRight,
  Boxes, 
  Loader2 
} from 'lucide-react';
import { fetchApi, getImageUrl } from '@/libs/api';
import { formatRupiah } from '@/libs/utils';
import StockModal from '@/components/admin/StockModal';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes] = await Promise.all([
        fetchApi('/admin/dashboard'),
        fetchApi('/admin/products?limit=5&sort=newest')
      ]);

      if (dashRes.success) {
        setData(dashRes.data);
      }
      if (prodRes.success && prodRes.data?.products) {
        setRecentProducts(prodRes.data.products);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenStockModal = (product) => {
    setSelectedStockProduct(product);
    setIsStockModalOpen(true);
  };

  const handleStockSuccess = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-deep-olive" />
        <p className="text-sm text-warm-gray">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="text-sm text-red-700 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { stats, lowStockList = [] } = data || {};
  const totalAvailable = stats?.totalProducts ? (stats.totalProducts - (stats.outOfStockProducts || 0)) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-warm-gray mt-1 font-light">
            Kelola produk, kategori, dan stok Edgar Space.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/produk/tambah"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-deep-olive hover:bg-deep-olive-hover text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </Link>
          <Link
            href="/admin/kategori/tambah"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface-white border border-light-beige hover:border-charcoal text-charcoal text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Produk */}
        <div className="bg-white p-5 rounded-2xl border border-light-beige shadow-xs flex items-center justify-between">
          <div>
            <span className="text-3xl font-serif font-bold text-charcoal block">
              {stats?.totalProducts ?? 0}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray mt-1 block">
              Total Produk
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-soft-beige flex items-center justify-center text-deep-olive">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-light-beige shadow-xs flex items-center justify-between">
          <div>
            <span className="text-3xl font-serif font-bold text-charcoal block">
              {stats?.totalCategories ?? 0}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray mt-1 block">
              Total Kategori
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-soft-beige flex items-center justify-center text-deep-olive">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        {/* Produk Tersedia */}
        <div className="bg-white p-5 rounded-2xl border border-light-beige shadow-xs flex items-center justify-between">
          <div>
            <span className="text-3xl font-serif font-bold text-emerald-700 block">
              {totalAvailable}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray mt-1 block">
              Produk Tersedia
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Produk Habis */}
        <div className="bg-white p-5 rounded-2xl border border-light-beige shadow-xs flex items-center justify-between">
          <div>
            <span className="text-3xl font-serif font-bold text-red-600 block">
              {stats?.outOfStockProducts ?? 0}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray mt-1 block">
              Produk Habis
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section: Produk Terbaru Summary Table */}
      <div className="bg-white rounded-2xl border border-light-beige p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-normal text-charcoal">
              Produk Terbaru
            </h2>
            <p className="text-xs text-warm-gray mt-0.5">
              Daftar produk yang baru ditambahkan ke toko
            </p>
          </div>
          <Link
            href="/admin/produk"
            className="text-xs font-semibold text-deep-olive hover:underline flex items-center space-x-1"
          >
            <span>Kelola Produk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-warm-gray">
            Belum ada produk. Klik &ldquo;+ Tambah Produk&rdquo; untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans min-w-[600px]">
              <thead className="bg-soft-beige/50 text-warm-gray uppercase text-[10px] tracking-wider border-y border-light-beige">
                <tr>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Stok</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-beige">
                {recentProducts.map((prod) => {
                  const imageSrc = getImageUrl(prod.thumbnail);
                  const isAvailable = prod.stock > 0;
                  return (
                    <tr key={prod.id} className="hover:bg-warm-ivory/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden relative bg-soft-beige shrink-0 border border-light-beige">
                            <Image
                              src={imageSrc || 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=150&q=80'}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-charcoal truncate max-w-[200px]">
                            {prod.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-warm-gray">
                        {prod.category || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-charcoal">
                        {formatRupiah(prod.price)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-charcoal">
                        {prod.stock}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          prod.stock === 0 
                            ? 'bg-red-100 text-red-700' 
                            : prod.stock <= 5 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prod.stock === 0 ? 'Habis' : prod.stock <= 5 ? 'Stok Menipis' : 'Tersedia'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/produk/${prod.slug}`}
                          target="_blank"
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-warm-gray hover:text-charcoal hover:bg-soft-beige"
                          title="Lihat Public"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/produk/${prod.id}/edit`}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-deep-olive hover:bg-soft-beige"
                          title="Edit Produk"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section: Stok Menipis */}
      <div className="bg-white rounded-2xl border border-light-beige p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-normal text-charcoal flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Stok Menipis</span>
            </h2>
            <p className="text-xs text-warm-gray mt-0.5">
              Produk dengan jumlah stok &le; 5 unit
            </p>
          </div>
          <Link
            href="/admin/stok"
            className="text-xs font-semibold text-deep-olive hover:underline flex items-center space-x-1"
          >
            <span>Manajemen Stok</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lowStockList.length === 0 ? (
          <div className="py-8 text-center text-xs text-warm-gray">
            Semua produk memiliki jumlah stok yang mencukupi.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockList.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-light-beige bg-warm-ivory/20 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-soft-beige shrink-0 border border-light-beige">
                    <Image
                      src={getImageUrl(item.thumbnail)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-charcoal truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-warm-gray mt-0.5">
                      Stok: <strong className="text-charcoal font-bold">{item.stock}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.stock === 0 ? 'Habis' : 'Stok Menipis'}
                  </span>
                  <button
                    onClick={() => handleOpenStockModal(item)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-deep-olive hover:bg-soft-beige rounded-lg border border-light-beige flex items-center space-x-1"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Modal */}
      <StockModal
        isOpen={isStockModalOpen}
        product={selectedStockProduct}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={handleStockSuccess}
      />
    </div>
  );
}
