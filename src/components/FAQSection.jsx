"use client";
import { useState } from "react";
import Script from "next/script";

export default function FAQSection({ dict, lang }) {
    const [openIndex, setOpenIndex] = useState(null);
    const questions = dict?.faq?.questions || [];

    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Generate FAQ JSON-LD structured data
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map((q) => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": q.answer,
            },
        })),
    };

    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden" id="faq">
            {/* FAQ Schema JSON-LD */}
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                strategy="afterInteractive"
            />

            {/* Ambient Lighting */}
            <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                        {dict?.faq?.title}
                    </h2>
                    <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-5 leading-relaxed">
                        {dict?.faq?.subtitle}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full"></div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {questions.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`rounded-2xl backdrop-blur-md transition-all duration-300 overflow-hidden border ${
                                    isOpen
                                        ? "bg-slate-900/90 border-gold-500/50 shadow-2xl shadow-gold-500/10"
                                        : "bg-slate-900/60 border-slate-800/80 hover:border-gold-500/40 hover:bg-slate-900/80 shadow-lg shadow-black/30"
                                }`}
                            >
                                {/* Question */}
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full flex items-center justify-between p-6 text-start group cursor-pointer"
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${index}`}
                                >
                                    <span className={`text-base md:text-lg font-semibold pe-4 transition-colors ${
                                        isOpen ? "text-gold-300" : "text-white group-hover:text-gold-300"
                                    }`}>
                                        {item.question}
                                    </span>
                                    <div
                                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                                            isOpen
                                                ? "bg-gold-500 border-gold-400 text-slate-950 rotate-180 shadow-md shadow-gold-500/20"
                                                : "bg-slate-800 border-slate-700/60 text-gold-400 group-hover:bg-slate-700"
                                        }`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </button>

                                {/* Answer */}
                                <div
                                    id={`faq-answer-${index}`}
                                    className={`transition-all duration-300 ease-in-out ${
                                        isOpen
                                            ? "max-h-96 opacity-100"
                                            : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className="px-6 pb-6 pt-1">
                                        <div className="w-full h-px bg-slate-800/80 mb-4"></div>
                                        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
