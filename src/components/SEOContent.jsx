"use client";
import Link from "next/link";

export default function SEOContent({ dict, lang }) {
    const seo = dict?.seo_content;
    if (!seo) return null;

    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden" id="seo-content">
            {/* Ambient Background Accents */}
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Main Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                        {seo.title}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full"></div>
                </div>

                {/* Content Blocks */}
                <div className="space-y-8">
                    {/* Intro Card */}
                    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl shadow-black/30 border border-slate-800/80">
                        <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                            {seo.intro}
                        </p>
                    </div>

                    {/* Features in Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fleet */}
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60">
                            <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                                {seo.fleet_title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {seo.fleet_text}
                            </p>
                        </div>

                        {/* Airport */}
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60">
                            <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                                {seo.airport_title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {seo.airport_text}
                            </p>
                        </div>

                        {/* Self-Drive */}
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60">
                            <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                                {seo.selfDrive_title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {seo.selfDrive_text}
                            </p>
                        </div>

                        {/* Long-Term */}
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60">
                            <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                                {seo.longTerm_title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {seo.longTerm_text}
                            </p>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/60">
                        <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                            {seo.pricing_title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {seo.pricing_text}
                        </p>
                    </div>

                    {/* Bilingual Note */}
                    <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800/50">
                        <p className="text-slate-400 leading-relaxed text-sm text-center" dir="auto">
                            {seo.bilingual_note}
                        </p>
                    </div>

                    {/* CTA Block */}
                    <div className="bg-gradient-to-br from-slate-900 via-[#0B1220] to-slate-950 rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-gold-500/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                                {seo.cta_text}
                            </h3>
                            <p className="text-slate-300 mb-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                                {seo.cta_subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link
                                    href={`/${lang}/cars`}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold text-base md:text-lg rounded-full shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
                                >
                                    {dict?.internal_links?.cars_page || seo.cta_text}
                                </Link>
                                <a
                                    href="https://wa.me/213778612190"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/80 backdrop-blur-sm text-white font-semibold text-base md:text-lg rounded-full border border-white/20 hover:border-gold-400/50 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <span>WhatsApp Concierge</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Internal Links Section */}
                    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4" aria-label="Internal links">
                        <Link
                            href={`/${lang}/cars`}
                            className="flex items-center gap-3.5 p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/80 hover:border-gold-500/40 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 group-hover:bg-gold-500 group-hover:border-gold-500 flex items-center justify-center transition-all duration-300">
                                <svg className="w-4 h-4 text-gold-400 group-hover:text-slate-950 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                                {dict?.internal_links?.cars_page}
                            </span>
                        </Link>
                        <Link
                            href={`/${lang}/cars`}
                            className="flex items-center gap-3.5 p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800/80 hover:border-gold-500/40 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 group-hover:bg-gold-500 group-hover:border-gold-500 flex items-center justify-center transition-all duration-300">
                                <svg className="w-4 h-4 text-gold-400 group-hover:text-slate-950 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                                {dict?.internal_links?.categories}
                            </span>
                        </Link>
                    </nav>
                </div>
            </div>
        </section>
    );
}
