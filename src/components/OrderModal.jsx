"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FiX, FiArrowRight, FiTruck, FiHome, FiMapPin, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import wilayaCommunes from "@/data/wilaya_communes.json";

/**
 * OrderModal - Streamlined order form modal
 * 
 * Second step in the two-step order flow:
 * Appears after user clicks "اطلب الآن" in ProductModal
 * 
 * UPDATED: Submits directly to the backend API instead of WhatsApp
 */

// Pricing data for delivery fees
const pricingData = {
    "01 ~ أدرار": { office: 1100, home: 1400 },
    "02 ~ الشلف": { office: 500, home: 850 },
    "03 ~ الأغواط": { office: 600, home: 1000 },
    "04 ~ أم البواقي": { office: 450, home: 850 },
    "05 ~ باتنة": { office: 450, home: 800 },
    "06 ~ بجاية": { office: 450, home: 750 },
    "07 ~ بسكرة": { office: 550, home: 950 },
    "08 ~ بشار": { office: 650, home: 1100 },
    "09 ~ البليدة": { office: 450, home: 750 },
    "10 ~ البويرة": { office: 450, home: 750 },
    "11 ~ تمنراست": { office: 1000, home: 1600 },
    "12 ~ تبسة": { office: 450, home: 850 },
    "13 ~ تلمسان": { office: 500, home: 900 },
    "14 ~ تيارت": { office: 450, home: 850 },
    "15 ~ تيزي وزو": { office: 450, home: 750 },
    "16 ~ الجزائر": { office: 400, home: 600 },
    "17 ~ الجلفة": { office: 550, home: 950 },
    "18 ~ جيجل": { office: 450, home: 750 },
    "19 ~ سطيف": { office: 450, home: 750 },
    "20 ~ السعيدة": { office: 450, home: 800 },
    "21 ~ سكيكدة": { office: 450, home: 750 },
    "22 ~ سيدي بلعباس": { office: 450, home: 800 },
    "23 ~ عنابة": { office: 450, home: 800 },
    "24 ~ قالمة": { office: 450, home: 750 },
    "25 ~ قسنطينة": { office: 450, home: 750 },
    "26 ~ المدية": { office: 450, home: 800 },
    "27 ~ مستغانم": { office: 450, home: 800 },
    "28 ~ المسيلة": { office: 500, home: 850 },
    "29 ~ معسكر": { office: 450, home: 800 },
    "30 ~ ورقلة": { office: 600, home: 950 },
    "31 ~ وهران": { office: 450, home: 750 },
    "32 ~ البيض": { office: 0, home: 1100 },
    "33 ~ إليزي": { office: 1100, home: 1600 },
    "34 ~ برج بوعريريج": { office: 450, home: 600 },
    "35 ~ بومرداس": { office: 450, home: 750 },
    "36 ~ الطارف": { office: 450, home: 800 },
    "37 ~ تندوف": { office: 1000, home: 1400 },
    "38 ~ تسيمسيلت": { office: 500, home: 800 },
    "39 ~ الوادي(واد سوف)": { office: 600, home: 950 },
    "40 ~ خنشلة": { office: 500, home: 800 },
    "41 ~ سوق اهراس": { office: 450, home: 750 },
    "42 ~ تيبازة": { office: 450, home: 750 },
    "43 ~ ميلة": { office: 200, home: 500 },
    "44 ~ عين الدفلى": { office: 450, home: 750 },
    "45 ~ النعامة": { office: 600, home: 1100 },
    "46 ~ عين تموشنت": { office: 450, home: 800 },
    "47 ~ غرداية": { office: 600, home: 950 },
    "48 ~ غليزان": { office: 450, home: 800 },
    "49 ~ تيميمون": { office: 1400, home: 1400 },
    "50 ~ برج باجي مختار": { office: 1400, home: 1400 },
    "51 ~ أولاد جلال": { office: 550, home: 900 },
    "52 ~ بني عباس": { office: 1000, home: 1000 },
    "53 ~ عين صالح": { office: 1600, home: 1600 },
    "54 ~ عين قزام": { office: 1600, home: 1600 },
    "55 ~ توقرت": { office: 600, home: 950 },
    "56 ~ جانت": { office: 1400, home: 1400 },
    "57 ~ المغير": { office: 950, home: 950 },
    "58 ~ المنيعة": { office: 1000, home: 1000 },
};

// Size options
const sizes = ["38", "40", "42", "44", "46", "48"];

function getDeliveryFee(wilaya, deliveryMethod) {
    if (!wilaya || !deliveryMethod) return 0;
    const pricing = pricingData[wilaya];
    if (!pricing) return 0;
    return deliveryMethod === "office" ? pricing.office : pricing.home;
}

function formatPrice(price) {
    return Math.floor(price).toLocaleString("ar-DZ") + " دج";
}

// Extract numeric price from string like "2500 دج" or "2,500 DA"
function extractPrice(priceStr) {
    if (!priceStr) return 0;
    const num = priceStr.toString().replace(/[^\d]/g, "");
    return parseInt(num, 10) || 0;
}

export default function OrderModal({
    product,
    category,
    onClose,
    onBack
}) {
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        wilaya: "",
        deliveryMethod: "",
        commune: "",
        size: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "wilaya") {
            setFormData({ ...formData, [name]: value, commune: "" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const basePrice = extractPrice(product?.price);
    const deliveryFee = getDeliveryFee(formData.wilaya, formData.deliveryMethod);
    const totalPrice = basePrice + deliveryFee;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const orderData = {
            customer_name: formData.fullName,
            phone: formData.phoneNumber,
            product_id: product?.id,
            product_name: product?.name,
            color: "-", // Can be enhanced later if color selection is added back
            size: formData.size,
            total: totalPrice,
            wilaya: formData.wilaya,
            address: `${formData.deliveryMethod === "office" ? "استلام من المكتب" : "توصيل للمنزل"} - ${formData.commune}`,
            notes: `طريقة التوصيل: ${formData.deliveryMethod === "office" ? "مكتب" : "منزل"}`
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
            } else {
                setError(result.message || "حدث خطأ أثناء إرسال الطلب");
            }
        } catch (err) {
            console.error("Order submission error:", err);
            setError("فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    // Success View
    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="text-green-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h2>
                    <p className="text-gray-600 mb-8">
                        شكراً لثقتك بنا. سيقوم فريقنا بالاتصال بك قريباً لتأكيد الطلب وترتيب عملية التوصيل.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        متابعة التسوق
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            dir="rtl"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className="relative bg-gradient-to-b from-cream-50 to-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn border border-cream-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-gold-500 to-gold-600 px-5 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
                    >
                        <FiArrowRight size={18} />
                        رجوع
                    </button>
                    <h2 className="text-lg font-bold text-white">إتمام الطلب</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        aria-label="إغلاق"
                    >
                        <FiX size={18} className="text-white" />
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <FiAlertCircle className="flex-shrink-0 text-lg" />
                                {error}
                            </div>
                        )}

                        {/* Product Summary */}
                        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blush-50 to-cream-50 rounded-2xl border border-cream-200">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                                {product.image && !product.image.includes("placeholder") ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-cream-300">
                                        <FiMapPin size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gold-600 font-medium">{category?.name || "منتج"}</p>
                                <h3 className="font-bold text-brown-dark truncate">{product.name}</h3>
                                <p className="text-gold-600 font-bold">{product.price}</p>
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-brown-dark mb-2">
                                اختر المقاس
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, size })}
                                        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${formData.size === size
                                            ? "bg-gold-500 text-white shadow-md"
                                            : "bg-cream-100 text-brown-dark hover:bg-cream-200 border border-cream-200"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form Fields - Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-brown-dark mb-1.5">
                                    الاسم الكامل
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="أدخل اسمك الكامل"
                                    className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-brown-dark placeholder-brown-light/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-brown-dark mb-1.5">
                                    رقم الهاتف
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="0555555555"
                                    className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-brown-dark placeholder-brown-light/50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            {/* Wilaya Dropdown */}
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-brown-dark mb-1.5">
                                    الولاية
                                </label>
                                <select
                                    name="wilaya"
                                    value={formData.wilaya}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-brown-dark focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">اختر الولاية</option>
                                    {Object.keys(pricingData).map((wilaya) => (
                                        <option key={wilaya} value={wilaya}>
                                            {wilaya}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Commune Dropdown */}
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-brown-dark mb-1.5">
                                    البلدية
                                </label>
                                <select
                                    name="commune"
                                    value={formData.commune}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-brown-dark focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                                    disabled={!formData.wilaya}
                                >
                                    <option value="">
                                        {formData.wilaya ? "اختر البلدية" : "---"}
                                    </option>
                                    {formData.wilaya && wilayaCommunes[formData.wilaya]?.map((commune, index) => (
                                        <option key={index} value={commune}>
                                            {commune}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Delivery Method */}
                        <div>
                            <label className="block text-sm font-semibold text-brown-dark mb-2">
                                طريقة التوصيل
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, deliveryMethod: "office" })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${formData.deliveryMethod === "office"
                                        ? "border-gold-500 bg-gold-50 text-gold-700"
                                        : "border-cream-200 bg-cream-50 text-brown-light hover:border-gold-300"
                                        }`}
                                >
                                    <FiTruck size={22} />
                                    <span className="text-sm font-medium">استلام من المكتب</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, deliveryMethod: "home" })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${formData.deliveryMethod === "home"
                                        ? "border-gold-500 bg-gold-50 text-gold-700"
                                        : "border-cream-200 bg-cream-50 text-brown-light hover:border-gold-300"
                                        }`}
                                >
                                    <FiHome size={22} />
                                    <span className="text-sm font-medium">توصيل للمنزل</span>
                                </button>
                            </div>
                        </div>

                        {/* Price Summary */}
                        {formData.wilaya && formData.deliveryMethod && (
                            <div className="bg-gradient-to-r from-blush-50 to-cream-50 rounded-2xl p-4 border border-cream-200 animate-fadeIn">
                                <div className="flex justify-between text-sm text-brown-light mb-2">
                                    <span>سعر المنتج:</span>
                                    <span className="font-medium">{product.price}</span>
                                </div>
                                <div className="flex justify-between text-sm text-brown-light mb-2">
                                    <span>سعر التوصيل:</span>
                                    <span className="font-medium">{formatPrice(deliveryFee)}</span>
                                </div>
                                <div className="border-t border-cream-200 pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-bold text-brown-dark">
                                        <span>الإجمالي:</span>
                                        <span className="text-gold-600">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Submit Button */}
                    <div className="flex-shrink-0 p-5 pt-3 bg-gradient-to-t from-cream-50 to-transparent border-t border-cream-200">
                        <button
                            type="submit"
                            disabled={loading || !formData.fullName || !formData.phoneNumber || !formData.wilaya || !formData.deliveryMethod || !formData.size}
                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold rounded-xl shadow-lg shadow-gold-500/30 hover:from-gold-600 hover:to-gold-700 hover:shadow-xl hover:shadow-gold-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <BiLoaderAlt className="animate-spin text-xl" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    إرسال الطلب
                                    <FiArrowRight className="rotate-180" />
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                            <FiCheckCircle size={10} className="text-green-500" />
                            الدفع عند الاستلام - تسوق آمن 100%
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
