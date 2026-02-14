"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FiX, FiArrowRight, FiMapPin, FiCheckCircle, FiAlertCircle, FiCalendar, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import wilayaCommunes from "@/data/wilaya_communes.json";

// Get wilayas list from communes data
const wilayasList = Object.keys(wilayaCommunes);

// Helper to calculate days between two dates
function calculateDays(pickupDate, returnDate) {
    if (!pickupDate || !returnDate) return 0;
    const pickup = new Date(pickupDate);
    const return_ = new Date(returnDate);
    const diffTime = Math.abs(return_ - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1); // Minimum 1 day
}

// Extract numeric price from string
function extractPrice(priceStr) {
    if (!priceStr) return 0;
    const num = priceStr.toString().replace(/[^\d]/g, "");
    return parseInt(num, 10) || 0;
}

export default function BookingModal({
    product,
    category,
    onClose,
    onBack,
    dict
}) {
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        wilaya: "",
        commune: "",
        pickupDate: "",
        returnDate: "",
        pickupLocation: "agency", // 'agency' or 'delivery'
        paymentMethod: "espece",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Get today's date for min date attribute
    const today = new Date().toISOString().split('T')[0];

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

    // Calculate pricing
    const dailyPrice = extractPrice(product?.price);
    const rentalDays = useMemo(() => calculateDays(formData.pickupDate, formData.returnDate), [formData.pickupDate, formData.returnDate]);
    const totalPrice = dailyPrice * rentalDays;

    function formatPrice(price) {
        return Math.floor(price).toLocaleString("en-US") + " " + (dict?.booking?.currency || "DA");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const orderData = {
            customer_name: formData.fullName,
            customer_phone: formData.phoneNumber,
            car_id: product?.id,
            customer_city: formData.wilaya,
            customer_address: `${formData.pickupLocation === "agency" ? "Agency" : "Delivery"} - ${formData.commune}`,
            pickup_date: formData.pickupDate,
            return_date: formData.returnDate,
            pickup_location: formData.pickupLocation,
            payment_method: formData.paymentMethod,
            daily_rate: dailyPrice,
            total_days: rentalDays,
            total_amount: totalPrice,
            notes: formData.notes
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

                // Open WhatsApp automatically
                const template = dict?.messages?.whatsapp_template || "Hello, I want to book a {carName}. Details: Name: {name}, Phone: {phone}.";
                const message = template
                    .replace("{carName}", product?.name || "")
                    .replace("{name}", formData.fullName)
                    .replace("{phone}", formData.phoneNumber);

                const url = `https://wa.me/213779132534?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            } else {
                setError(result.message || (dict?.common?.error || "Error submitting booking"));
            }
        } catch (err) {
            console.error("Booking submission error:", err);
            setError(dict?.common?.network_error || "Connection failed. Please try again.");
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{dict?.booking?.success_title}</h2>
                    <p className="text-gray-600 mb-8">
                        {dict?.booking?.success_msg}
                    </p>



                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                    >
                        {dict?.common?.close || "Close"}
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
                className="relative bg-gradient-to-b from-slate-50 to-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn border border-slate-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
                    >
                        <FiArrowRight size={18} />
                        {dict?.booking?.back}
                    </button>
                    <h2 className="text-lg font-bold text-white">{dict?.booking?.modal_title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        aria-label="Close"
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

                        {/* Car Summary */}
                        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl border border-slate-200">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                {product.image && !product.image.includes("placeholder") ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <FiMapPin size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gold-600 font-medium">{category?.name || dict?.cars_page?.category_label}</p>
                                <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                                <p className="text-gold-600 font-bold">{product.price} / {dict?.booking?.currency || "day"}</p>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Pickup Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    <FiCalendar className="inline ml-1" />
                                    {dict?.booking?.pickup_date}
                                </label>
                                <input
                                    type="date"
                                    name="pickupDate"
                                    value={formData.pickupDate}
                                    onChange={handleChange}
                                    min={today}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Return Date */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    <FiCalendar className="inline ml-1" />
                                    {dict?.booking?.return_date}
                                </label>
                                <input
                                    type="date"
                                    name="returnDate"
                                    value={formData.returnDate}
                                    onChange={handleChange}
                                    min={formData.pickupDate || today}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Pickup Location Type */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {dict?.booking?.pickup_location}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pickupLocation: "agency" })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${formData.pickupLocation === "agency"
                                        ? "border-gold-500 bg-gold-50 text-gold-700"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-gold-300"
                                        }`}
                                >
                                    <FiMapPin size={22} />
                                    <span className="text-sm font-medium">{dict?.booking?.agency}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pickupLocation: "delivery" })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${formData.pickupLocation === "delivery"
                                        ? "border-gold-500 bg-gold-50 text-gold-700"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-gold-300"
                                        }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    <span className="text-sm font-medium">{dict?.booking?.delivery}</span>
                                </button>
                            </div>
                        </div>

                        {/* Form Fields - Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {dict?.booking?.full_name}
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder={dict?.booking?.full_name}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {dict?.booking?.phone}
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="0555555555"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            {/* Wilaya Dropdown */}
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {dict?.booking?.wilaya}
                                </label>
                                <select
                                    name="wilaya"
                                    value={formData.wilaya}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">{dict?.booking?.wilaya}</option>
                                    {wilayasList.map((wilaya) => (
                                        <option key={wilaya} value={wilaya}>
                                            {wilaya}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Commune Dropdown */}
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {dict?.booking?.commune}
                                </label>
                                <select
                                    name="commune"
                                    value={formData.commune}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50"
                                    disabled={!formData.wilaya}
                                >
                                    <option value="">
                                        {formData.wilaya ? dict?.booking?.commune : "---"}
                                    </option>
                                    {formData.wilaya && wilayaCommunes[formData.wilaya]?.map((commune, index) => (
                                        <option key={index} value={commune}>
                                            {commune}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {dict?.booking?.notes}
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder={dict?.booking?.notes}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {dict?.booking?.payment_method}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: "cheque" })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${formData.paymentMethod === "cheque"
                                        ? "border-gold-500 bg-gold-50 text-gold-700"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-gold-300"
                                        }`}
                                >
                                    <FiCreditCard size={22} />
                                    <span className="text-sm font-medium">Chèque</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: "espece" })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${formData.paymentMethod === "espece"
                                        ? "border-gold-500 bg-gold-50 text-gold-700"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-gold-300"
                                        }`}
                                >
                                    <FiDollarSign size={22} />
                                    <span className="text-sm font-medium">Espèce</span>
                                </button>
                            </div>
                        </div>

                        {/* Price Summary */}
                        {formData.pickupDate && formData.returnDate && (
                            <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-4 border border-slate-200 animate-fadeIn">
                                <div className="flex justify-between text-sm text-slate-600 mb-2">
                                    <span>{dict?.booking?.price_per_day}:</span>
                                    <span className="font-medium">{product.price}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600 mb-2">
                                    <span>{dict?.booking?.total_days}:</span>
                                    <span className="font-medium">{rentalDays} {dict?.cars_page?.per_day || "days"}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-bold text-slate-800">
                                        <span>{dict?.booking?.total_amount}:</span>
                                        <span className="text-gold-600">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Submit Button */}
                    <div className="flex-shrink-0 p-5 pt-3 bg-gradient-to-t from-slate-50 to-transparent border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={loading || !formData.fullName || !formData.phoneNumber || !formData.wilaya || !formData.pickupDate || !formData.returnDate}
                            className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-gold-500/30 hover:from-gold-600 hover:to-gold-700 hover:shadow-xl hover:shadow-gold-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <BiLoaderAlt className="animate-spin text-xl" />
                                    {dict?.booking?.loading}
                                </>
                            ) : (
                                <>
                                    {dict?.booking?.confirm}
                                    <FiArrowRight className="rotate-180" />
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                            <FiCheckCircle size={10} className="text-green-500" />
                            {dict?.hero?.badge_clean || "Trusted"}
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
