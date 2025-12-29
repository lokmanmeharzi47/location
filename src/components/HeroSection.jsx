"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function HeroSection() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
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

  return (
    <div className="relative h-[85vh] lg:h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero.mov"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Elegant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-blush-900/30"></div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gold-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-blush-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-white/20 shadow-2xl">
          {/* Gold Accent Line */}
          <div className="w-24 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 mx-auto mb-6 rounded-full"></div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            <span className="text-gold-400">Boutique RITAL</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium">
              أناقتك تبدأ من هنا
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
            ملابس نسائية مصممة بذوق راقٍ، تطريز أنيق وجودة عالية تناسب كل المناسبات
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/design"
              className="w-full sm:w-auto bg-blush-500 text-white font-semibold py-4 px-10 text-lg rounded-full transition-all duration-300 ease-in-out transform hover:bg-blush-600 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blush-400"
            >
              تسوقي الآن
            </Link>
            <button
              onClick={() => handleNavigateAndScroll("#clothing-categories")}
              className="w-full sm:w-auto bg-transparent border-2 border-gold-400 text-gold-400 font-semibold py-4 px-10 text-lg rounded-full transition-all duration-300 ease-in-out transform hover:bg-gold-400 hover:text-white hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400"
            >
              اكتشفي التشكيلة
            </button>
          </div>

          {/* Gold Accent Line Bottom */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto mt-8 rounded-full"></div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 w-full flex justify-center">
        <div className="flex flex-col items-center gap-2 animate-float">
          <span className="text-white/80 text-sm">اكتشفي المزيد</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-gold-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
