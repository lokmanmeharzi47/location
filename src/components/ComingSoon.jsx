const ComingSoon = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            minHeight: "450px",
            backgroundImage: "url('/images/hero.png')",
            backgroundSize: "100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dark Navy Gradient Overlay for text readability */}
          <div
  className="absolute inset-0"
  style={{
    background:
      "linear-gradient(135deg, rgba(5, 10, 20, 0.92) 0%, rgba(10, 15, 30, 0.88) 50%, rgba(5, 10, 20, 0.92) 100%)",
  }}
></div>


          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
            {/* Gold Accent */}

            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              خدمات قريباً
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              نعمل على إضافة خدمات جديدة لتجربة تأجير أفضل وأسهل
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["تأمين شامل", "سائق خاص", "توصيل للمطار"].map((feature, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm border border-white/30"
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              className="px-8 py-4 bg-gold-500/80 text-slate-900 font-semibold rounded-full cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity duration-300 shadow-lg"
              disabled
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                قريبًا
              </span>
            </button>

            {/* Gold Accent Bottom */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
