"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCheckCircle, FiShield, FiStar, FiTruck, FiChevronDown, FiAward } from "react-icons/fi";

const HERO_BG_URL = "https://legnjqukzdwrpoaiyeiz.supabase.co/storage/v1/object/public/images/hero/hero-bg.avif";

export default function HeroSection({ dict, lang }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isRtl = lang === "ar";

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* Background Cinematic Luxury Image from Supabase Storage */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={HERO_BG_URL}
          alt="Luxury car rental fleet and cortège Algeria"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center scale-100 lg:scale-105 transform-gpu transition-transform duration-1000 ease-out"
        />

        {/* Multi-layer Cinematic Overlays for Perfect Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/90"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/90"></div>
      </div>

      {/* Ambient Warm Golden & Blue Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-b from-gold-500/15 via-gold-500/5 to-transparent rounded-full blur-[140px] pointer-events-none z-[1]"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-[1]"></div>

      {/* Hero Content */}
      <div
        className={`relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-28 pb-20 transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Top Floating VIP Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-semibold mb-6 shadow-xl shadow-black/40 hover:border-gold-400/60 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
          <FiAward size={15} className="text-gold-400 shrink-0" />
          <span>{dict?.custom_pack?.badge || "Service VIP & Événements"}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{dict?.hero?.stat_wilayas || "58 Wilayas"}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.12] mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            {dict?.hero?.main_title_1 || "Luxury Location"}
          </span>
          <br />
          <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white/95 mt-2 block tracking-tight">
            {dict?.hero?.main_title_2 || "Le choix intelligent pour vos déplacements à travers l'Algérie"}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal drop-shadow-sm">
          {dict?.hero?.main_subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center mb-12">
          {/* Primary: Browse Cars */}
          <Link
            href={`/${lang}/cars`}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-slate-950 font-extrabold text-base rounded-full shadow-xl shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>{dict?.hero?.cta_browse || "Voir les voitures"}</span>
          </Link>

          {/* Categories Quick Link */}
          <a
            href="#car-categories"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-950/60 backdrop-blur-md text-slate-300 hover:text-white font-medium text-sm rounded-full border border-slate-800 hover:border-slate-700 transition-all duration-300"
          >
            {dict?.hero?.cta_types || "Catégories"}
          </a>
        </div>

        {/* Live Social Proof & Glassmorphism Trust Bar */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 pt-6 border-t border-slate-800/80 max-w-3xl mx-auto">
          {/* Wilayas */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-xs sm:text-sm text-slate-300">
            <FiTruck className="text-gold-400 shrink-0" size={16} />
            <span>{dict?.hero?.stat_wilayas || "58 Wilayas couvertes"}</span>
          </div>

          {/* Satisfied Clients */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-xs sm:text-sm text-slate-300">
            <FiCheckCircle className="text-emerald-400 shrink-0" size={16} />
            <span>{dict?.hero?.trust_customers || "+500 Clients satisfaits"}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-xs sm:text-sm text-slate-300">
            <div className="flex gap-0.5 text-gold-400">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={13} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <span className="font-bold text-white ms-1">{dict?.hero?.trust_rating || "4.9/5"}</span>
          </div>

          {/* VIP Convoys */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-xs sm:text-sm text-gold-300">
            <FiShield className="text-gold-400 shrink-0" size={16} />
            <span>{dict?.hero?.stat_vip || "Cortèges & Packs VIP"}</span>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Down Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
        <a href="#car-categories" aria-label="Défiler vers les catégories" className="animate-bounce p-2 text-gold-400 hover:text-gold-300">
          <FiChevronDown size={22} />
        </a>
      </div>
    </section>
  );
}
