"use client";

import { FaCogs } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function CarCard({ car, onBook, dict }) {
    const formatPrice = (priceStr) => {
        const price = Number(priceStr);
        if (isNaN(price)) return priceStr;

        // If price is > 100, assume it's in DA and convert to "Million" (10,000 DA unit)
        // Otherwise assume it's already in millions
        if (price > 100) {
            return `${(price / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${dict?.cars_page?.currency || 'Million'}`;
        }

        return `${price.toLocaleString()} ${dict?.cars_page?.currency || 'Million'}`;
    };

    const images = Array.isArray(car.images) && car.images.length > 0
        ? car.images
        : (car.image ? [car.image] : []);

    return (
        <div
            onClick={(e) => {
                // Ignore clicks on swiper navigation/pagination so they don't trigger the card click
                if (e.target.closest('.swiper-button-next') || e.target.closest('.swiper-button-prev') || e.target.closest('.swiper-pagination-bullet')) {
                    return;
                }
                onBook && onBook(car);
            }}
            className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/10 hover:-translate-y-1 cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-800">
                {images.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        className="w-full h-full"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img}
                                    alt={`${car.name} - Image ${index + 1}`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span>No Image</span>
                    </div>
                )}
                {car.category && (
                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-medium text-gold-400">{car.category}</span>
                    </div>
                )}
                {car.stock !== undefined && (
                    <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-semibold ${car.stock !== 0
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        {car.stock !== 0 ? (dict?.booking?.available || 'Available') : (dict?.booking?.unavailable || 'Unavailable')}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
                        {car.name}
                    </h3>
                    <div className="text-right">
                        <p className="text-gold-500 font-bold text-lg">
                            {formatPrice(car.price)}
                        </p>
                        <p className="text-xs text-slate-400">{dict?.cars_page?.per_day || "/ day"}</p>
                    </div>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <FaCogs className="text-gold-500/70" />
                        <span>{car.transmission}</span>
                    </div>
                    {/* Add more specs if available in data, e.g. fuel or seats */}
                </div>

                {/* Action */}
                <button
                    className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-gold-500/25 active:scale-95 transition-all duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBook && onBook(car);
                    }}
                >
                    {dict?.cars_page?.book_now || "Book Now"}
                </button>
            </div>
        </div>
    );
}
