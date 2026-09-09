"use client";

const ComingSoon = ({ dict }) => {
  return (
    <section className="py-20 px-4 bg-slate-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 bg-gradient-to-br from-slate-900 via-[#0C1222] to-slate-950 p-8 md:p-14 text-center">
          
          {/* Subtle Golden Radial Light inside card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* VIP Teaser Tag */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-400 font-semibold text-xs tracking-wider uppercase mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
              VIP Experience
            </span>

            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              {dict?.coming_soon?.title}
            </h2>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {dict?.coming_soon?.subtitle}
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {(dict?.coming_soon?.features || []).map((feature, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-full text-slate-200 text-sm border border-slate-700/60 shadow-sm"
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              className="px-8 py-3.5 bg-gradient-to-r from-gold-500/80 to-gold-600/80 text-slate-950 font-bold rounded-full cursor-not-allowed opacity-90 shadow-lg border border-gold-400/40"
              disabled
              aria-disabled="true"
            >
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <svg className="w-5 h-5 animate-pulse text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {dict?.coming_soon?.button}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
