import React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { navigationLinks } from '@/data/navigation';
import { SITE_NAME } from '@/libs/constants';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const helpLinks = [
    { name: 'FAQ', href: '/faq' },
    { name: 'Cara Belanja', href: '/cara-belanja' },
    { name: 'Pengiriman', href: '/pengiriman' },
    { name: 'Retur & Refund', href: '/retur' },
    { name: 'Syarat & Ketentuan', href: '/syarat' },
  ];

  const infoLinks = [
    { name: 'Tentang Kami', href: '/tentang-kami' },
    { name: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className="bg-[#F8F6F2] border-t border-light-beige text-charcoal">
      <div className="pt-16 pb-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12">
            {/* Column 1: Brand & Social Links */}
            <div className="lg:col-span-1 space-y-4">
              <Link href="/" className="inline-block">
                <span className="font-sans text-xl sm:text-2xl tracking-[0.12em] font-bold text-charcoal uppercase">
                  {SITE_NAME}
                </span>
              </Link>
              <p className="text-xs text-warm-gray font-sans font-light leading-relaxed">
                Modern living solutions home accessories and more exclusively at Edgar Space.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-light-beige bg-white flex items-center justify-center text-warm-gray hover:text-deep-olive hover:border-deep-olive transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-light-beige bg-white flex items-center justify-center text-warm-gray hover:text-deep-olive hover:border-deep-olive transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-light-beige bg-white flex items-center justify-center text-warm-gray hover:text-deep-olive hover:border-deep-olive transition-colors font-bold text-xs"
                  aria-label="TikTok"
                >
                  ♪
                </a>
              </div>
            </div>

            {/* Column 2: Menu */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">
                Menu
              </h3>
              <ul className="space-y-2.5 text-xs">
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link text-warm-gray hover:text-deep-olive font-light transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Bantuan */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">
                Bantuan
              </h3>
              <ul className="space-y-2.5 text-xs">
                {helpLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link text-warm-gray hover:text-deep-olive font-light transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Informasi */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">
                Informasi
              </h3>
              <ul className="space-y-2.5 text-xs">
                {infoLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="footer-link text-warm-gray hover:text-deep-olive font-light transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Hubungi Kami */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs font-bold text-charcoal uppercase tracking-wider">
                Hubungi Kami
              </h3>
              <ul className="space-y-2.5 text-xs text-warm-gray font-light">
                <li className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-deep-olive shrink-0" />
                  <span>0812-3456-7890</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-deep-olive shrink-0" />
                  <span>halo@edgarspace.com</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-deep-olive shrink-0 mt-0.5" />
                  <span>Jl. Setiabudi No. 45, Bandung, Jawa Barat, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar Dark Olive */}
      <div className="bg-deep-olive text-white/90 py-4 text-xs font-sans">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2024 Edgar Space. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}

