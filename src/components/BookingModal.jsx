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
    return Math.max(diffDays, 1);
}

function addDays(dateStr, days) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        pickupLocation: "agency",
        paymentMethod: "espece",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const isEconomy = useMemo(() => {
        const catName = (category?.name || product?.category || product?.category_name || "").toLowerCase();
        const catSlug = (category?.slug || product?.category_slug || "").toLowerCase();
        const catId = category?.id || product?.category_id || product?.categoryId;
        return (
            catId === 5 ||
            product?.min_rental_days === 3 ||
            product?.minRentalDays === 3 ||
            catName.includes("econom") ||
            catSlug.includes("econom") ||
            catName.includes("اقتصاد") ||
            catSlug.includes("اقتصاد") ||
            catName === "économique"
        );
    }, [category, product]);

    const today = new Date().toISOString().split('T')[0];
    const minReturnDate = isEconomy
        ? (formData.pickupDate ? addDays(formData.pickupDate, 3) : addDays(today, 3))
        : (formData.pickupDate || today);

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
        } else if (name === "pickupDate") {
            setFormData((prev) => {
                const newPickup = value;
                let newReturn = prev.returnDate;
                if (isEconomy && newPickup) {
                    const minReturn = addDays(newPickup, 3);
                    if (!newReturn || newReturn < minReturn) {
                        newReturn = minReturn;
                    }
                } else if (newPickup && newReturn && newReturn < newPickup) {
                    newReturn = newPickup;
                }
                return { ...prev, pickupDate: newPickup, returnDate: newReturn };
            });
            setError(null);
        } else if (name === "returnDate") {
            if (isEconomy && formData.pickupDate) {
                const minReturn = addDays(formData.pickupDate, 3);
                if (value < minReturn) {
                    setError(
                        dict?.booking?.min_economy_days_error ||
                        "الحد الأدنى لمدّة الحجز في الفئة الاقتصادية هو 3 أيام."
                    );
                } else {
                    setError(null);
                }
            } else {
                setError(null);
            }
            setFormData((prev) => ({ ...prev, returnDate: value }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const dailyPrice = Number(product?.price) || 0;
    const rentalDays = useMemo(() => calculateDays(formData.pickupDate, formData.returnDate), [formData.pickupDate, formData.returnDate]);
    const totalPrice = dailyPrice * rentalDays;

    function formatPrice(priceInput) {
        const price = Number(priceInput);
        if (isNaN(price)) return priceInput;

        if (price > 100) {
            const formatted = price / 10000;
            return `${formatted.toLocaleString('en-US', { maximumFractionDigits: 10 })} ${(dict?.cars_page?.currency || "Million")}`;
        }

        return `${price.toLocaleString('en-US', { maximumFractionDigits: 10 })} ${(dict?.cars_page?.currency || "Million")}`;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isEconomy && rentalDays < 3) {
            setError(
                dict?.booking?.min_economy_days_error ||
                "الحد الأدنى لمدّة الحجز في الفئة الاقتصادية هو 3 أيام."
            );
            setLoading(false);
            return;
        }

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

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
            } else {
                setError(data.error || dict?.booking?.error_generic);
            }
        } catch (err) {
            console.error("Booking error:", err);
            setError(dict?.booking?.error_generic);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} dir="rtl">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
                <div
                    className="relative bg-slate-900 border border-gold-500/30 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-fadeIn text-white"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                        <FiCheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{dict?.booking?.success_title}</h2>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">{dict?.booking?.success_desc}</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                    >
                        {dict?.common?.close || "Close"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} dir="rtl">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

            <div
                className="relative bg-slate-900 border border-gold-500/30 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn flex flex-col text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-4 flex items-center justify-between border-b border-slate-800">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                    >
                        <FiArrowRight size={18} />
                        {dict?.booking?.back}
                    </button>
                    <h2 className="text-lg font-bold text-white">{dict?.booking?.modal_title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-slate-800 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                                <FiAlertCircle className="flex-shrink-0 text-lg" />
                                {error}
                            </div>
                        )}

                        {/* Car Summary */}
                        <div className="flex items-center gap-4 p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <p className="text-xs text-gold-400 font-semibold uppercase">{category?.name || dict?.cars_page?.category_label}</p>
                                    {isEconomy && (
                                        <span className="text-[11px] font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-full">
                                            {dict?.booking?.min_economy_badge || "الحد الأدنى: 3 أيام"}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-white truncate text-base">{product.name}</h3>
                                <p className="text-gold-400 font-bold">{formatPrice(product.price)} / {dict?.booking?.currency || "day"}</p>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                    <FiCalendar className="inline ml-1 text-gold-400" />
                                    {dict?.booking?.pickup_date}
                                </label>
                                <input
                                    type="date"
                                    name="pickupDate"
                                    value={formData.pickupDate}
                                    onChange={handleChange}
                                    min={today}
                                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                    <FiCalendar className="inline ml-1 text-gold-400" />
                                    {dict?.booking?.return_date}
                                </label>
                                <input
                                    type="date"
                                    name="returnDate"
                                    value={formData.returnDate}
                                    onChange={handleChange}
                                    min={minReturnDate}
                                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        {isEconomy && (
                            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-1.5 -mt-2">
                                <FiAlertCircle className="flex-shrink-0" />
                                {dict?.booking?.min_economy_days_error || "الحد الأدنى لمدّة الحجز في الفئة الاقتصادية هو 3 أيام."}
                            </p>
                        )}

                        {/* Pickup Location Type */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                                {dict?.booking?.pickup_location}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pickupLocation: "agency" })}
                                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${formData.pickupLocation === "agency"
                                        ? "border-gold-500 bg-gold-500/10 text-gold-400"
                                        : "border-slate-800 bg-slate-800/70 text-slate-400 hover:border-slate-700"
                                        }`}
                                >
                                    <FiMapPin size={20} />
                                    <span className="text-sm font-medium">{dict?.booking?.agency}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pickupLocation: "delivery" })}
                                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${formData.pickupLocation === "delivery"
                                        ? "border-gold-500 bg-gold-500/10 text-gold-400"
                                        : "border-slate-800 bg-slate-800/70 text-slate-400 hover:border-slate-700"
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    <span className="text-sm font-medium">{dict?.booking?.delivery}</span>
                                </button>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                    {dict?.booking?.full_name}
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder={dict?.booking?.full_name}
                                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm"
                                    required
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                    {dict?.booking?.phone}
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="0778612190"
                                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                    {dict?.booking?.wilaya}
                                </label>
                                <select
                                    name="wilaya"
                                    value={formData.wilaya}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 appearance-none cursor-pointer text-sm"
                                    required
                                >
                                    <option value="" className="bg-slate-900">{dict?.booking?.wilaya}</option>
                                    {wilayasList.map((wilaya) => (
                                        <option key={wilaya} value={wilaya} className="bg-slate-900">
                                            {wilaya}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                    {dict?.booking?.commune}
                                </label>
                                <select
                                    name="commune"
                                    value={formData.commune}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 appearance-none cursor-pointer text-sm disabled:opacity-50"
                                    disabled={!formData.wilaya}
                                >
                                    <option value="" className="bg-slate-900">
                                        {formData.wilaya ? dict?.booking?.commune : "---"}
                                    </option>
                                    {formData.wilaya && wilayaCommunes[formData.wilaya]?.map((commune, index) => (
                                        <option key={index} value={commune} className="bg-slate-900">
                                            {commune}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                {dict?.booking?.notes}
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder={dict?.booking?.notes}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm resize-none"
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                                {dict?.booking?.payment_method}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: "cheque" })}
                                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${formData.paymentMethod === "cheque"
                                        ? "border-gold-500 bg-gold-500/10 text-gold-400"
                                        : "border-slate-800 bg-slate-800/70 text-slate-400 hover:border-slate-700"
                                        }`}
                                >
                                    <FiCreditCard size={20} />
                                    <span className="text-sm font-medium">Chèque</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paymentMethod: "espece" })}
                                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${formData.paymentMethod === "espece"
                                        ? "border-gold-500 bg-gold-500/10 text-gold-400"
                                        : "border-slate-800 bg-slate-800/70 text-slate-400 hover:border-slate-700"
                                        }`}
                                >
                                    <FiDollarSign size={20} />
                                    <span className="text-sm font-medium">Espèce</span>
                                </button>
                            </div>
                        </div>

                        {/* Price Summary */}
                        {formData.pickupDate && formData.returnDate && (
                            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 animate-fadeIn">
                                <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>{dict?.booking?.price_per_day}:</span>
                                    <span className="font-medium text-white">{formatPrice(product.price)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>{dict?.booking?.total_days}:</span>
                                    <span className="font-medium text-white">{rentalDays} {dict?.cars_page?.per_day || "days"}</span>
                                </div>
                                <div className="border-t border-slate-800 pt-2 mt-2">
                                    <div className="flex justify-between text-lg font-bold text-white">
                                        <span>{dict?.booking?.total_amount}:</span>
                                        <span className="text-gold-400">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Submit Button */}
                    <div className="flex-shrink-0 p-5 pt-3 bg-slate-950/90 border-t border-slate-800">
                        <button
                            type="submit"
                            disabled={loading || !formData.fullName || !formData.phoneNumber || !formData.wilaya || !formData.pickupDate || !formData.returnDate}
                            className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/40 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                        <p className="text-center text-xs text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                            <FiCheckCircle size={11} className="text-emerald-400" />
                            {dict?.hero?.badge_clean || "Trusted Service"}
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
