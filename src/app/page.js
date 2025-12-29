import HeroSection from "../components/HeroSection";
import ClothingStyles from "../components/ClothingCategories";
import StepsToOrder from "../components/StepsToOrder";
import ComingSoon from "../components/ComingSoon";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-cream-50 via-blush-50 to-cream-100">
      <HeroSection />
      <ClothingStyles />
      <StepsToOrder />
      <ComingSoon />
    </div>
  );
}
