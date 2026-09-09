/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: Use remotePatterns instead of deprecated domains
  images: {
    // Bypass Vercel's image optimization to avoid 402 quota errors on free plan
    // Images are already optimized (avif/webp/jpg) so no quality loss
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
  },
  // Fix: Set turbopack root to prevent lockfile detection issues
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
