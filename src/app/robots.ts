import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxurylocationdz.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*/admin/',
        '/*/admin',
        '/admin/',
        '/admin',
        '/api/',
        '/_next/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
