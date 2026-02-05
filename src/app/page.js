import HeroSection from "../components/HeroSection";
import CarCategories from "../components/CarCategories";
import StepsToBook from "../components/StepsToBook";
import ComingSoon from "../components/ComingSoon";
import { Suspense } from "react";

// Loading skeleton for categories
function CategoriesLoading() {
  return (
    <section className="py-20 px-4" id="car-categories">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-4 w-32 bg-slate-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-10 w-64 bg-slate-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="w-24 h-1 bg-slate-200 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
              <div className="h-64 bg-slate-200 animate-pulse"></div>
              <div className="p-6">
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 w-full bg-slate-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <HeroSection />
      <Suspense fallback={<CategoriesLoading />}>
        <CarCategories />
      </Suspense>
      <StepsToBook />
      <ComingSoon />
    </div>
  );
}
