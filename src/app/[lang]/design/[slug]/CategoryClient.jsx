"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import CarDetailsModal from "@/components/CarDetailsModal";
import BookingModal from "@/components/BookingModal";
import CarCard from "@/components/CarCard";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BsFuelPump } from "react-icons/bs";
import { TbManualGearbox } from "react-icons/tb";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
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

    // Helper to format price
    const formatPrice = (priceStr) => {
        const price = Number(priceStr);
        if (isNaN(price)) return priceStr;

        if (price > 100) {
            const formatted = price / 10000;
            return `${formatted.toLocaleString('en-US', { maximumFractionDigits: 10 })} ${dict?.cars_page?.currency || 'Million'}`;
        }

        return `${price.toLocaleString('en-US', { maximumFractionDigits: 10 })} ${dict?.cars_page?.currency || 'Million'}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    // ... (rest of render logic until price display)



    if (!category) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 flex flex-col items-center justify-center px-4">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">{dict?.common?.error || "Category not found"}</h1>
                <Link
                    href={`/${lang}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-slate-900 rounded-xl hover:bg-gold-600 transition-colors"
                >
                    <FiArrowRight />
                    {dict?.header?.home || "Home"}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">

                    <span className="text-gold-400 font-medium text-sm tracking-wider mb-2">{dict?.categories?.fleet || "Our Fleet"}</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-slate-500 via-gold-400 to-slate-500 rounded-full mb-4"></div>
                    <p className="text-slate-300 max-w-xl text-lg">{category.description}</p>
                </div>
            </div>

            {/* Cars Section */}
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Cars Count */}
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-slate-600">
                            <span className="font-bold text-gold-600">{products.length}</span> {dict?.cars_page?.no_results ? dict.cars_page.title : "Cars available"}
                        </p>
                    </div>

                    {/* Cars Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
<<<<<<< HEAD
                                <CarCard key={product.id} car={product} onBook={handleProductClick} dict={dict} />
=======
                                <div
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200 hover:border-gold-300 cursor-pointer"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 md:h-56 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                        {product.image && !product.image.includes("placeholder") ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                className="transition-transform duration-500 group-hover:scale-110"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Availability Badge */}
                                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${product.stock !== 0
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                            }`}>
                                            {product.stock !== 0 ? (dict?.booking?.available || 'Available') : (dict?.booking?.unavailable || 'Unavailable')}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 md:p-5">
                                        <h3 className="font-bold text-slate-800 group-hover:text-gold-600 transition-colors mb-2 text-lg">
                                            {product.name}
                                        </h3>

                                        {/* Car Specs - Quick view */}
                                        <div className="flex items-center gap-3 text-slate-500 text-sm mb-3">
                                            <span className="flex items-center gap-1">
                                                <TbManualGearbox className="text-gold-500" />
                                                {dict?.specs?.transmission_auto || "Auto"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BsFuelPump className="text-gold-500" />
                                                {dict?.specs?.fuel_petrol || "Petrol"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MdAirlineSeatReclineNormal className="text-gold-500" />
                                                5
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xl font-bold text-gold-600">{formatPrice(product.price)}</p>
                                                <p className="text-xs text-slate-500">{dict?.cars_page?.per_day || "/ day"}</p>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium group-hover:text-gold-600 transition-colors">
                                                {dict?.categories?.view_cars || "View Details"} ←
                                            </span>
                                        </div>
                                    </div>
                                </div>
>>>>>>> fc1a37aa1da7f8a4a8643dd9913cd7b8505f680b
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{dict?.cars_page?.no_results || "No cars found"}</h3>
                            <p className="text-slate-600 mb-6">{dict?.coming_soon?.title || "Coming Soon"}</p>
                            <Link
                                href={`/${lang}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-slate-900 rounded-xl hover:bg-gold-600 transition-colors"
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
