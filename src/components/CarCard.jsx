"use client";

import { useState } from "react";
import { FaCogs } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function CarSlideImage({ src, alt, loading }) {
    const [error, setError] = useState(false);

    if (!src || src.includes("placeholder") || error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                <span className="text-sm">No Image</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            loading={loading}
            onError={() => setError(true)}
        />
    );
}

export default function CarCard({ car, onBook, dict }) {
    const formatPrice = (priceStr) => {
        const price = Number(priceStr);
        if (isNaN(price)) return priceStr;

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
                if (e.target.closest('.swiper-button-next') || e.target.closest('.swiper-button-prev') || e.target.closest('.swiper-pagination-bullet')) {
                    return;
                }
                onBook && onBook(car);
            }}
            className="group bg-slate-900/75 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-500/10 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between shadow-xl shadow-black/40"
        >
            {/* Image Container */}
            <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-800/60">
                {images.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        className="w-full h-full"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <div className="relative w-full h-full">
                                    <CarSlideImage
                                        src={img}
                                        alt={`${car.name} - Image ${index + 1}`}
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span>No Image</span>
                    </div>
                )}

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none z-[1]"></div>

                {car.category && (
                    <div className="absolute top-3 left-3 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-gold-500/30 shadow-md">
                        <span className="text-xs font-semibold text-gold-400">{car.category}</span>
                    </div>
                )}
                {car.stock !== undefined && (
                    <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${car.stock !== 0
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-rose-500/90 text-white'
                        }`}>
                        {car.stock !== 0 ? (dict?.booking?.available || 'Available') : (dict?.booking?.unavailable || 'Unavailable')}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors leading-snug">
                            {car.name}
                        </h3>
                        <div className="text-right flex-shrink-0">
                            <p className="text-gold-400 font-extrabold text-xl leading-none">
                                {formatPrice(car.price)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{dict?.cars_page?.per_day || "/ day"}</p>
                        </div>
                    </div>

                    {/* Specs badge */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                            <FaCogs className="text-gold-400" />
                            <span>{car.transmission}</span>
                        </div>
                    </div>
                </div>

                {/* Action CTA */}
                <button
                    className="w-full py-3 px-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBook && onBook(car);
                    }}
                >
                    <span>{dict?.cars_page?.book_now || "Book Now"}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
