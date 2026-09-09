"use client";

export default function CoverageAreas({ dict }) {
    const areas = dict?.coverage_areas?.areas || [];

    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden" id="coverage-areas">
            {/* Ambient Background Accents */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                        {dict?.coverage_areas?.title}
                    </h2>
                    <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-5 leading-relaxed">
                        {dict?.coverage_areas?.subtitle}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full"></div>
                </div>

                {/* Airport Highlight VIP Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-10 mb-12 text-white shadow-2xl border border-gold-500/30 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center flex-shrink-0 text-gold-400 shadow-lg shadow-gold-500/10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                    VIP Service
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-gold-400">
                                    {dict?.coverage_areas?.airport_title}
                                </h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                {dict?.coverage_areas?.airport_desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Districts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map((area, index) => (
                        <div
                            key={index}
                            className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-black/40 border border-slate-800/80 hover:shadow-2xl hover:border-gold-500/40 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3.5 mb-3.5">
                                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:border-gold-500 group-hover:text-slate-950 transition-all duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors">
                                    {area.name}
                                </h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {area.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
