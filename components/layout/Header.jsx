"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag } from 'lucide-react';
import Container from '@/components/ui/Container';
import AnnouncementBar from './AnnouncementBar';
import MobileNav from './MobileNav';
import { navigationLinks } from '@/data/navigation';
import { SITE_NAME } from '@/libs/constants';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalCount, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/koleksi?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Navbar */}
      <div className={`bg-white/95 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? 'border-b border-light-beige shadow-subtle' : 'border-b border-light-beige/70'
      }`}>
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Menu Trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 text-charcoal hover:text-deep-olive transition-colors rounded-lg focus:outline-none"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-block group">
                <span className="font-sans text-lg sm:text-2xl tracking-[0.12em] text-charcoal font-bold transition-colors group-hover:text-deep-olive uppercase">
                  {SITE_NAME}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Menu */}
            <nav aria-label="Navigasi Utama" className="hidden lg:flex items-center space-x-9">
              {navigationLinks.map((link) => {
                const isKoleksi = link.name === 'Koleksi' || link.href === '/produk' || link.href === '/koleksi';
                const isKoleksiActive = isKoleksi && (pathname.startsWith('/produk') || pathname.startsWith('/koleksi'));
                const isHomeActive = link.href === '/' && (pathname === '/' || pathname === '');
                const isOtherActive = link.href !== '/' && !isKoleksi && pathname.startsWith(link.href);
                const isActive = isHomeActive || isKoleksiActive || isOtherActive;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-sans text-xs sm:text-sm tracking-wide transition-colors py-1 relative ${
                      isActive
                        ? 'font-bold text-terracotta'
                        : 'font-medium text-charcoal/80 hover:text-deep-olive'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Search Input Pill & Shopping Cart Icon */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="p-1.5 text-charcoal hover:text-deep-olive transition-colors rounded-full sm:hidden"
                aria-label="Cari produk"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Desktop Search Form Pill */}
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:flex items-center">
                <Search className="w-4 h-4 text-warm-gray absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  aria-label="Cari produk"
                  className="w-40 md:w-52 text-xs py-2 pl-9 pr-4 rounded-full bg-[#F3EFE9] text-charcoal placeholder:text-warm-gray focus:outline-none focus:ring-1 focus:ring-deep-olive/40 border border-transparent transition-all"
                />
              </form>

              {/* Shopping Cart Icon */}
              <button
                onClick={toggleCart}
                className="p-1.5 sm:p-2 text-charcoal hover:text-terracotta transition-colors rounded-full relative cursor-pointer"
                aria-label="Keranjang Belanja"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {totalCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-terracotta text-white font-sans text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Mobile Search Bar */}
          {showMobileSearch && (
            <div className="pb-3 px-1 sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={(e) => { handleSearchSubmit(e); setShowMobileSearch(false); }} className="relative flex items-center">
                <Search className="w-4 h-4 text-warm-gray absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk di Edgar Space..."
                  aria-label="Cari produk mobile"
                  autoFocus
                  className="w-full text-xs py-2.5 pl-9 pr-4 rounded-full bg-[#F3EFE9] text-charcoal placeholder:text-warm-gray focus:outline-none focus:ring-1 focus:ring-deep-olive/40 border border-transparent"
                />
              </form>
            </div>
          )}
        </Container>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}

