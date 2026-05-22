"use client";
import Link from "next/link";

export default function SEOContent({ dict, lang }) {
    const seo = dict?.seo_content;
    if (!seo) return null;

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white" id="seo-content">
            <div className="max-w-4xl mx-auto">
                {/* Main Title */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                        {seo.title}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-slate-400 via-gold-400 to-slate-400 mx-auto rounded-full"></div>
                </div>

                {/* Content Blocks */}
                <div className="space-y-10">
                    {/* Intro */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                            {seo.intro}
                        </p>
                    </div>

                    {/* Fleet */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                            {seo.fleet_title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {seo.fleet_text}
                        </p>
                    </div>

                    {/* Airport */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                            {seo.airport_title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {seo.airport_text}
                        </p>
                    </div>

                    {/* Self-Drive */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                            {seo.selfDrive_title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {seo.selfDrive_text}
                        </p>
                    </div>

                    {/* Long-Term */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                            {seo.longTerm_title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {seo.longTerm_text}
                        </p>
                    </div>

                    {/* Pricing */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                            {seo.pricing_title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {seo.pricing_text}
                        </p>
                    </div>

                    {/* Bilingual Note (Arabic/French mix for SEO) */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <p className="text-slate-500 leading-relaxed text-sm text-center" dir="auto">
                            {seo.bilingual_note}
                        </p>
                    </div>

                    {/* CTA Block */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                {seo.cta_text}
                            </h3>
                            <p className="text-white/80 mb-6 max-w-xl mx-auto">
                                {seo.cta_subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={`/${lang}/cars`}
                                    className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold text-lg rounded-full shadow-lg shadow-gold-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {dict?.internal_links?.cars_page || seo.cta_text}
                                </Link>
                                <a
                                    href="https://wa.me/213559309680"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-full border border-white/30 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
                                >
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Internal Links Section */}
                    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Internal links">
                        <Link
                            href={`/${lang}/cars`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-gold-400 hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-gold-500 flex items-center justify-center transition-all duration-300">
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <span className="text-slate-700 text-sm font-medium">
                                {dict?.internal_links?.cars_page}
                            </span>
                        </Link>
                        <Link
                            href={`/${lang}/cars`}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-gold-400 hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-gold-500 flex items-center justify-center transition-all duration-300">
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <span className="text-slate-700 text-sm font-medium">
                                {dict?.internal_links?.categories}
                            </span>
                        </Link>
                    </nav>
                </div>
            </div>
        </section>
    );
}
