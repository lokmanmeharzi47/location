"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiMenu, FiX, FiAward } from "react-icons/fi";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ lang, dict }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleNavigateAndScroll = (sectionId) => {
    if (pathname === `/${lang}` || pathname === "/") {
      scrollToSection(sectionId);
    } else {
      router.push(`/${lang}`);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 800);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 flex justify-between items-center px-4 lg:px-8 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-slate-950/90 backdrop-blur-md shadow-2xl border-b border-gold-500/20 py-2.5"
          : "bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent py-4"
      }`}
    >
      {/* Logo */}
      <Link href={`/${lang}`} className="flex items-center gap-3 group">
        <Image
          src="/images/logo.jpg"
          alt="Luxury location"
          width={80}
          height={80}
          className="rounded-full w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-2 border-gold-400 shadow-md group-hover:border-gold-300 transition-colors"
          priority
        />
        <div className="flex flex-col">
          <span className="text-lg lg:text-xl font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors">
            {dict?.header?.rights || "Luxury location"}
          </span>
          <span className="text-xs text-gold-400 font-medium tracking-wider hidden sm:block">
            VIP AUTOMOTIVE
          </span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      {!isSmallScreen && (
        <nav className="flex items-center gap-2">
          <Link
            href={`/${lang}`}
            className="px-4 py-2 rounded-full font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
          >
            {dict?.header?.home}
          </Link>
          <Link
            href={`/${lang}/cars`}
            className="px-4 py-2 rounded-full font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
          >
            {dict?.header?.cars}
          </Link>
          <Link
            href={`/${lang}/pack-personnalise`}
            className="relative px-3.5 py-2 rounded-full font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm flex items-center gap-1.5"
          >
            <span>{dict?.header?.custom_pack || "Pack Personnalisé"}</span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center gap-1">
              <FiAward size={11} className="text-gold-400" />
              VIP
            </span>
          </Link>
          <button
            onClick={() => handleNavigateAndScroll("#car-categories")}
            className="px-4 py-2 rounded-full font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm cursor-pointer"
          >
            {dict?.header?.categories}
          </button>
          <button
            onClick={() => scrollToSection("#footer")}
            className="px-4 py-2 rounded-full font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm cursor-pointer"
          >
            {dict?.header?.contact}
          </button>

          {/* Language Switcher */}
          <div className="mx-2">
            <LanguageSwitcher lang={lang} />
          </div>

          <Link
            href={`/${lang}/cars`}
            className="ms-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 rounded-full font-bold text-sm hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105"
          >
            {dict?.header?.book}
          </Link>
        </nav>
      )}

      {/* Mobile Menu Button */}
      {isSmallScreen && (
        <div className="flex items-center gap-3">
          <LanguageSwitcher lang={lang} />
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="p-2.5 rounded-full transition-all duration-300 bg-slate-900/80 border border-slate-800 text-gold-400 hover:bg-slate-800"
          >
            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isSmallScreen && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Mobile Menu Drawer */}
      {isSmallScreen && isMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-slate-950 via-[#0B101E] to-slate-950 border-l border-gold-500/20 z-50 p-6 flex flex-col shadow-2xl animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={toggleMenu}
            aria-label="Close menu"
            className="self-start p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 mb-6 hover:text-white hover:border-gold-500/40 transition-colors"
          >
            <FiX size={22} />
          </button>

          {/* Logo in Mobile Menu */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/logo.jpg"
              alt="Luxury location"
              width={100}
              height={100}
              className="rounded-full w-20 h-20 border-2 border-gold-400 shadow-lg mb-3"
              priority
            />
            <span className="text-xl font-bold text-white">Luxury location</span>
            <span className="text-xs text-gold-400 text-center mt-1">
              {dict?.header?.mobile_subtitle}
            </span>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-2.5 flex-1">
            <Link
              href={`/${lang}`}
              onClick={toggleMenu}
              className="px-5 py-3 rounded-xl text-center font-medium text-slate-200 bg-slate-900/80 border border-slate-800/80 hover:border-gold-500/40 hover:text-white transition-all duration-300"
            >
              {dict?.header?.home}
            </Link>
            <Link
              href={`/${lang}/cars`}
              onClick={toggleMenu}
              className="px-5 py-3 rounded-xl text-center font-medium text-slate-200 bg-slate-900/80 border border-slate-800/80 hover:border-gold-500/40 hover:text-white transition-all duration-300"
            >
              {dict?.header?.cars}
            </Link>
            <Link
              href={`/${lang}/pack-personnalise`}
              onClick={toggleMenu}
              className="px-5 py-3 rounded-xl text-center font-semibold text-gold-400 bg-gradient-to-r from-gold-500/15 via-gold-500/5 to-transparent border border-gold-500/40 hover:border-gold-400 hover:text-gold-300 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{dict?.header?.custom_pack || "Pack Personnalisé"}</span>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center gap-1">
                <FiAward size={10} className="text-gold-400" />
                VIP
              </span>
            </Link>
            <button
              onClick={() => handleNavigateAndScroll("#car-categories")}
              className="px-5 py-3 rounded-xl text-center font-medium text-slate-200 bg-slate-900/80 border border-slate-800/80 hover:border-gold-500/40 hover:text-white transition-all duration-300 cursor-pointer"
            >
              {dict?.header?.categories}
            </button>
            <button
              onClick={() => scrollToSection("#footer")}
              className="px-5 py-3 rounded-xl text-center font-medium text-slate-200 bg-slate-900/80 border border-slate-800/80 hover:border-gold-500/40 hover:text-white transition-all duration-300 cursor-pointer"
            >
              {dict?.header?.contact}
            </button>
            <Link
              href={`/${lang}/cars`}
              onClick={toggleMenu}
              className="mt-4 px-6 py-3.5 rounded-full text-center font-bold bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-all duration-300"
            >
              {dict?.header?.book}
            </Link>
          </nav>

          {/* Footer in Mobile Menu */}
          <div className="mt-auto pt-6 border-t border-slate-800">
            <p className="text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Luxury location. All rights reserved.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}