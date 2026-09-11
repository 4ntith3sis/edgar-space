import React from 'react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import { Compass, Tag, ShieldCheck, Headphones } from 'lucide-react';

export default function AboutSection() {
  const commitments = [
    { value: "100%", label: "Produk Terkurasi" },
    { value: "Safe", label: "Garansi Tiba Aman" },
    { value: "Strict", label: "Pemeriksaan QC" }
  ];

  const features = [
    {
      icon: Compass,
      title: "Desain Modern",
      description: "Produk dengan desain kekinian yang elegan & fungsional"
    },
    {
      icon: Tag,
      title: "Harga Terjangkau",
      description: "Kualitas terbaik dengan harga yang bersahabat"
    },
    {
      icon: ShieldCheck,
      title: "Kualitas Terjamin",
      description: "Kami memastikan setiap produk melewati standar kualitas tinggi"
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Layanan pelanggan siap membantu kebutuhan Anda"
    }
  ];

  return (
    <section id="tentang-kami" aria-label="Tentang Edgar Space" className="bg-warm-ivory py-12 sm:py-16">
      <Container>
        <div className="bg-[#F8F6F2] p-8 sm:p-12 lg:p-14 rounded-3xl border border-light-beige shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Title, Description, and 3 Stats */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Reveal>
              <h2 className="font-sans text-2xl sm:text-3xl text-charcoal font-bold tracking-tight mb-4">
                Tentang Edgar Space
              </h2>
            </Reveal>

            <Reveal delay={1}>
              <p className="text-xs sm:text-sm text-warm-gray font-sans font-light leading-relaxed mb-8 max-w-lg">
                Edgar Space hadir untuk menyediakan berbagai produk dekorasi dan kebutuhan rumah tangga dengan desain modern, fungsional, dan berkualitas tinggi untuk melengkapi setiap ruang di rumah Anda.
              </p>
            </Reveal>

            {/* 3 Stats in a Row */}
            <Reveal delay={2} className="grid grid-cols-3 gap-4 pt-6 border-t border-light-beige">
              {commitments.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <span className="font-sans text-xl sm:text-2xl text-charcoal font-bold">
                    {item.value}
                  </span>
                  <span className="text-[11px] sm:text-xs text-warm-gray font-light mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </Reveal>
          </div>

          {/* Right Column: 2x2 Benefit Grid with Terracotta Line Icons */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={index} delay={Math.min(index, 3)}>
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta shrink-0 mt-0.5 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-charcoal mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-warm-gray font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

