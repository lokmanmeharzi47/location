"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection({ dict, lang }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
       <video
  autoPlay
  muted
  playsInline
  preload="metadata"
  className="w-full h-full object-cover"
>

          <source src="/videos/lambo.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gold-600 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[dict?.hero?.badge_clean, dict?.hero?.badge_price, dict?.hero?.badge_delivery].map((badge, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-full border border-white/20"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          <span className="text-gold-400">{dict?.hero?.main_title_1 || 'Luxury location'}</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium">
            {dict?.hero?.main_title_2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
          {dict?.hero?.main_subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={`/${lang}/cars`}
            className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold text-lg rounded-full shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            {dict?.hero?.cta_browse}
          </Link>
          <a
            href="#car-categories"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-full border border-white/30 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
          >
            {dict?.hero?.cta_types}
          </a>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 flex items-center justify-center gap-6 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{dict?.hero?.trust_customers}</span>
          </div>
          <div className="w-1 h-4 bg-white/20 rounded-full"></div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{dict?.hero?.trust_rating}</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
