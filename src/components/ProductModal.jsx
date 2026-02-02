"use client";
import { useEffect } from "react";
import Image from "next/image";
import { FiX, FiShoppingBag } from "react-icons/fi";

/**
 * ProductModal - Clean, elegant product preview modal
 * 
 * First step in the two-step order flow:
 * 1. User clicks product → ProductModal (view + price + order button)
 * 2. User clicks "اطلب الآن" → OrderModal (form)
 */
export default function ProductModal({
    product,
    category,
    onClose,
    onOrder
}) {
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

    if (!product) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            dir="rtl"
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className="relative bg-gradient-to-b from-cream-50 to-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-cream-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group"
                    aria-label="إغلاق"
                >
                    <FiX size={20} className="text-brown-dark group-hover:text-blush-600 transition-colors" />
                </button>

                {/* Product Image */}
                <div className="relative h-72 sm:h-80 bg-gradient-to-br from-blush-100 via-cream-100 to-blush-50 overflow-hidden">
                    {product.image && !product.image.includes("placeholder") ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="transition-transform duration-500 hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiShoppingBag size={64} className="text-cream-300" />
                        </div>
                    )}

                    {/* Elegant gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                </div>

                {/* Product Details */}
                <div className="p-6 pt-4 text-center space-y-4">
                    {/* Category Badge */}
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-gold-100 to-blush-100 text-gold-700 text-xs font-semibold rounded-full border border-gold-200/50">
                        {category?.name || "منتج مميز"}
                    </span>

                    {/* Product Name */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-brown-dark leading-tight">
                        {product.name}
                    </h2>

                    {/* Description (if exists, show truncated) */}
                    {product.description && (
                        <p className="text-brown-light text-sm leading-relaxed line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    {/* Price */}
                    <div className="py-3">
                        <p className="text-3xl font-bold bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                            {product.price}
                        </p>
                    </div>

                    {/* Decorative Line */}
                    <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

                    {/* Order CTA Button */}
                    <button
                        onClick={() => onOrder(product)}
                        className="w-full py-4 px-8 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-gold-500/30 hover:from-gold-600 hover:to-gold-700 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <FiShoppingBag size={20} />
                        اطلب الآن
                    </button>

                    {/* Trust Badge */}
                    <p className="text-xs text-brown-light/70 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        توصيل سريع لجميع الولايات
                    </p>
                </div>
            </div>
        </div>
    );
}
