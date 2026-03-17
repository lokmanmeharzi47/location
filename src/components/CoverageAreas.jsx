"use client";

export default function CoverageAreas({ dict }) {
    const areas = dict?.coverage_areas?.areas || [];

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white" id="coverage-areas">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                        {dict?.coverage_areas?.title}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
                        {dict?.coverage_areas?.subtitle}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-slate-400 via-gold-400 to-slate-400 mx-auto rounded-full"></div>
                </div>

                {/* Airport Highlight */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-9 h-9 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gold-400 mb-2">
                                ✈️ {dict?.coverage_areas?.airport_title}
                            </h3>
                            <p className="text-white/80 leading-relaxed text-sm md:text-base">
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
                            className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-xl hover:border-gold-300 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-gold-500 group-hover:text-white transition-all duration-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {area.name}
                                </h3>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {area.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
