"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";

/**
 * ImageCarousel - A smart, swipeable image carousel with navigation
 * 
 * Features:
 * - Swipe/touch support via CSS scroll-snap
 * - Left/right navigation arrows
 * - Pagination dots
 * - Product badge overlay (name + price)
 * - Smooth transitions
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
    const scrollContainerRef = useRef(null);
    const isScrollingRef = useRef(false);

    // Sync with external currentIndex changes (e.g., when color changes)
    useEffect(() => {
        setActiveIndex(currentIndex);
        scrollToIndex(currentIndex);
    }, [currentIndex]);

    const scrollToIndex = useCallback((index) => {
        if (scrollContainerRef.current && !isScrollingRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = index * container.offsetWidth;
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }
    }, []);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current && !isScrollingRef.current) {
            const container = scrollContainerRef.current;
            const newIndex = Math.round(container.scrollLeft / container.offsetWidth);
            if (newIndex !== activeIndex && newIndex >= 0 && newIndex < images.length) {
                setActiveIndex(newIndex);
                onIndexChange?.(newIndex);
            }
        }
    }, [activeIndex, images.length, onIndexChange]);

    const goToIndex = useCallback((index) => {
        if (index >= 0 && index < images.length) {
            isScrollingRef.current = true;
            setActiveIndex(index);
            scrollToIndex(index);
            onIndexChange?.(index);
            setTimeout(() => {
                isScrollingRef.current = false;
            }, 350);
        }
    }, [images.length, scrollToIndex, onIndexChange]);

    const goToPrevious = useCallback(() => {
        goToIndex(activeIndex - 1);
    }, [activeIndex, goToIndex]);

    const goToNext = useCallback(() => {
        goToIndex(activeIndex + 1);
    }, [activeIndex, goToIndex]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                goToNext(); // RTL: left arrow goes next
            } else if (e.key === 'ArrowRight') {
                goToPrevious(); // RTL: right arrow goes previous
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrevious]);

    // Empty state
    if (!images || images.length === 0) {
        return (
            <div className="relative h-72 sm:h-80 bg-gradient-to-br from-blush-100 via-cream-100 to-blush-50 flex items-center justify-center">
                <FiShoppingBag size={64} className="text-cream-300" />
            </div>
        );
    }

    const showNavigation = images.length > 1;

    return (
        <div className="relative h-72 sm:h-80 bg-gradient-to-br from-blush-100 via-cream-100 to-blush-50 overflow-hidden group">
            {/* Images Container with Scroll Snap */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-full h-full snap-center relative"
                    >
                        {image && !image.includes("placeholder") ? (
                            <Image
                                src={image}
                                alt={`${productName} - صورة ${index + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="transition-transform duration-500"
                                priority={index === 0}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiShoppingBag size={64} className="text-cream-300" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {showNavigation && (
                <>
                    {/* Previous Arrow (Right side for RTL) */}
                    <button
                        onClick={goToPrevious}
                        disabled={activeIndex === 0}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 ${activeIndex === 0
                                ? 'opacity-30 cursor-not-allowed'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
                            }`}
                        aria-label="الصورة السابقة"
                    >
                        <FiChevronRight size={20} className="text-brown-dark" />
                    </button>

                    {/* Next Arrow (Left side for RTL) */}
                    <button
                        onClick={goToNext}
                        disabled={activeIndex === images.length - 1}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 ${activeIndex === images.length - 1
                                ? 'opacity-30 cursor-not-allowed'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
                            }`}
                        aria-label="الصورة التالية"
                    >
                        <FiChevronLeft size={20} className="text-brown-dark" />
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {showNavigation && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === activeIndex
                                    ? 'bg-gold-500 scale-125'
                                    : 'bg-brown-light/40 hover:bg-brown-light/60'
                                }`}
                            aria-label={`انتقل إلى الصورة ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Product Badge Overlay */}
            {showBadge && (productName || productPrice) && (
                <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-white/50">
                    {productName && (
                        <p className="text-sm font-bold text-brown-dark truncate max-w-[140px]">
                            {productName}
                        </p>
                    )}
                    {productPrice && (
                        <p className="text-xs font-semibold text-gold-600">
                            {productPrice}
                        </p>
                    )}
                </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
        </div>
    );
}
