const ComingSoon = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: "url('/images/costumise.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "450px",
          }}
        >
          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blush-800/80 via-blush-700/70 to-rose-gold/60"></div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-32 h-32 bg-gold-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-blush-300/20 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
            {/* Gold Accent */}
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mb-6"></div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              لمسة خاصة لكِ
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              اختاري الألوان، النقوش، والتطريز الذي يعكس أنوثتك وتميّزك
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["ألوان متنوعة", "نقوش حصرية", "تطريز مخصص"].map((feature, index) => (
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
              className="px-8 py-4 bg-gold-500/80 text-white font-semibold rounded-full cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity duration-300 shadow-lg"
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
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mt-8"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
