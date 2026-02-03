"use client";
import { useState, useEffect, useCallback } from "react";
import { FiX, FiShoppingBag } from "react-icons/fi";
import ImageCarousel from "./ImageCarousel";
import ColorSwatches from "./ColorSwatches";

/**
 * ProductModal - Clean, elegant product preview modal with color-aware carousel
 * 
 * First step in the two-step order flow:
 * 1. User clicks product → ProductModal (view + price + order button)
 * 2. User clicks "اطلب الآن" → OrderModal (form)
 * 
 * Features:
 * - Image carousel with swipe, arrows, and pagination dots
 * - Color swatches that switch the carousel to that color's images
 * - Product badge overlay with name and price
 */
export default function ProductModal({
    product,
    category,
    onClose,
    onOrder
}) {
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
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
        setSelectedVariantIndex(0);
        setCarouselIndex(0);
    }, [product?.id]);

    const handleColorChange = useCallback((index) => {
        setSelectedVariantIndex(index);
        setCarouselIndex(0); // Reset carousel to first image when color changes
    }, []);

    if (!product) return null;

    // Get variants - use product.variants if available, otherwise create from legacy data
    const variants = product.variants && product.variants.length > 0
        ? product.variants
        : product.colors && product.colors.length > 0
            ? product.colors.map((color, i) => ({
                colorName: color,
                colorCode: color,
                images: i === 0 && product.image ? [product.image] : [],
                stock: 0
            }))
            : [{
                colorName: 'الافتراضي',
                colorCode: '#C9A86C',
                images: product.image ? [product.image] : [],
                stock: product.stock
            }];

    // Get current variant and its images
    const currentVariant = variants[selectedVariantIndex] || variants[0];
    const currentImages = currentVariant?.images?.length > 0
        ? currentVariant.images
        : [product.image || '/images/placeholder.jpg'];

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
                    className="absolute top-4 left-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group"
                    aria-label="إغلاق"
                >
                    <FiX size={20} className="text-brown-dark group-hover:text-blush-600 transition-colors" />
                </button>

                {/* Image Carousel */}
                <ImageCarousel
                    images={currentImages}
                    productName={product.name}
                    productPrice={product.price}
                    currentIndex={carouselIndex}
                    onIndexChange={setCarouselIndex}
                    showBadge={true}
                />

                {/* Color Swatches - Below Carousel */}
                {variants.length > 1 && (
                    <div className="bg-cream-50/50 border-b border-cream-100">
                        <ColorSwatches
                            variants={variants}
                            selectedIndex={selectedVariantIndex}
                            onColorChange={handleColorChange}
                            size="md"
                        />
                    </div>
                )}

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

                    {/* Selected Color Name (when multiple variants) */}
                    {variants.length > 1 && currentVariant?.colorName && (
                        <p className="text-sm text-brown-light">
                            اللون: <span className="font-semibold text-brown-dark">{currentVariant.colorName}</span>
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
                        onClick={() => onOrder({ ...product, selectedVariant: currentVariant })}
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
