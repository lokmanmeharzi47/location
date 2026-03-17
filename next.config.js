/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: Use remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
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
