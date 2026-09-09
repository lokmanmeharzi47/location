"use client";
import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from "react-icons/fi";
import Image from "next/image";

export default function ImageCarousel({
    images = [],
    productName = "",
    productPrice = "",
    currentIndex = 0,
    onIndexChange,
    showBadge = true,
    onImageClick,
}) {
    const [activeIndex, setActiveIndex] = useState(currentIndex);

    useEffect(() => {
        setActiveIndex(currentIndex);
    }, [currentIndex]);

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

    const showNavigation = images.length > 1;

    return (
        <div className="relative h-72 sm:h-80 bg-slate-950 overflow-hidden group">
            {/* Current Image */}
            <div className="w-full h-full relative">
                {images[activeIndex] && !images[activeIndex].includes("placeholder") ? (
                    <Image
                        src={images[activeIndex]}
                        alt={`${productName} - image ${activeIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                        onClick={() => onImageClick?.(activeIndex)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                        <FiShoppingBag size={64} />
                    </div>
                )}
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none"></div>
            </div>

            {/* Navigation Arrows */}
            {showNavigation && (
                <>
                    <button
                        onClick={goToPrevious}
                        disabled={activeIndex === 0}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/80 text-gold-400 shadow-lg transition-all duration-200 cursor-pointer ${activeIndex === 0
                                ? 'opacity-20 cursor-not-allowed'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-slate-800 hover:scale-110 hover:border-gold-500/50'
                            }`}
                        aria-label="Previous image"
                    >
                        <FiChevronLeft size={18} />
                    </button>

                    <button
                        onClick={goToNext}
                        disabled={activeIndex === images.length - 1}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/80 text-gold-400 shadow-lg transition-all duration-200 cursor-pointer ${activeIndex === images.length - 1
                                ? 'opacity-20 cursor-not-allowed'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-slate-800 hover:scale-110 hover:border-gold-500/50'
                            }`}
                        aria-label="Next image"
                    >
                        <FiChevronRight size={18} />
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
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === activeIndex
                                    ? 'bg-gold-500 w-6'
                                    : 'bg-white/40 hover:bg-white/80 w-2'
                                }`}
                            aria-label={`Image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Product Badge */}
            {showBadge && (
                <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-xl border border-gold-500/25">
                    <p className="text-sm font-bold text-white truncate max-w-[150px]">
                        {productName}
                    </p>
                    <p className="text-gold-400 font-bold text-sm">
                        {productPrice}
                    </p>
                </div>
            )}

            {/* Image Counter */}
            {showNavigation && (
                <div className="absolute top-4 left-4 z-10 bg-slate-950/70 backdrop-blur-md border border-white/10 text-slate-300 px-2.5 py-1 rounded-full text-xs">
                    {activeIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}
