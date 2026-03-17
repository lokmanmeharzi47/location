"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection({ dict, lang }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative h-[75vh] md:h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover md:scale-100 scale-110"
        >
          <source src="/videos/lambo.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65"></div>
      </div>

      {/* Decorative blur lights (reduced on mobile) */}
      <div className="absolute inset-0 opacity-20 hidden md:block">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gold-600 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[dict?.hero?.badge_clean, dict?.hero?.badge_price, dict?.hero?.badge_delivery].map(
            (badge, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs sm:text-sm rounded-full border border-white/20"
              >
                {badge}
              </span>
            )
          )}
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          <span className="text-gold-400">
            {dict?.hero?.main_title_1 || "Luxury location"}
          </span>
          <br />
          <span className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-medium">
            {dict?.hero?.main_title_2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed mb-6 max-w-xl mx-auto">
          {dict?.hero?.main_subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={`/${lang}/cars`}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold text-base sm:text-lg rounded-full shadow-lg shadow-gold-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {dict?.hero?.cta_browse}
          </Link>

          <a
            href="#car-categories"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold text-base sm:text-lg rounded-full border border-white/30 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
          >
            {dict?.hero?.cta_types}
          </a>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-4 text-white/60 text-xs sm:text-sm">
          <span>{dict?.hero?.trust_customers}</span>
          <span className="text-gold-400">★</span>
          <span>{dict?.hero?.trust_rating}</span>
        </div>
      </div>

      {/* Scroll indicator (hide on small screens) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <svg
          className="w-6 h-6 text-white/50"
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
      </div>
    </section>
  );
}
