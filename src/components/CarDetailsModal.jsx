"use client";
import { useState, useEffect } from "react";
import { FiX, FiCalendar } from "react-icons/fi";
import { BsFuelPump, BsSpeedometer2 } from "react-icons/bs";
import { TbManualGearbox } from "react-icons/tb";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import ImageCarousel from "./ImageCarousel";
import ImageLightbox from "./ImageLightbox";

export default function CarDetailsModal({
    product,
    category,
    onClose,
    onOrder,
    dict
}) {
    const formatPrice = (priceStr) => {
        const price = Number(priceStr);
        if (isNaN(price)) return priceStr;

        if (price > 100) {
            const formatted = price / 10000;
            return `${formatted.toLocaleString('en-US', { maximumFractionDigits: 10 })} ${dict?.cars_page?.currency || 'Million'}`;
        }

        return `${price.toLocaleString('en-US', { maximumFractionDigits: 10 })} ${dict?.cars_page?.currency || 'Million'}`;
    };

    const [carouselIndex, setCarouselIndex] = useState(0);
    const [openImageViewer, setOpenImageViewer] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [onClose]);

    // Reset states when product changes
    useEffect(() => {
        setCarouselIndex(0);
        setOpenImageViewer(false);
        setCurrentImageIndex(0);
    }, [product?.id]);

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
        setOpenImageViewer(true);
    };

    if (!product) return null;

    // Get images for carousel
    const carImages = product.variants && product.variants.length > 0 && product.variants[0]?.images?.length > 0
        ? product.variants[0].images
        : product.image
            ? [product.image]
            : ['/images/placeholder.svg'];

    const getTransmissionLabel = (val) => {
        if (!val) return dict?.specs?.transmission_auto;
        const lower = val.toLowerCase();
        if (lower.includes('auto') || lower.includes('أوتو')) return dict?.specs?.transmission_auto;
        return dict?.specs?.transmission_manual;
    };

    const getFuelLabel = (val) => {
        if (!val) return dict?.specs?.fuel_petrol;
        const lower = val.toLowerCase();
        if (lower.includes('die') || lower.includes('مازوت')) return dict?.specs?.fuel_diesel;
        return dict?.specs?.fuel_petrol;
    };

    const carSpecs = {
        transmission: getTransmissionLabel(product.transmission),
        fuel: getFuelLabel(product.fuel),
        seats: product.seats || "5",
        year: product.year || "2024",
    };

    const isAvailable = product.stock !== 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            dir="rtl"
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

            {/* Modal Content */}
            <div
                className="relative bg-slate-900 border border-gold-500/30 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-20 p-2 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-700/80 hover:bg-slate-700 hover:text-gold-400 transition-all duration-200 cursor-pointer"
                    aria-label="Close"
                >
                    <FiX size={18} className="text-slate-300" />
                </button>

                {/* Availability Badge */}
                <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${isAvailable
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-rose-500/90 text-white'
                    }`}>
                    {isAvailable ? (dict?.booking?.available || 'Available') : (dict?.booking?.unavailable || 'Unavailable')}
                </div>

                {/* Image Carousel */}
                <ImageCarousel
                    images={carImages}
                    productName={product.name}
                    productPrice={formatPrice(product.price)}
                    currentIndex={carouselIndex}
                    onIndexChange={setCarouselIndex}
                    showBadge={true}
                    onImageClick={handleImageClick}
                />

                {/* Car Specifications */}
                <div className="bg-slate-950/70 border-b border-slate-800/80">
                    <div className="grid grid-cols-4 gap-2 p-4">
                        <div className="flex flex-col items-center text-center">
                            <TbManualGearbox className="text-gold-400 text-xl mb-1" />
                            <span className="text-xs text-slate-300">{carSpecs.transmission}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <BsFuelPump className="text-gold-400 text-xl mb-1" />
                            <span className="text-xs text-slate-300">{carSpecs.fuel}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <MdAirlineSeatReclineNormal className="text-gold-400 text-xl mb-1" />
                            <span className="text-xs text-slate-300">{carSpecs.seats} {dict?.specs?.seats}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <BsSpeedometer2 className="text-gold-400 text-xl mb-1" />
                            <span className="text-xs text-slate-300">{carSpecs.year}</span>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-6 pt-4 text-center space-y-4">
                    {/* Category Badge */}
                    <span className="inline-block px-3.5 py-1 bg-gold-500/10 text-gold-400 text-xs font-semibold rounded-full border border-gold-500/25">
                        {category?.name || dict?.cars_page?.category_label}
                    </span>

                    {/* Car Name */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        {product.name}
                    </h2>

                    {/* Description */}
                    {product.description && (
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    {/* Price per day */}
                    <div className="py-2">
                        <p className="text-3xl font-extrabold bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{dict?.cars_page?.per_day}</p>
                    </div>

                    {/* Decorative Line */}
                    <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

                    {/* Book CTA Button */}
                    <button
                        onClick={() => onOrder(product)}
                        disabled={!isAvailable}
                        className={`w-full py-3.5 px-8 font-bold text-base sm:text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${isAvailable
                            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 hover:shadow-xl hover:shadow-gold-500/30 hover:scale-[1.02]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                    >
                        <FiCalendar size={20} />
                        {dict?.cars_page?.book_now}
                    </button>

                    {/* Trust Badge */}
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        {dict?.booking?.pickup_location}
                    </p>
                </div>
            </div>

            {/* Image Lightbox */}
            {openImageViewer && (
                <ImageLightbox
                    images={carImages}
                    currentIndex={currentImageIndex}
                    onClose={() => setOpenImageViewer(false)}
                    onIndexChange={setCurrentImageIndex}
                />
            )}
        </div>
    );
}
