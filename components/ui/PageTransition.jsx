'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageTransition — transisi ringan antar halaman (opacity + translateY kecil),
 * di-key berdasarkan pathname agar me-replay setiap navigasi.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
