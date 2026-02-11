"use client";
import { useState, useEffect } from "react";
import { FiX, FiCalendar } from "react-icons/fi";
import { BsFuelPump, BsSpeedometer2 } from "react-icons/bs";
import { TbManualGearbox } from "react-icons/tb";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import ImageCarousel from "./ImageCarousel";

export default function CarDetailsModal({
    product,
    category,
    onClose,
    onOrder,
    dict
}) {
    const [carouselIndex, setCarouselIndex] = useState(0);

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
    }, [product?.id]);

    if (!product) return null;

    // Get images for carousel
    const carImages = product.variants && product.variants.length > 0 && product.variants[0]?.images?.length > 0
        ? product.variants[0].images
        : product.image
            ? [product.image]
            : ['/images/placeholder.svg'];

    // Mock car specifications (using dictionary mapping)
    // We assume backend returns standard keys like "Automatic" or we map "أوتوماتيك" to dict key
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

    // Check availability (mock - would come from backend)
    const isAvailable = product.stock !== 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            dir="rtl"
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className="relative bg-gradient-to-b from-slate-50 to-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group"
                    aria-label="Close"
                >
                    <FiX size={20} className="text-slate-700 group-hover:text-slate-900 transition-colors" />
                </button>

                {/* Availability Badge */}
                <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-semibold ${isAvailable
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {isAvailable ? (dict?.booking?.available || 'Available') : (dict?.booking?.unavailable || 'Unavailable')}
                </div>

                {/* Image Carousel */}
                <ImageCarousel
                    images={carImages}
                    productName={product.name}
                    productPrice={product.price}
                    currentIndex={carouselIndex}
                    onIndexChange={setCarouselIndex}
                    showBadge={true}
                />

                {/* Car Specifications */}
                <div className="bg-slate-100 border-b border-slate-200">
                    <div className="grid grid-cols-4 gap-2 p-4">
                        <div className="flex flex-col items-center text-center">
                            <TbManualGearbox className="text-gold-600 text-xl mb-1" />
                            <span className="text-xs text-slate-600">{carSpecs.transmission}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <BsFuelPump className="text-gold-600 text-xl mb-1" />
                            <span className="text-xs text-slate-600">{carSpecs.fuel}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <MdAirlineSeatReclineNormal className="text-gold-600 text-xl mb-1" />
                            <span className="text-xs text-slate-600">{carSpecs.seats} {dict?.specs?.seats}</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <BsSpeedometer2 className="text-gold-600 text-xl mb-1" />
                            <span className="text-xs text-slate-600">{carSpecs.year}</span>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-6 pt-4 text-center space-y-4">
                    {/* Category Badge */}
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-xs font-semibold rounded-full border border-slate-300">
                        {category?.name || dict?.cars_page?.category_label}
                    </span>

                    {/* Car Name */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                        {product.name}
                    </h2>

                    {/* Description (if exists, show truncated) */}
                    {product.description && (
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    {/* Price per day */}
                    <div className="py-3">
                        <p className="text-3xl font-bold bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                            {product.price}
                        </p>
                        <p className="text-sm text-slate-500">{dict?.cars_page?.per_day}</p>
                    </div>

                    {/* Decorative Line */}
                    <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

                    {/* Book CTA Button */}
                    <button
                        onClick={() => onOrder(product)}
                        disabled={!isAvailable}
                        className={`w-full py-4 px-8 font-bold text-lg rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${isAvailable
                            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 hover:from-gold-600 hover:to-gold-700 hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <FiCalendar size={20} />
                        {dict?.cars_page?.book_now}
                    </button>

                    {/* Trust Badge */}
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        {dict?.booking?.pickup_location}
                    </p>
                </div>
            </div>
        </div>
    );
}
