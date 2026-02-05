"use client";
import { useState, useEffect } from "react";

export default function StepsToBook() {
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
            title: "اختر السيارة",
            description: "تصفح أسطول سياراتنا المتنوع واختر السيارة التي تناسب احتياجاتك وميزانيتك.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
        },
        {
            number: "٢",
            title: "حدد موعد الاستلام",
            description: "اختر تاريخ ووقت استلام السيارة وتاريخ الإرجاع حسب جدولك.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            number: "٣",
            title: "أكمل الحجز",
            description: "املأ بيانات الحجز البسيطة وأكد حجزك بكل سهولة.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            number: "٤",
            title: "استلم سيارتك",
            description: "استلم سيارتك من موقعنا أو نوصلها لك أينما كنت في الجزائر.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100" id="steps">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="text-gold-500 font-medium text-sm tracking-wider mb-2 block">خطوات بسيطة</span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                        كيف تحجز من CarRent
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-slate-400 via-gold-400 to-slate-400 mx-auto rounded-full"></div>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl p-6 text-center transition-all duration-500 cursor-pointer group border border-slate-200 ${activeStep === index
                                ? "shadow-xl -translate-y-2 border-gold-400"
                                : "shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-gold-300"
                                }`}
                            onClick={() => isSmallScreen && setActiveStep(activeStep === index ? null : index)}
                            onMouseEnter={() => !isSmallScreen && setActiveStep(index)}
                            onMouseLeave={() => !isSmallScreen && setActiveStep(null)}
                        >
                            {/* Step Number Badge */}
                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                {step.number}
                            </div>

                            {/* Icon */}
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${activeStep === index
                                ? "bg-gold-500 text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-gold-500 group-hover:text-white"
                                }`}>
                                {step.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-slate-800 mb-3">{step.title}</h3>

                            {/* Description */}
                            <p className={`text-slate-600 text-sm leading-relaxed transition-all duration-300 ${activeStep === index
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
                        <div key={index} className="flex-1 h-0.5 bg-gradient-to-r from-slate-300 via-gold-300 to-slate-300 mx-4"></div>
                    ))}
                </div>
            </div>
        </section>
    );
}
