"use client";
import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";

/**
 * ImageCarousel - Simple state-based image carousel
 * No scroll-snap, just show/hide images based on activeIndex
 */
export default function ImageCarousel({
    images = [],
    productName = "",
    productPrice = "",
    currentIndex = 0,
    onIndexChange,
    showBadge = true,
}) {
    const [activeIndex, setActiveIndex] = useState(currentIndex);

    // Sync with external currentIndex changes
    useEffect(() => {
        setActiveIndex(currentIndex);
    }, [currentIndex]);

    // Navigation handlers
    const goToNext = () => {
        if (activeIndex < images.length - 1) {
            const newIndex = activeIndex + 1;
            setActiveIndex(newIndex);
            onIndexChange?.(newIndex);
        }
    };

    const goToPrevious = () => {
        if (activeIndex > 0) {
            const newIndex = activeIndex - 1;
            setActiveIndex(newIndex);
            onIndexChange?.(newIndex);
        }
    };

    const goToIndex = (index) => {
        setActiveIndex(index);
        onIndexChange?.(index);
    };

    // Show navigation only if more than 1 image
    const showNavigation = images.length > 1;

    return (
        <div className="relative h-72 sm:h-80 bg-gradient-to-br from-blush-100 via-cream-100 to-blush-50 overflow-hidden group">
            {/* Current Image */}
            <div className="w-full h-full relative">
                {images[activeIndex] && !images[activeIndex].includes("placeholder") ? (
                    <img
                        src={images[activeIndex]}
                        alt={`${productName} - صورة ${activeIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FiShoppingBag size={64} className="text-cream-300" />
                    </div>
                )}
            </div>

            {/* Navigation Arrows */}
            {showNavigation && (
                <>
                    {/* Previous Arrow */}
                    <button
                        onClick={goToPrevious}
                        disabled={activeIndex === 0}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 ${activeIndex === 0
                                ? 'opacity-30 cursor-not-allowed'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
                            }`}
                        aria-label="الصورة السابقة"
                    >
                        <FiChevronLeft size={20} className="text-brown-dark" />
                    </button>

                    {/* Next Arrow */}
                    <button
                        onClick={goToNext}
                        disabled={activeIndex === images.length - 1}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 ${activeIndex === images.length - 1
                                ? 'opacity-30 cursor-not-allowed'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
                            }`}
                        aria-label="الصورة التالية"
                    >
                        <FiChevronRight size={20} className="text-brown-dark" />
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {showNavigation && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${index === activeIndex
                                    ? 'bg-amber-500 w-6'
                                    : 'bg-white/60 hover:bg-white'
                                }`}
                            aria-label={`صورة ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Product Badge */}
            {showBadge && (
                <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                    <p className="text-sm font-bold text-brown-dark truncate max-w-[150px]">
                        {productName}
                    </p>
                    <p className="text-amber-600 font-semibold text-sm">
                        {productPrice}
                    </p>
                </div>
            )}

            {/* Image Counter */}
            {showNavigation && (
                <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                    {activeIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}
