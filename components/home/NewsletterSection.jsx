import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import { Headphones, ArrowRight, MessageSquare } from 'lucide-react';

export default function NewsletterSection() {
  return (
    <section aria-label="Bantuan & Layanan Pelanggan" className="bg-warm-ivory py-8 sm:py-14 font-sans">
      <Container>
        <Reveal variant="zoom">
        <div className="bg-[#1E251E] rounded-3xl overflow-hidden border border-[#2D382D] shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center text-white">
          {/* Left Column: Photorealistic desk setup image */}
          <Reveal variant="right" className="lg:col-span-5 relative min-h-[250px] sm:min-h-[350px] lg:min-h-[380px] bg-soft-beige">
            <Image
              src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80"
              alt="Layanan bantuan & konsultasi Edgar Space"
              fill
              className="object-cover kenburns"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </Reveal>

          {/* Right Column: Assistance Title, Description, and Contact CTA */}
          <Reveal variant="left" delay={1} className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-terracotta/20 border border-terracotta/40 text-terracotta text-xs font-mono tracking-widest uppercase w-fit">
              <Headphones className="w-3.5 h-3.5" />
              <span>Bantuan Pelanggan</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FAF7F2] font-normal leading-tight">
              Butuh Rekomendasi Produk atau Informasi Pesanan?
            </h2>

            <p className="text-xs sm:text-sm text-[#C5C1B8] font-light leading-relaxed max-w-xl">
              Tim Edgar Space siap membantu pertanyaan Anda mengenai spesifikasi material, saran keserasian ruangan, hingga proses pemesanan dan pengiriman.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/kontak"
                className="btn-lift px-6 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-colors inline-flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi Kami</span>
              </Link>
              <Link
                href="/produk"
                className="btn-lift btn-arrow px-6 py-3.5 rounded-xl border border-white/20 text-[#FAF7F2] hover:bg-white/10 text-xs sm:text-sm font-semibold transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}


