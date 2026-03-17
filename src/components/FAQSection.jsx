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
        <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50" id="faq">
            {/* FAQ Schema JSON-LD */}
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                strategy="afterInteractive"
            />

            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                        {dict?.faq?.title}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
                        {dict?.faq?.subtitle}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-slate-400 via-gold-400 to-slate-400 mx-auto rounded-full"></div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {questions.map((item, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl shadow-md border transition-all duration-300 overflow-hidden ${openIndex === index
                                    ? "border-gold-400 shadow-lg"
                                    : "border-slate-200 hover:border-gold-300 hover:shadow-lg"
                                }`}
                        >
                            {/* Question */}
                            <button
                                onClick={() => toggleQuestion(index)}
                                className="w-full flex items-center justify-between p-6 text-start"
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <span className="text-base md:text-lg font-semibold text-slate-800 pe-4">
                                    {item.question}
                                </span>
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index
                                            ? "bg-gold-500 text-white rotate-180"
                                            : "bg-slate-100 text-slate-600"
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
                                className={`transition-all duration-300 ${openIndex === index
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="px-6 pb-6">
                                    <div className="w-full h-px bg-slate-200 mb-4"></div>
                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
