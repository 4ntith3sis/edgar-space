'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  FileText,
  AlertCircle
} from 'lucide-react';
import Container from '@/components/ui/Container';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/libs/utils';
import { getImageUrl } from '@/libs/api';

export default function KeranjangPage() {
  const {
    cartItems,
    setCartItems,
    removeFromCart,
    updateQuantity,
    showToast,
    totalPrice,
    totalCount,
  } = useCart();

  // Customer Information Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleWhatsAppCheckout = async (e) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return;
    setCheckoutError('');

    try {
      setCheckoutLoading(true);

      const itemsPayload = cartItems.map((i) => ({
        productId: i.id,
        quantity: i.quantity
      }));

      const customerPayload = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        note: customerNote.trim()
      };

      const res = await fetch('/api/checkout/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          customer: customerPayload
        })
      });

      const data = await res.json();

      if (data.success && data.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        const errorMsg = data.message || 'Beberapa produk dalam keranjang sudah tidak tersedia dengan jumlah tersebut.';
        setCheckoutError(errorMsg);
        showToast(errorMsg, 'error');

        // Update cart if backend returned validated items
        if (data.data?.validatedItems && Array.isArray(data.data.validatedItems)) {
          const validatedMap = new Map(data.data.validatedItems.map((v) => [v.productId, v]));
          setCartItems((prev) =>
            prev
              .map((item) => {
                const val = validatedMap.get(item.id);
                if (!val) return null;
                return {
                  ...item,
                  price: val.price,
                  quantity: Math.min(item.quantity, val.availableStock)
                };
              })
              .filter(Boolean)
          );
        }
      }
    } catch (err) {
      const msg = 'Terjadi kesalahan sistem saat menghubungi server checkout.';
      setCheckoutError(msg);
      showToast(msg, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <section className="bg-warm-ivory min-h-[75vh] py-8 sm:py-16 pb-24 lg:pb-16">
      <Container>
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center space-x-3 border-b border-light-beige pb-6">
            <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
                Keranjang Belanja
              </h1>
              <p className="text-xs text-warm-gray mt-0.5 font-light">
                Periksa pesanan Anda sebelum melanjutkan ke WhatsApp Checkout.
              </p>
            </div>
            {totalCount > 0 && (
              <span className="ml-auto px-3.5 py-1 text-xs font-bold font-sans rounded-full bg-terracotta text-white shadow-xs">
                {totalCount} item
              </span>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-light-beige shadow-xs max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center text-warm-gray mx-auto">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-charcoal font-normal">
                  Keranjangmu masih kosong.
                </h2>
                <p className="text-xs sm:text-sm text-warm-gray font-light max-w-sm mx-auto mt-1">
                  Temukan pilihan perabot dan dekorasi rumah modern khas Edgar Space.
                </p>
              </div>
              <Link
                href="/produk"
                className="inline-block px-8 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT Column: Product Item List & Customer Info Form */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Product List Card */}
                <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-normal text-charcoal border-b border-light-beige pb-3">
                    Daftar Barang Pesanan
                  </h3>

                  <div className="divide-y divide-light-beige space-y-4 pt-1">
                    {cartItems.map((item) => {
                      const rawItemImage = item.thumbnail || item.image_url || item.image || (Array.isArray(item.images) && item.images[0]) || '';
                      const imageSrc = getImageUrl(rawItemImage, item.slug);
                      return (
                        <div
                          key={item.id}
                          className="pt-4 first:pt-0 flex items-center space-x-4"
                        >
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-soft-beige shrink-0 border border-light-beige flex items-center justify-center">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <ShoppingBag className="w-8 h-8 text-warm-gray opacity-50" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-sans text-sm font-semibold text-charcoal truncate">
                              {item.name}
                            </h4>
                            <div className="text-xs font-bold text-terracotta mt-0.5">
                              {formatRupiah(item.price)}
                            </div>

                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center border border-light-beige rounded-xl bg-warm-ivory">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 text-warm-gray hover:text-charcoal transition-colors"
                                  aria-label="Kurangi"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 text-xs font-bold text-charcoal">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 text-warm-gray hover:text-charcoal transition-colors"
                                  aria-label="Tambah"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="text-xs text-warm-gray">
                                Subtotal: <strong className="text-charcoal font-semibold">{formatRupiah(item.price * item.quantity)}</strong>
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-warm-gray hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                            aria-label="Hapus produk"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Information Form */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-light-beige shadow-xs space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-normal text-charcoal">
                      Informasi Pemesan
                    </h3>
                    <p className="text-xs text-warm-gray mt-0.5">
                      Data ini akan otomatis disertakan ke dalam pesan WhatsApp pemesanan.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-warm-gray" />
                        <span>Nama Pemesan</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Daffa"
                        className="w-full px-4 py-3 rounded-xl border border-light-beige text-charcoal text-xs sm:text-sm focus:outline-none focus:border-deep-olive"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-warm-gray" />
                          <span>Nomor WhatsApp</span>
                        </label>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="08123456789"
                          className="w-full px-4 py-3 rounded-xl border border-light-beige text-charcoal text-xs sm:text-sm focus:outline-none focus:border-deep-olive"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-warm-gray" />
                          <span>Kota / Alamat Pengiriman</span>
                        </label>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Bandung, Jawa Barat"
                          className="w-full px-4 py-3 rounded-xl border border-light-beige text-charcoal text-xs sm:text-sm focus:outline-none focus:border-deep-olive"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-warm-gray" />
                        <span>Catatan Pesanan (Opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="Contoh: Mohon dikirim sore hari / dibungkus rapi"
                        className="w-full px-4 py-3 rounded-xl border border-light-beige text-charcoal text-xs sm:text-sm focus:outline-none focus:border-deep-olive"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT Column: Order Summary & WhatsApp Checkout */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-light-beige shadow-xs space-y-5 sticky top-24">
                <h3 className="font-serif text-xl font-normal text-charcoal border-b border-light-beige pb-3">
                  Ringkasan Pesanan
                </h3>

                {checkoutError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs sm:text-sm font-sans">
                  <div className="flex justify-between text-warm-gray">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-charcoal">{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-warm-gray">
                    <span>Total Produk</span>
                    <span>{totalCount} item</span>
                  </div>
                  <div className="flex justify-between text-warm-gray">
                    <span>Metode Checkout</span>
                    <span className="font-semibold text-deep-olive">WhatsApp Direct</span>
                  </div>
                  <div className="pt-4 border-t border-light-beige flex justify-between text-base sm:text-lg font-bold text-charcoal">
                    <span>Total Tagihan</span>
                    <span className="text-terracotta">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleWhatsAppCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memvalidasi Stok & Harga...</span>
                      </>
                    ) : (
                      <>
                        <span>Checkout via WhatsApp</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-warm-gray text-center mt-2.5">
                    Stok dan harga akan divalidasi langsung dari server sebelum diarahkan ke WhatsApp.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </Container>

      {/* Sticky Mobile Checkout Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-beige p-4 shadow-2xl lg:hidden flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-warm-gray uppercase tracking-wider block">Total Tagihan</span>
            <span className="text-base font-bold text-terracotta">{formatRupiah(totalPrice)}</span>
          </div>
          <button
            onClick={handleWhatsAppCheckout}
            disabled={checkoutLoading}
            className="py-3 px-5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Checkout WA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
