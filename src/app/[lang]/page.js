import HeroSection from "../../components/HeroSection";
import CarCategories from "../../components/CarCategories";
import StepsToBook from "../../components/StepsToBook";
import ComingSoon from "../../components/ComingSoon";
import WhyChooseUs from "../../components/WhyChooseUs";
import CoverageAreas from "../../components/CoverageAreas";
import FAQSection from "../../components/FAQSection";
import SEOContent from "../../components/SEOContent";
import { Suspense } from "react";
import { getDictionary } from "@/lib/dictionaries";

// Loading skeleton for categories in dark luxury style
function CategoriesLoading() {
    return (
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden" id="car-categories">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="h-4 w-32 bg-slate-800 rounded-full mx-auto mb-4 animate-pulse"></div>
                    <div className="h-10 w-72 bg-slate-800 rounded-lg mx-auto mb-4 animate-pulse"></div>
                    <div className="w-24 h-1 bg-slate-800 mx-auto rounded-full"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-slate-900/70 rounded-2xl overflow-hidden shadow-xl border border-slate-800 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-sm"
                        >
                            <div className="h-64 bg-slate-800/60 animate-pulse"></div>
                            <div className="p-6">
                                <div className="h-6 w-3/4 bg-slate-800 rounded mb-4 animate-pulse"></div>
                                <div className="h-4 w-full bg-slate-800/70 rounded mb-2 animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-slate-800/70 rounded mb-4 animate-pulse"></div>
                                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                                    <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default async function Home({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="bg-slate-950 text-white min-h-screen selection:bg-gold-500 selection:text-slate-950">
            <HeroSection dict={dict} lang={lang} />
            <Suspense fallback={<CategoriesLoading />}>
                <CarCategories dict={dict} lang={lang} />
            </Suspense>
            <StepsToBook dict={dict} />
            <WhyChooseUs dict={dict} />
            <CoverageAreas dict={dict} />
            <FAQSection dict={dict} lang={lang} />
            <SEOContent dict={dict} lang={lang} />
            <ComingSoon dict={dict} />
        </div>
    );
}
