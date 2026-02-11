import { query } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';

// Cache categories for 60 seconds to improve loading speed
const getCachedCategories = unstable_cache(
    async () => {
        try {
            const sql = 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC';
            const categories = await query(sql, []);

            return categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                image: c.image_path || '/images/placeholder.svg',
                href: c.href || `/design/${c.slug}`,
            }));
        } catch {
            return [];
        }
    },
    ['car-categories'],
    { revalidate: 60 } // Cache for 60 seconds
);

export default async function CarCategories({ dict }) {
    const categories = await getCachedCategories();

    // Don't render if no categories
    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="py-20 px-4" id="car-categories">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="text-gold-500 font-medium text-sm tracking-wider mb-2 block">
                        {dict?.categories?.fleet}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                        {dict?.categories?.title}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-slate-400 via-gold-400 to-slate-400 mx-auto rounded-full"></div>
                    <p className="text-slate-600 mt-6 max-w-2xl mx-auto text-lg">
                        {dict?.categories?.subtitle}
                    </p>
                </div>

                {/* Categories Grid - Centered */}
                <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id || index}
                            href={category.href || `/design/${category.slug}`}
                            className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200 hover:border-gold-300 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-sm"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                <Image
                                    src={category.image || "/images/placeholder.svg"}
                                    alt={category.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="transition-transform duration-500 ease-out group-hover:scale-110"
                                    priority={index < 2}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Title with gold accent */}
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-gold-600 transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                    <div className="w-8 h-0.5 bg-gold-400 rounded-full"></div>
                                </div>

                                {/* Description */}
                                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                    {category.description}
                                </p>

                                {/* CTA */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gold-600 font-medium text-sm group-hover:text-gold-700 transition-colors">
                                        {dict?.categories?.view_cars}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-gold-500 transition-all duration-300">
                                        <svg
                                            className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors duration-300 rotate-180 rtl:rotate-0"
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
