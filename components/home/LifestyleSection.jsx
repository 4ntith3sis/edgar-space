import React from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';

export default function LifestyleSection() {
  return (
    <section className="bg-soft-beige py-10 sm:py-16 lg:py-24 border-t border-b border-light-taupe">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Large Image Column */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative aspect-[16/11] w-full rounded-card overflow-hidden border border-light-taupe shadow-subtle bg-surface-white">
              <Image
                src="/images/lifestyle/lifestyle-main.svg"
                alt="Aksesori dan dekorasi kehidupan sehari-hari Edgar Space"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center">
            <span className="text-xs font-sans font-semibold tracking-widest text-muted-terracotta uppercase block mb-3">
              Filosofi Ruang
            </span>

            <h2 className="font-sans text-2xl sm:text-3xl text-charcoal font-bold tracking-tight leading-snug">
              Dirancang untuk Kehidupan Sehari-hari
            </h2>

            <p className="mt-6 text-base text-warm-gray font-sans font-light leading-relaxed">
              Detail kecil dapat membuat sebuah ruang terasa lebih nyaman, personal, dan lengkap.
            </p>

            <p className="mt-4 text-sm text-warm-gray font-sans font-light leading-relaxed">
              Setiap bentuk, tekstur, dan fungsi yang kami tawarkan dipilih secara cermat agar menyatu secara alami dalam rutinitas hunian Anda.
            </p>

            <div className="mt-8">
              <a
                href="#tentang-kami"
                className="inline-flex items-center font-sans text-sm font-medium text-deep-olive hover:text-deep-olive-hover group"
              >
                <span>Selengkapnya</span>
                <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
