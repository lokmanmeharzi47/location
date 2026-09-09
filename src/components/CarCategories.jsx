import { query } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { FiAward, FiStar } from 'react-icons/fi';

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

export default async function CarCategories({ dict, lang }) {
    const categories = await getCachedCategories();

    // Don't render if no categories
    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden" id="car-categories">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-medium text-xs tracking-wider uppercase mb-3">
                        {dict?.categories?.fleet}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                        {dict?.categories?.title}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full"></div>
                    <p className="text-slate-400 mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        {dict?.categories?.subtitle}
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                    {categories.map((category, index) => {
                        const isPack = category.href === '/pack-personnalise' || 
                                       category.slug === 'pack-personnalise' || 
                                       category.name?.toLowerCase().includes('pack');

                        if (isPack) {
                            return (
                                <Link
                                    key={category.id || 'pack'}
                                    href={`/${lang}/pack-personnalise`}
                                    className="group block relative bg-gradient-to-b from-gold-950/40 via-slate-900/90 to-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-gold-500/10 hover:shadow-2xl hover:shadow-gold-500/25 transition-all duration-500 hover:-translate-y-2 border-2 border-gold-500/60 hover:border-gold-400 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-sm flex flex-col"
                                >
                                    {/* Top Exclusive Badge */}
                                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-20">
                                        <span className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full bg-gold-500 text-slate-950 shadow-lg shadow-gold-500/30 flex items-center gap-1.5">
                                            <FiAward size={13} className="text-slate-950 shrink-0" />
                                            <span>{dict?.custom_pack?.category_card_badge || "VIP & Cortège"}</span>
                                        </span>
                                    </div>

                                    {/* Image Container */}
                                    <div className="relative h-64 bg-slate-800/50 overflow-hidden">
                                        <Image
                                            src={category.image || "/images/custom-pack-fleet.jpg"}
                                            alt={category.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            className="transition-transform duration-700 ease-out group-hover:scale-110"
                                            priority
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                        {/* Ambient gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-300"></div>
                                        <div className="absolute inset-0 bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors duration-300"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xl font-bold text-gold-300 group-hover:text-gold-200 transition-colors duration-300 flex items-center gap-1.5">
                                                    <FiStar size={16} className="text-gold-400 fill-gold-400/30 shrink-0" />
                                                    <span>{lang === 'ar' ? (dict?.custom_pack?.category_card_title || category.name) : category.name}</span>
                                                </h3>
                                                <div className="w-8 h-0.5 bg-gold-400 group-hover:w-12 transition-all duration-300 rounded-full"></div>
                                            </div>

                                            <p className="text-slate-300 text-sm leading-relaxed mb-5 line-clamp-2">
                                                {category.description || dict?.custom_pack?.category_card_desc}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gold-500/30">
                                            <span className="text-gold-400 font-bold text-sm group-hover:text-gold-300 transition-colors">
                                                {dict?.custom_pack?.category_card_cta || "Créer mon Pack"}
                                            </span>
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 flex items-center justify-center font-bold transition-all duration-300 shadow-md group-hover:scale-110 group-hover:shadow-gold-500/50">
                                                <svg
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={category.id || index}
                                href={category.href ? `/${lang}${category.href}` : `/${lang}/design/${category.slug}`}
                                className="group block bg-slate-900/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-gold-500/10 transition-all duration-500 hover:-translate-y-2 border border-slate-800/80 hover:border-gold-500/40 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-sm"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 bg-slate-800/50 overflow-hidden">
                                    <Image
                                        src={category.image || "/images/placeholder.svg"}
                                        alt={category.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className="transition-transform duration-700 ease-out group-hover:scale-110"
                                        priority={index < 2}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                    {/* Bottom gradient vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-50 transition-opacity duration-300"></div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Title with gold accent indicator */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors duration-300">
                                            {category.name}
                                        </h3>
                                        <div className="w-8 h-0.5 bg-gold-400/70 group-hover:w-12 transition-all duration-300 rounded-full"></div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2">
                                        {category.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                        <span className="text-gold-400 font-semibold text-sm group-hover:text-gold-300 transition-colors">
                                            {dict?.categories?.view_cars}
                                        </span>
                                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:bg-gold-500 group-hover:border-gold-500 group-hover:text-slate-950 transition-all duration-300 shadow-md">
                                            <svg
                                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
