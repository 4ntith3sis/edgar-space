import React from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';

export default function FinalCTA() {
  return (
    <section id="kontak" className="bg-soft-beige py-20 sm:py-28 border-t border-light-taupe">
      <Container>
        <Reveal variant="zoom">
        <div className="bg-surface-white border border-light-taupe rounded-card p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-subtle">
          <span className="text-xs font-sans font-semibold tracking-widest text-deep-olive uppercase block mb-3">
            Katalog Lengkap
          </span>

          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl text-charcoal font-bold max-w-2xl mx-auto leading-tight tracking-tight">
            Temukan Produk untuk Ruangmu
          </h2>

          <p className="mt-4 text-base sm:text-lg text-warm-gray font-sans font-light max-w-xl mx-auto leading-relaxed">
            Jelajahi koleksi pilihan kami untuk melengkapi ruang dan kebutuhan sehari-hari.
          </p>

          <div className="mt-8 flex justify-center">
            <Button href="/koleksi" variant="primary" size="lg" className="btn-lift">
              Jelajahi Koleksi
            </Button>
          </div>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}
