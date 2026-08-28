import React from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { ShieldCheck, Truck, Award } from 'lucide-react';

export default function Hero() {
  const features = [
    {
      icon: Award,
      title: "Kualitas Terbaik",
      description: "Produk pilihan dengan kualitas premium"
    },
    {
      icon: Truck,
      title: "Pengiriman Cepat",
      description: "Pengiriman aman & tepat waktu"
    },
    {
      icon: ShieldCheck,
      title: "Garansi Produk",
      description: "Garansi terpercaya untuk setiap pembelian"
    }
  ];

  return (
    <section aria-label="Hero Section" className="bg-warm-ivory py-4 sm:py-8 lg:py-10 font-sans">
      <Container>
        {/* Main Rounded Hero Container */}
        <div className="bg-[#F8F6F2] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 border border-light-beige shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left Column: 45% — shows BELOW image on mobile */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <h1 className="font-sans text-2xl sm:text-3xl lg:text-[40px] xl:text-[44px] font-extrabold text-charcoal tracking-tight leading-[1.2] mb-4 sm:mb-6">
              <span className="block mb-1 sm:mb-3">Jadikan Ruangmu</span>
              <span className="block">Terasa Seperti Rumah.</span>
            </h1>

            <p className="text-sm text-warm-gray font-sans font-normal leading-relaxed max-w-lg mb-6 sm:mb-8">
              Modern living solutions home accessories and more exclusively at Edgar Space.
            </p>

            <div>
              <Button href="/koleksi" variant="terracotta" size="lg" className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-terracotta hover:bg-terracotta-hover text-white transition-colors cursor-pointer shadow-xs">
                Jelajahi Koleksi
              </Button>
            </div>
          </div>

          {/* Right Column: 55% — shows FIRST on mobile */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-light-beige shadow-subtle bg-soft-beige">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Interior rumah modern hangat Edgar Space"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          </div>
        </div>

        {/* 3 Value Proposition Cards Row */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-light-beige shadow-xs flex items-center space-x-3 sm:space-x-4 transition-all duration-300 hover:shadow-subtle hover:border-terracotta/30">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta shrink-0 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-charcoal mb-0.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-warm-gray font-normal leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
