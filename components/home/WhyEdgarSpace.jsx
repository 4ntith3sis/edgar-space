import React from 'react';
import Container from '@/components/ui/Container';

export default function WhyEdgarSpace() {
  const benefits = [
    {
      number: "01",
      title: "Pilihan yang Dikurasi",
      description: "Produk yang dipilih dengan mempertimbangkan fungsi, estetika, dan kebutuhan sehari-hari."
    },
    {
      number: "02",
      title: "Sederhana & Fungsional",
      description: "Produk yang menggabungkan fungsi dengan desain yang bersih dan mudah digunakan."
    },
    {
      number: "03",
      title: "Untuk Ruangmu",
      description: "Detail kecil yang membantu membuat rumah terasa lebih nyaman dan personal."
    }
  ];

  return (
    <section aria-label="Keunggulan Edgar Space" className="bg-warm-ivory py-12 sm:py-20 lg:py-28">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16 lg:mb-20">
          <span className="text-xs font-sans font-semibold tracking-widest text-deep-olive uppercase block mb-3">
            Nilai Pembeda
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl text-charcoal font-bold tracking-tight">
            Mengapa Pilih Edgar Space?
          </h2>
        </div>

        {/* 3 Columns Editorial Layout with Number Badges & Whitespace */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-white/60 p-5 sm:p-8 lg:p-10 rounded-2xl border border-light-beige flex flex-col justify-between transition-all duration-300 hover:bg-white hover:shadow-subtle hover:border-deep-olive/30"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-sans text-2xl sm:text-3xl text-deep-olive/80 font-bold">
                    {item.number}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-terracotta" />
                </div>

                <h3 className="font-sans text-lg sm:text-xl text-charcoal font-bold mb-3">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-warm-gray font-sans font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
