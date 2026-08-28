'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Boxes, 
  Search, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight,
  History
} from 'lucide-react';
import { fetchApi, getImageUrl } from '@/libs/api';
import StockModal from '@/components/admin/StockModal';

export default function AdminStockPage() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history'

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError('');

      const [prodRes, histRes] = await Promise.all([
        fetchApi('/admin/stock?limit=100'),
        fetchApi('/admin/stock/history')
      ]);

      if (prodRes.success && prodRes.data?.products) {
        setProducts(prodRes.data.products);
      }
      if (histRes.success) {
        setHistory(histRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data stok.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const handleOpenUpdate = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Manajemen Stok
          </h1>
          <p className="text-xs sm:text-sm text-warm-gray mt-1 font-light">
            Kelola jumlah stok produk secara manual.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-white border border-light-beige rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'inventory'
                ? 'bg-deep-olive text-white shadow-xs'
                : 'text-warm-gray hover:text-charcoal'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stok Produk</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-deep-olive text-white shadow-xs'
                : 'text-warm-gray hover:text-charcoal'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Mutasi</span>
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-light-beige shadow-xs">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk atau kategori..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-beige bg-warm-ivory/30 text-charcoal text-xs focus:outline-none focus:border-deep-olive focus:ring-1 focus:ring-deep-olive"
              />
              <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Stock Table */}
          {loading ? (
            <div className="py-20 bg-white rounded-2xl border border-light-beige flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-deep-olive" />
              <p className="text-xs text-warm-gray">Memuat data stok produk...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
              <p className="text-xs text-red-700 font-medium">{error}</p>
              <button
                onClick={loadStockData}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-light-beige text-center text-xs text-warm-gray">
              Tidak ada data stok.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-light-beige shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans min-w-[600px]">
                <thead className="bg-soft-beige/50 text-warm-gray uppercase text-[10px] tracking-wider border-b border-light-beige">
                  <tr>
                    <th className="py-3.5 px-4">Produk</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Stok Saat Ini</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-beige">
                  {filteredProducts.map((product) => {
                    const imageSrc = getImageUrl(product.thumbnail);
                    return (
                      <tr key={product.id} className="hover:bg-warm-ivory/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-soft-beige shrink-0 border border-light-beige">
                              <Image
                                src={imageSrc || 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=150&q=80'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-semibold text-charcoal truncate max-w-[240px]">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-warm-gray">
                          {product.category || '-'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-sm text-charcoal">
                          {product.stock}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            product.stock === 0 
                              ? 'bg-red-100 text-red-700' 
                              : product.stock <= 5 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {product.stock === 0 ? 'Habis' : product.stock <= 5 ? 'Stok Menipis' : 'Tersedia'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenUpdate(product)}
                            className="px-3 py-1.5 rounded-xl bg-deep-olive hover:bg-deep-olive-hover text-white text-xs font-semibold transition-colors shadow-xs"
                          >
                            Update Stok
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* History View */
        <div className="bg-white rounded-2xl border border-light-beige shadow-xs overflow-hidden">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-warm-gray">
              Belum ada riwayat mutasi stok.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans min-w-[700px]">
              <thead className="bg-soft-beige/50 text-warm-gray uppercase text-[10px] tracking-wider border-b border-light-beige">
                <tr>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Jenis Mutasi</th>
                  <th className="py-3.5 px-4">Jumlah</th>
                  <th className="py-3.5 px-4">Stok (Sebelum &rarr; Sesudah)</th>
                  <th className="py-3.5 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-beige">
                {history.map((m) => (
                  <tr key={m.id} className="hover:bg-warm-ivory/30 transition-colors">
                    <td className="py-3.5 px-4 text-warm-gray text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">
                      {m.productName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        m.type === 'RESTOCK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.type === 'REDUCTION'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-charcoal/10 text-charcoal'
                      }`}>
                        {m.type === 'RESTOCK' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : m.type === 'REDUCTION' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : null}
                        <span>{m.typeLabel || m.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal">
                      {m.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-warm-gray">
                      {m.previousStock} &rarr; <strong className="text-charcoal">{m.newStock}</strong>
                    </td>
                    <td className="py-3.5 px-4 text-warm-gray text-xs italic">
                      {m.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Modal */}
      <StockModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadStockData()}
      />
    </div>
  );
}
