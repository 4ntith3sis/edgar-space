'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import PageTransition from '@/components/ui/PageTransition';
import { CartProvider } from '@/context/CartContext';

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-grow">
        <PageTransition>{children}</PageTransition>
      </main>
      <CartDrawer />
      <Footer />
    </CartProvider>
  );
}

