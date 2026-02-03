"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import ProductModal from "@/components/ProductModal";
import OrderModal from "@/components/OrderModal";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug;

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Two-step modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

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

    // Handle product card click - show ProductModal (step 1)
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowOrderModal(false);
    };

    // Handle "Order Now" click - show OrderModal (step 2)
    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setShowOrderModal(true);
    };

    // Handle back from OrderModal to ProductModal
    const handleBackToProduct = () => {
        setShowOrderModal(false);
    };

    // Handle close all modals
    const handleCloseModals = () => {
        setSelectedProduct(null);
        setShowOrderModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cream-50 via-blush-50 to-cream-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cream-50 via-blush-50 to-cream-100 flex flex-col items-center justify-center px-4">
                <h1 className="text-2xl font-bold text-brown-dark mb-4">الفئة غير موجودة</h1>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors"
                >
                    <FiArrowRight />
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-cream-50 via-blush-50 to-cream-100">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-blush-200 via-cream-100 to-blush-100 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
                    <Link
                        href="/"
                        className="absolute top-6 right-6 flex items-center gap-2 text-brown-light hover:text-gold-600 transition-colors"
                    >
                        <FiArrowRight />
                        <span>العودة</span>
                    </Link>

                    <span className="text-gold-500 font-medium text-sm tracking-wider mb-2">تشكيلتنا الراقية</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-brown-dark mb-4">{category.name}</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blush-400 via-gold-400 to-blush-400 rounded-full mb-4"></div>
                    <p className="text-brown-light max-w-xl text-lg">{category.description}</p>
                </div>
            </div>

            {/* Products Section */}
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Products Count */}
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-brown-light">
                            <span className="font-bold text-gold-600">{products.length}</span> منتج متوفر
                        </p>
                    </div>

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-cream-200 hover:border-blush-200 cursor-pointer"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-blush-100 to-cream-100 overflow-hidden">
                                        {product.image && !product.image.includes("placeholder") ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                className="transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiShoppingBag size={48} className="text-cream-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 md:p-5">
                                        <h3 className="font-bold text-brown-dark group-hover:text-blush-600 transition-colors mb-2 line-clamp-1">
                                            {product.name}
                                        </h3>

                                        {/* Color Swatches */}
                                        {product.colors && product.colors.length > 0 && (
                                            <div className="flex gap-1 mb-2">
                                                {product.colors.slice(0, 5).map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-4 h-4 rounded-full shadow-sm border border-cream-200"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                                {product.colors.length > 5 && (
                                                    <span className="text-xs text-brown-light">+{product.colors.length - 5}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-bold text-gold-600">{product.price}</p>
                                            <span className="text-xs text-blush-500 font-medium group-hover:text-blush-600 transition-colors">
                                                عرض التفاصيل
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-cream-200">
                            <FiShoppingBag size={64} className="mx-auto text-cream-300 mb-4" />
                            <h3 className="text-xl font-bold text-brown-dark mb-2">لا توجد منتجات بعد</h3>
                            <p className="text-brown-light mb-6">سيتم إضافة منتجات قريباً</p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors"
                            >
                                <FiArrowRight />
                                تصفح الفئات الأخرى
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Step 1: Product Modal - Clean product preview */}
            {selectedProduct && !showOrderModal && (
                <ProductModal
                    product={selectedProduct}
                    category={category}
                    onClose={handleCloseModals}
                    onOrder={handleOrderClick}
                />
            )}

            {/* Step 2: Order Modal - Order form */}
            {selectedProduct && showOrderModal && (
                <OrderModal
                    product={selectedProduct}
                    category={category}
                    onClose={handleCloseModals}
                    onBack={handleBackToProduct}
                />
            )}
        </div>
    );
}
