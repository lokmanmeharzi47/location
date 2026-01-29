"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiShoppingBag, FiFilter, FiX } from "react-icons/fi";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug;

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
                                    onClick={() => setSelectedProduct(product)}
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

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Product Image */}
                        <div className="relative h-72 bg-gradient-to-br from-blush-100 to-cream-100">
                            {selectedProduct.image && !selectedProduct.image.includes("placeholder") ? (
                                <Image
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FiShoppingBag size={64} className="text-cream-300" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Product Details */}
                        <div className="p-6">
                            <span className="text-xs text-gold-600 font-medium">{category.name}</span>
                            <h2 className="text-2xl font-bold text-brown-dark mt-1 mb-3">{selectedProduct.name}</h2>

                            {selectedProduct.description && (
                                <p className="text-brown-light mb-4 leading-relaxed">{selectedProduct.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                                <p className="text-2xl font-bold text-gold-600">{selectedProduct.price}</p>
                                <Link
                                    href={`/order?product=${selectedProduct.id}`}
                                    className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium shadow-lg shadow-gold-500/20"
                                >
                                    <FiShoppingBag size={18} />
                                    اطلب الآن
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
