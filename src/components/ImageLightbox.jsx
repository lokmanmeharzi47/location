"use client";
import { useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ImageLightbox({
    images = [],
    currentIndex = 0,
    onClose,
    onIndexChange
}) {
    // Handle keyboard navigation and escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev(e);
            if (e.key === "ArrowRight") handleNext(e);
        };
        
        document.addEventListener("keydown", handleKeyDown);
        
        // Prevent scrolling when lightbox is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [currentIndex, images.length, onClose]);

    const handlePrev = (e) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            onIndexChange?.(currentIndex - 1);
        }
    };

    const handleNext = (e) => {
        e?.stopPropagation();
        if (currentIndex < images.length - 1) {
            onIndexChange?.(currentIndex + 1);
        }
    };

    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];
    if (!currentImage || currentImage.includes("placeholder")) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-300 animate-backdropFade"
            onClick={onClose}
        >
            {/* Close button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110"
                aria-label="Close fullscreen view"
            >
                <FiX size={24} />
            </button>

            {/* Previous Button */}
            {images.length > 1 && currentIndex > 0 && (
                <button 
                    onClick={handlePrev}
                    className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 hover:-translate-x-1"
                    aria-label="Previous image"
                >
                    <FiChevronLeft size={32} />
                </button>
            )}

            {/* Next Button */}
            {images.length > 1 && currentIndex < images.length - 1 && (
                <button 
                    onClick={handleNext}
                    className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 hover:translate-x-1"
                    aria-label="Next image"
                >
                    <FiChevronRight size={32} />
                </button>
            )}

            {/* Image Container */}
            <div 
  className="relative w-[90vw] h-[90vh] flex items-center justify-center select-none"
  onClick={(e) => e.stopPropagation()} 
>
  <img 
    src={currentImage} 
    alt={`Fullscreen view ${currentIndex + 1}`} 
    className="w-full h-full object-cover animate-modalZoomIn rounded-xl transition-all duration-300"
  />
</div>

{/* Image Counter */}
{images.length > 1 && (
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm tracking-widest font-medium z-[10000]">
    {currentIndex + 1} / {images.length}
  </div>
)}
           
        </div>
    );
}
