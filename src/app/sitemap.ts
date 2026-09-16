import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { i18n } from '@/i18n-config';

export const revalidate = 86400; // Revalidate daily (in seconds)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxurylocationdz.com';
  const locales = i18n.locales as ('ar' | 'fr' | 'en')[];
  const now = new Date();

  // Static routes to index
  const staticPaths = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/cars', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/pack-personnalise', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/design', priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // 1. Generate entries for static routes with multilingual alternates
  for (const item of staticPaths) {
    for (const lang of locales) {
      const url = `${baseUrl}/${lang}${item.path}`;
      const languages: Record<string, string> = {};

      for (const altLang of locales) {
        languages[altLang] = `${baseUrl}/${altLang}${item.path}`;
      }

      entries.push({
        url,
        lastModified: now,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  // 2. Dynamically fetch active categories from database
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const category of categories) {
      if (!category.slug) continue;

      for (const lang of locales) {
        const url = `${baseUrl}/${lang}/design/${encodeURIComponent(category.slug)}`;
        const languages: Record<string, string> = {};

        for (const altLang of locales) {
          languages[altLang] = `${baseUrl}/${altLang}/design/${encodeURIComponent(category.slug)}`;
        }

        entries.push({
          url,
          lastModified: category.updatedAt || now,
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages,
          },
        });
      }
    }
  } catch (error) {
    console.error('[Sitemap] Failed to query dynamic categories, using static routes only:', error);
  }

  return entries;
}
