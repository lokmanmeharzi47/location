import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
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
    if (pathname === "/") {
      scrollToSection(sectionId);
    } else {
      router.push("/");
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
      className={`fixed inset-x-0 flex justify-between items-center px-4 lg:px-8 py-2 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200'
        : 'bg-gradient-to-b from-black/40 to-transparent'
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo.jpg"
          alt="Luxury location"
          width={80}
          height={80}
          className="rounded-full w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 border-gold-400 shadow-md"
          priority
        />
        <span className={`text-lg font-bold transition-colors duration-300 ${isScrolled ? 'text-slate-800' : 'text-white'
          }`}>
          {dict?.header?.rights || 'Luxury location'}
        </span>
      </div>


      {/* Desktop Navigation */}
      {
        !isSmallScreen && (
          <nav className="flex items-center gap-2">
            <Link
              href={`/${lang}`}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-white hover:bg-white/20'
                }`}
            >
              {dict?.header?.home}
            </Link>
            <Link
              href={`/${lang}/design`}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-white hover:bg-white/20'
                }`}
            >
              {dict?.header?.cars}
            </Link>
            <button
              onClick={() => handleNavigateAndScroll("#car-categories")}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-white hover:bg-white/20'
                }`}
            >
              {dict?.header?.categories}
            </button>
            <button
              onClick={() => scrollToSection("#footer")}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-white hover:bg-white/20'
                }`}
            >
              {dict?.header?.contact}
            </button>
            {/* Language Switcher */}
            <div className="mx-2">
              <LanguageSwitcher lang={lang} />
            </div>
            <Link
              href={`/${lang}/design`}
              className="mr-4 px-6 py-2 bg-gold-500 text-slate-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {dict?.header?.book}
            </Link>
          </nav>
        )
      }

      {/* Mobile Menu Button */}
      {
        isSmallScreen && (
          <button
            onClick={toggleMenu}
            className={`p-3 rounded-full transition-all duration-300 ${isScrolled
              ? 'bg-slate-100 text-slate-800'
              : 'bg-white/20 text-white'
              }`}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        )
      }

      {/* Mobile Menu Overlay */}
      {
        isSmallScreen && isMenuOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={toggleMenu}></div>
        )
      }

      {/* Mobile Menu */}
      {
        isSmallScreen && isMenuOpen && (
          <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-slate-50 to-slate-100 z-50 p-6 flex flex-col shadow-2xl animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={toggleMenu}
              className="self-start p-2 rounded-full bg-slate-200 text-slate-800 mb-6 hover:bg-slate-300 transition-colors"
            >
              <FiX size={24} />
            </button>

            {/* Logo in Mobile Menu */}
            <div className="flex flex-col items-center mb-8">
              <Image
                src="/images/logo.jpg"
                alt="Luxury location"
                width={100}
                height={100}
                className="rounded-full w-20 h-20 border-3 border-gold-400 shadow-lg mb-3"
                priority
              />
              <span className="text-xl font-bold text-slate-800">Luxury location</span>
              <span className="text-sm text-gold-600">{dict?.header?.mobile_subtitle}</span>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col gap-3 flex-1">
              <Link
                href={`/${lang}`}
                onClick={toggleMenu}
                className="px-6 py-3 rounded-xl text-center font-medium text-slate-700 bg-white/60 hover:bg-slate-200 transition-all duration-300"
              >
                {dict?.header?.home}
              </Link>
              <Link
                href={`/${lang}/design`}
                onClick={toggleMenu}
                className="px-6 py-3 rounded-xl text-center font-medium text-slate-700 bg-white/60 hover:bg-slate-200 transition-all duration-300"
              >
                {dict?.header?.cars}
              </Link>
              <button
                onClick={() => handleNavigateAndScroll("#car-categories")}
                className="px-6 py-3 rounded-xl text-center font-medium text-slate-700 bg-white/60 hover:bg-slate-200 transition-all duration-300"
              >
                {dict?.header?.categories}
              </button>
              <button
                onClick={() => scrollToSection("#footer")}
                className="px-6 py-3 rounded-xl text-center font-medium text-slate-700 bg-white/60 hover:bg-slate-200 transition-all duration-300"
              >
                {dict?.header?.contact}
              </button>
              <div className="flex justify-center my-2">
                <LanguageSwitcher lang={lang} />
              </div>
              <Link
                href={`/${lang}/design`}
                onClick={toggleMenu}
                className="mt-4 px-6 py-4 rounded-full text-center font-semibold bg-gold-500 text-slate-900 hover:bg-gold-400 transition-all duration-300 shadow-lg"
              >
                {dict?.header?.book}
              </Link>
            </nav>

            {/* Footer in Mobile Menu */}
            <div className="mt-auto pt-6 border-t border-slate-300">
              <p className="text-center text-sm text-slate-600">
                © {new Date().getFullYear()} Luxury location
              </p>
            </div>
          </div>
        )
      }
    </header >
  );
}