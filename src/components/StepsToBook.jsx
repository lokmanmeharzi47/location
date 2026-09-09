"use client";
import { useState, useEffect } from "react";

export default function StepsToBook({ dict }) {
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
            number: "1",
            title: dict?.steps?.step_1_title,
            description: dict?.steps?.step_1_desc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
        },
        {
            number: "2",
            title: dict?.steps?.step_2_title,
            description: dict?.steps?.step_2_desc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            number: "3",
            title: dict?.steps?.step_3_title,
            description: dict?.steps?.step_3_desc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            number: "4",
            title: dict?.steps?.step_4_title,
            description: dict?.steps?.step_4_desc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden" id="steps">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold-500/5 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-medium text-xs tracking-wider uppercase mb-3">
                        {dict?.steps?.title_small}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                        {dict?.steps?.title_large}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full"></div>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {steps.map((step, index) => {
                        const isExpanded = activeStep === index;
                        return (
                            <div
                                key={index}
                                className={`relative bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 text-center transition-all duration-500 cursor-pointer group border ${
                                    isExpanded
                                        ? "shadow-2xl shadow-gold-500/15 -translate-y-2 border-gold-400/80 bg-slate-900/90"
                                        : "shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-gold-500/10 hover:-translate-y-2 border-slate-800/80 hover:border-gold-500/40"
                                }`}
                                onClick={() => isSmallScreen && setActiveStep(isExpanded ? null : index)}
                                onMouseEnter={() => !isSmallScreen && setActiveStep(index)}
                                onMouseLeave={() => !isSmallScreen && setActiveStep(null)}
                            >
                                {/* Step Number Badge */}
                                <div className="absolute -top-3.5 -right-3.5 w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 text-slate-950 font-black text-base rounded-full flex items-center justify-center shadow-lg shadow-gold-500/30 border-2 border-slate-950">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div
                                    className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                                        isExpanded
                                            ? "bg-gold-500 border-gold-400 text-slate-950 shadow-lg shadow-gold-500/30"
                                            : "bg-slate-800/80 border-slate-700/60 text-gold-400 group-hover:bg-gold-500 group-hover:border-gold-500 group-hover:text-slate-950 shadow-md"
                                    }`}
                                >
                                    {step.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-gold-300 transition-colors">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p
                                    className={`text-slate-400 text-sm leading-relaxed transition-all duration-300 ${
                                        isExpanded
                                            ? "opacity-100 max-h-28 text-slate-300"
                                            : "opacity-75 lg:opacity-60 lg:group-hover:opacity-100 max-h-20 lg:max-h-0 lg:group-hover:max-h-28 overflow-hidden"
                                    }`}
                                >
                                    {step.description}
                                </p>

                                {/* Gold accent line */}
                                <div
                                    className={`w-12 h-0.5 bg-gold-400/80 mx-auto mt-4 rounded-full transition-all duration-300 ${
                                        isExpanded ? "w-20 bg-gold-400" : "group-hover:w-20"
                                    }`}
                                ></div>
                            </div>
                        );
                    })}
                </div>

                {/* Connection Lines (visible on desktop) */}
                <div className="hidden lg:flex justify-between items-center px-16 -mt-[170px] mb-[120px] pointer-events-none">
                    {[1, 2, 3].map((_, index) => (
                        <div
                            key={index}
                            className="flex-1 h-0.5 bg-gradient-to-r from-slate-800 via-gold-500/30 to-slate-800 mx-4"
                        ></div>
                    ))}
                </div>
            </div>
        </section>
    );
}
