/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: Use remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
    // Cache optimized images for 1 hour (in seconds)
    minimumCacheTTL: 3600,
    // Use fewer device sizes to reduce optimization work
    deviceSizes: [640, 1080, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Use WebP format for all optimized images
    formats: ['image/webp'],
  },
  // Fix: Set turbopack root to prevent lockfile detection issues
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
