/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export required for Capacitor (Android/iOS)
  output: 'export',
  trailingSlash: true,

  images: {
    // next/image optimisation is unsupported in static-export mode
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'rukminim1.flixcart.com' },
      { protocol: 'https', hostname: 'rukminim2.flixcart.com' },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://suas-vikas.vercel.app/api',
  },
};

module.exports = nextConfig;
