"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection({ dict, lang }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* Background Cinematic Luxury Car Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-luxury.jpg"
          alt="Luxury car rental"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center scale-105 transform-gpu transition-transform duration-1000 ease-out"
        />

        {/* Multi-layer Dark Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80"></div>
      </div>

      {/* Ambient Warm Golden Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gold-500/15 rounded-full blur-[140px] pointer-events-none z-[1]"></div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24 pb-16 transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {[dict?.hero?.badge_clean, dict?.hero?.badge_price, dict?.hero?.badge_delivery].filter(Boolean).map(
            (badge, i) => (
              <span
                key={i}
                className="px-4 py-1.5 bg-slate-900/70 backdrop-blur-md text-gold-300 text-xs sm:text-sm font-medium rounded-full border border-gold-500/30 shadow-lg shadow-black/30"
              >
                {badge}
              </span>
            )
          )}
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.15] mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent drop-shadow-sm">
            {dict?.hero?.main_title_1 || "Luxury location"}
          </span>
          <br />
          <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white/95 mt-2 block">
            {dict?.hero?.main_title_2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
          {dict?.hero?.main_subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <Link
            href={`/${lang}/cars`}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-slate-950 font-bold text-base sm:text-lg rounded-full shadow-xl shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
          >
            {dict?.hero?.cta_browse || "Voir les voitures"}
          </Link>

          <a
            href="#car-categories"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/60 backdrop-blur-md text-white font-semibold text-base sm:text-lg rounded-full border border-white/20 hover:border-gold-400/60 hover:bg-slate-900/80 hover:-translate-y-0.5 transition-all duration-300"
          >
            {dict?.hero?.cta_types || "Catégories"}
          </a>
        </div>

        {/* Trust Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 text-xs sm:text-sm shadow-xl shadow-black/40">
          <span className="text-slate-200 font-medium">{dict?.hero?.trust_customers}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span className="text-gold-400 text-base leading-none">★★★★★</span>
          <span className="text-gold-300 font-semibold">{dict?.hero?.trust_rating}</span>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <a href="#car-categories" aria-label="Défiler vers les catégories" className="animate-bounce p-2 text-gold-400 hover:text-gold-300">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
