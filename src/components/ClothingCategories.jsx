import { query } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

// Server Component - Data fetched at build/request time
async function getCategories() {
  try {
    const sql = 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC';
    const categories = await query(sql, []);

    return categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image_path || '/images/placeholder.jpg',
      href: c.href || `/design/${c.slug}`,
    }));
  } catch {
    return [];
  }
}

export default async function ClothingCategories() {
  const categories = await getCategories();

  // Don't render if no categories
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4" id="clothing-categories">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium text-sm tracking-wider mb-2 block">تشكيلتنا المميزة</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brown-dark mb-4">
            تصفحي الفئات
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blush-400 via-gold-400 to-blush-400 mx-auto rounded-full"></div>
          <p className="text-brown-light mt-6 max-w-2xl mx-auto text-lg">
            اكتشفي مجموعتنا الحصرية من الملابس النسائية المصممة بعناية وذوق راقٍ
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id || index}
              href={category.href || `/design/${category.slug}`}
              className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-cream-200 hover:border-blush-200"
            >
              {/* Image Container */}
              <div className="relative h-64 bg-gradient-to-br from-blush-100 to-cream-100 overflow-hidden">
                <Image
                  src={category.image || "/images/placeholder.jpg"}
                  alt={category.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 ease-out group-hover:scale-110"
                  priority={index < 2}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-blush-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title with gold accent */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-brown-dark group-hover:text-blush-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <div className="w-8 h-0.5 bg-gold-400 rounded-full"></div>
                </div>

                {/* Description */}
                <p className="text-brown-light text-sm leading-relaxed mb-4 line-clamp-2">
                  {category.description}
                </p>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-blush-500 font-medium text-sm group-hover:text-blush-600 transition-colors">
                    اكتشفي المزيد
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center group-hover:bg-blush-500 transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-blush-500 group-hover:text-white transition-colors duration-300 rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
