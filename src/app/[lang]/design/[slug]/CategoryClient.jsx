"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import CarCard from "@/components/CarCard";
import CarDetailsModal from "@/components/CarDetailsModal";
import BookingModal from "@/components/BookingModal";

export default function CategoryClient({ slug, dict, lang }) {
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Two-step modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchCategoryAndProducts();
        }
    }, [slug]);

    const fetchCategoryAndProducts = async () => {
        try {
            setLoading(true);

            // Fetch all categories to find the matching one
            const catRes = await fetch("/api/categories?active=true");
            const catData = await catRes.json();

            if (catData.success) {
                const foundCat = catData.categories.find(
                    c => c.slug === slug || c.name === decodeURIComponent(slug)
                );
                setCategory(foundCat);

                if (foundCat) {
                    // Fetch products for this category
                    const prodRes = await fetch(`/api/products?category_id=${foundCat.id}`);
                    const prodData = await prodRes.json();

                    if (prodData.success) {
                        setProducts(prodData.products.filter(p => p.status === "متوفر"));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle car card click - show CarDetailsModal (step 1)
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowBookingModal(false);
    };

    // Handle "Book Now" click - show BookingModal (step 2)
    const handleBookingClick = (product) => {
        setSelectedProduct(product);
        setShowBookingModal(true);
    };

    // Handle back from BookingModal to CarDetailsModal
    const handleBackToProduct = () => {
        setShowBookingModal(false);
    };

    // Handle close all modals
    const handleCloseModals = () => {
        setSelectedProduct(null);
        setShowBookingModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-gold-500"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">{dict?.common?.error || "Category not found"}</h1>
                <Link
                    href={`/${lang}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-full hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                >
                    <FiArrowRight />
                    {dict?.header?.home || "Home"}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Hero Banner */}
            <div className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-gold-500/15 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold-500/10 rounded-full blur-[130px] pointer-events-none"></div>
                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center z-10">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-medium text-xs tracking-wider uppercase mb-3">
                        {dict?.categories?.fleet || "Our Fleet"}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        {category.name}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-full mb-4"></div>
                    <p className="text-slate-300 max-w-xl text-base md:text-lg leading-relaxed">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Cars Section */}
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Cars Count */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
                        <p className="text-slate-400 text-sm md:text-base">
                            <span className="font-bold text-gold-400 text-lg">{products.length}</span> {dict?.cars_page?.no_results ? dict.cars_page.title : "Cars available"}
                        </p>
                    </div>

                    {/* Cars Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {products.map((product) => (
                                <CarCard key={product.id} car={product} onBook={handleProductClick} dict={dict} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 max-w-md mx-auto">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">{dict?.cars_page?.no_results || "No cars found"}</h3>
                            <p className="text-slate-400 mb-6">{dict?.coming_soon?.title || "Coming Soon"}</p>
                            <Link
                                href={`/${lang}/cars`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-full hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                            >
                                <FiArrowRight />
                                {dict?.cars_page?.reset_filters || "Browse Others"}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Step 1: Car Details Modal */}
            {selectedProduct && !showBookingModal && (
                <CarDetailsModal
                    product={selectedProduct}
                    category={category}
                    onClose={handleCloseModals}
                    onOrder={handleBookingClick}
                    dict={dict}
                />
            )}

            {/* Step 2: Booking Modal */}
            {selectedProduct && showBookingModal && (
                <BookingModal
                    product={selectedProduct}
                    category={category}
                    onClose={handleCloseModals}
                    onBack={handleBackToProduct}
                    dict={dict}
                />
            )}
        </div>
    );
}
