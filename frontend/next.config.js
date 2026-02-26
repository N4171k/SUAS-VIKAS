/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Capacitor: export as fully static site
  output: 'export',
  trailingSlash: true,

  images: {
    // next/image can't optimise images in static export mode
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.unsplash.com' },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
