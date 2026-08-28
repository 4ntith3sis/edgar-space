"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { navigationLinks } from '@/data/navigation';
import { SITE_NAME } from '@/libs/constants';

export default function MobileNav({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/koleksi?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — slides in from the left */}
      <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-warm-ivory p-5 shadow-2xl flex flex-col justify-between border-r border-light-beige animate-in slide-in-from-left duration-300">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-light-beige">
            <span className="font-serif text-xl tracking-wider text-charcoal font-normal">
              {SITE_NAME}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-warm-gray hover:text-charcoal transition-colors rounded-full hover:bg-soft-beige"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar inside Drawer */}
          <form onSubmit={handleSearchSubmit} className="relative mt-4 mb-2">
            <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-light-beige bg-white text-charcoal text-xs focus:outline-none focus:border-deep-olive"
            />
          </form>

          <nav className="mt-4 flex flex-col space-y-1">
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
                  onClick={onClose}
                  className={`font-sans text-sm transition-colors py-3 px-3 border-b border-light-beige/40 flex items-center justify-between rounded-xl ${
                    isActive
                      ? 'font-bold text-terracotta bg-terracotta/5 border-l-4 border-l-amber-500'
                      : 'font-medium text-charcoal hover:text-deep-olive hover:bg-soft-beige'
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-5 border-t border-light-beige space-y-1 text-xs text-warm-gray font-light">
          <p className="font-serif text-sm text-charcoal font-normal">
            Edgar Space
          </p>
          <p>
            Solusi modern untuk melengkapi rumah dan menciptakan ruang yang lebih nyaman.
          </p>
        </div>
      </div>
    </div>
  );
}
