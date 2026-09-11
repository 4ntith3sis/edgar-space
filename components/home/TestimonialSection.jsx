import React from 'react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import { ShieldCheck, PackageCheck, Headphones, CheckCircle } from 'lucide-react';

export default function TestimonialSection() {
  const serviceGuarantees = [
    {
      id: 1,
      icon: ShieldCheck,
      title: "Kurasi & Standar QC",
      description: "Setiap barang diuji secara fisik untuk memastikan estetika, presisi ukuran, serta ketahanan bahan sebelum dipasarkan."
    },
    {
      id: 2,
      icon: PackageCheck,
      title: "Pengemasan Aman",
      description: "Dikemas rapi dengan proteksi berlapis. Apabila barang diterima dalam kondisi rusak akibat pengiriman, kami berikan jaminan penggantian."
    },
    {
      id: 3,
      icon: Headphones,
      title: "Layanan Respon Cepat",
      description: "Tim admin Edgar Space siap membantu pertanyaan seputar detail spesifikasi produk, stok, hingga pemantauan pesanan Anda."
    }
  ];

  return (
    <section aria-label="Standar Layanan Belanja" className="bg-warm-ivory py-12 sm:py-16 font-sans">
      <Container>
        <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <span className="text-xs font-mono font-semibold tracking-widest text-deep-olive uppercase block">
            Jaminan Kenyamanan
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl text-charcoal font-bold tracking-tight">
            Standar Layanan &amp; Komitmen Kami
          </h2>
          <p className="text-xs sm:text-sm text-warm-gray font-light leading-relaxed">
            Komitmen Edgar Space untuk memberikan pengalaman belanja perlengkapan rumah yang aman dan terpercaya.
          </p>
        </div>
        </Reveal>

        {/* 3 Service Guarantee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {serviceGuarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.id} delay={index}>
              <div
                className="bg-[#F8F6F2] p-6 sm:p-8 rounded-3xl border border-light-beige shadow-subtle flex flex-col justify-between hover:border-deep-olive/40 hover:shadow-md transition-all duration-300 h-full"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-sans text-base sm:text-lg font-bold text-charcoal">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal/80 font-sans font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-6 mt-6 border-t border-light-beige text-xs text-deep-olive font-semibold">
                  <CheckCircle className="w-4 h-4 text-terracotta shrink-0" />
                  <span>Jaminan Resmi Edgar Space</span>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}


