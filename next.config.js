/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
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
        source: '/uploads/:path*',
        destination: 'http://localhost:5050/uploads/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5050/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

