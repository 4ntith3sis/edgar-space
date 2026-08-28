'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/libs/utils';
import { getImageUrl } from '@/libs/api';

export default function CartDrawer() {
  const {
    cartItems,
    setCartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    showToast,
    totalCount,
    totalPrice,
  } = useCart();

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setCheckoutLoading(true);

      const itemsPayload = cartItems.map((i) => ({
        productId: i.id,
        quantity: i.quantity
      }));

      const res = await fetch('/api/checkout/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload })
      });

      const data = await res.json();

      if (data.success && data.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        const errorMsg = data.message || 'Beberapa produk dalam keranjang sudah tidak tersedia dengan jumlah tersebut.';
        showToast(errorMsg, 'error');

        // Update cart with validated items from backend if returned
        if (data.data?.validatedItems && Array.isArray(data.data.validatedItems)) {
          const validatedMap = new Map(data.data.validatedItems.map((v) => [v.productId, v]));
          setCartItems((prev) =>
            prev
              .map((item) => {
                const val = validatedMap.get(item.id);
                if (!val) return null; // Out of stock / deleted
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
      showToast('Terjadi kesalahan saat memproses checkout.', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-sm sm:max-w-md bg-[#FAF8F5] border-l border-light-beige shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-6 py-5 bg-white border-b border-light-beige flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-terracotta" />
              <h2 className="font-serif text-xl font-normal text-charcoal">
                Keranjang Belanja
              </h2>
              {totalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold font-sans rounded-full bg-terracotta/10 text-terracotta">
                  {totalCount} item
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-warm-gray hover:text-charcoal transition-colors rounded-full hover:bg-warm-ivory"
              aria-label="Tutup Keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-warm-beige flex items-center justify-center text-warm-gray mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-lg text-charcoal font-normal mb-1">
                  Keranjangmu masih kosong.
                </h3>
                <p className="text-xs text-warm-gray font-light leading-relaxed max-w-xs mb-6">
                  Temukan koleksi perlengkapan dan dekorasi rumah bergaya modern di Edgar Space.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const imageSrc = getImageUrl(item.thumbnail);
                return (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 rounded-2xl border border-light-beige flex items-center space-x-4 shadow-xs"
                  >
                    {/* Item Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-soft-beige shrink-0 border border-light-beige">
                      <Image
                        src={imageSrc || 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans text-xs sm:text-sm font-semibold text-charcoal truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs font-bold text-terracotta mt-0.5">
                        {formatRupiah(item.price)}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center border border-light-beige rounded-lg bg-warm-ivory">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-warm-gray hover:text-charcoal transition-colors"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-charcoal font-sans">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-warm-gray hover:text-charcoal transition-colors"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-warm-gray">
                          Subtotal: <strong className="text-charcoal font-semibold">{formatRupiah(item.price * item.quantity)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Trash Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-warm-gray/70 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & WhatsApp Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-light-beige space-y-3">
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between text-warm-gray">
                  <span>Total Produk</span>
                  <span>{totalCount} item</span>
                </div>
                <div className="pt-2 border-t border-light-beige flex justify-between text-sm sm:text-base font-bold text-charcoal">
                  <span>Total</span>
                  <span className="text-terracotta">{formatRupiah(totalPrice)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/keranjang"
                  onClick={closeCart}
                  className="py-3 px-4 rounded-xl border border-light-beige hover:bg-warm-ivory text-charcoal text-xs font-semibold text-center transition-colors flex items-center justify-center"
                >
                  Lihat Keranjang
                </Link>
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={checkoutLoading}
                  className="py-3 px-4 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
