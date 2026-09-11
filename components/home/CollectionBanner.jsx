'use client';

import React from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import useParallax from '@/hooks/useParallax';

export default function CollectionBanner() {
  const parallaxRef = useParallax(16);
  return (
    <section aria-label="Banner Koleksi Baru" className="bg-warm-ivory py-6 sm:py-10">
      <Container>
        <Reveal variant="zoom">
        <div className="bg-deep-olive rounded-3xl overflow-hidden shadow-subtle grid grid-cols-1 lg:grid-cols-12 items-stretch border border-deep-olive">
          {/* Left Column: Deep Olive Background with Koleksi Baru Tag & White Button */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-center text-white">
            <span className="text-xs font-sans font-semibold tracking-widest text-[#D8A657] block mb-3">
              New Collection
            </span>

            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="block mb-2 sm:mb-3">Sentuhan Modern</span>
              <span className="block leading-snug">Untuk Setiap Ruang</span>
            </h2>

            <p className="text-xs sm:text-sm text-white/80 font-sans font-light leading-relaxed max-w-md mb-8">
              Temukan koleksi terbaru dengan desain elegan dan fungsional untuk rumah impianmu.
            </p>

            <div>
              <Button href="/koleksi" variant="white" size="lg" className="btn-lift btn-arrow w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-charcoal shadow-xs bg-white hover:bg-warm-ivory transition-colors cursor-pointer">
                Lihat Koleksi
              </Button>
            </div>
          </div>

          {/* Right Column: Photorealistic Living Room Image */}
          <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[400px] lg:min-h-full bg-soft-beige overflow-hidden">
            <div ref={parallaxRef} className="parallax-img absolute -inset-y-6 inset-x-0">
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                alt="Koleksi terbaru desain interior rumah modern Edgar Space"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          </div>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}

