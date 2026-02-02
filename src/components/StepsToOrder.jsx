"use client";
import { useState, useEffect } from "react";

export default function StepsToOrder() {
  const [activeStep, setActiveStep] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const steps = [
    {
      number: "١",
      title: "اختاري القطعة",
      description: "تصفحي مجموعتنا واختاري القطعة التي تعجبك من الفساتين والبلايز والأطقم.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      number: "٢",
      title: "حددي المقاس واللون",
      description: "اختاري المقاس المناسب واللون الذي يناسب ذوقك وإطلالتك.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      number: "٣",
      title: "نطرّزها بعناية",
      description: "حرفيونا المهرة يضيفون لمسات التطريز الأنيقة على قطعتك بكل دقة.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      number: "٤",
      title: "تصلك إلى باب منزلك",
      description: "نوصل طلبك بعناية إلى عنوانك في جميع أنحاء الجزائر.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-cream-50 to-blush-50" id="steps">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium text-sm tracking-wider mb-2 block">خطوات بسيطة</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brown-dark mb-4">
            كيف تطلبين من Boutique Rital
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blush-400 via-gold-400 to-blush-400 mx-auto rounded-full"></div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-6 text-center transition-all duration-500 cursor-pointer group border border-cream-200 ${activeStep === index
                ? "shadow-xl -translate-y-2 border-blush-300"
                : "shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-blush-200"
                }`}
              onClick={() => isSmallScreen && setActiveStep(activeStep === index ? null : index)}
              onMouseEnter={() => !isSmallScreen && setActiveStep(index)}
              onMouseLeave={() => !isSmallScreen && setActiveStep(null)}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blush-400 to-blush-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${activeStep === index
                ? "bg-blush-500 text-white"
                : "bg-blush-100 text-blush-500 group-hover:bg-blush-500 group-hover:text-white"
                }`}>
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-brown-dark mb-3">{step.title}</h3>

              {/* Description */}
              <p className={`text-brown-light text-sm leading-relaxed transition-all duration-300 ${activeStep === index
                ? "opacity-100 max-h-24"
                : "opacity-60 lg:opacity-0 lg:group-hover:opacity-100 max-h-0 lg:max-h-0 lg:group-hover:max-h-24 overflow-hidden"
                }`}>
                {step.description}
              </p>

              {/* Gold accent line */}
              <div className={`w-12 h-0.5 bg-gold-400 mx-auto mt-4 rounded-full transition-all duration-300 ${activeStep === index ? "w-20" : "group-hover:w-20"
                }`}></div>
            </div>
          ))}
        </div>

        {/* Connection Lines (visible on large screens) */}
        <div className="hidden lg:flex justify-between items-center px-16 -mt-[180px] mb-[120px] pointer-events-none">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-gradient-to-r from-blush-200 via-gold-300 to-blush-200 mx-4"></div>
          ))}
        </div>
      </div>
    </section>
  );
}
