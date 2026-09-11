/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    // Remote patterns for next/image when optimization is enabled later.
    // Supabase Storage domain is derived from NEXT_PUBLIC_SUPABASE_URL at runtime;
    // add the concrete hostname here if you set images.unoptimized to false.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async rewrites() {
    if (isProduction) {
      return [
        {
          source: '/koleksi',
          destination: '/produk',
        },
      ];
    }
    return [
      {
        source: '/koleksi',
        destination: '/produk',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5050/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

