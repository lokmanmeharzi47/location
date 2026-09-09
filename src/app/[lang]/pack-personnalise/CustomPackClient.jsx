"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiCheck,
    FiPlus,
    FiSearch,
    FiX,
    FiFilter,
    FiCalendar,
    FiUser,
    FiPhone,
    FiMapPin,
    FiCheckCircle,
    FiAlertCircle,
    FiArrowRight,
    FiShield,
    FiHeart,
    FiUsers,
    FiCompass,
    FiSliders,
    FiAward,
    FiUserCheck,
    FiGift,
    FiInfo
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import wilayaCommunes from "@/data/wilaya_communes.json";

const wilayasList = Object.keys(wilayaCommunes);

export default function CustomPackClient({ initialCars = [], dict, lang }) {
    const isRtl = lang === "ar";

    // 1. Selection & Filter States
    const [cars] = useState(initialCars);
    const [selectedCarIds, setSelectedCarIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showOnlySelected, setShowOnlySelected] = useState(false);

    // 2. Dates setup (default tomorrow and 2 days after)
    const getDefaultDates = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 2);

        return {
            pickup: tomorrow.toISOString().split("T")[0],
            returnDate: dayAfter.toISOString().split("T")[0]
        };
    };

    const defaults = getDefaultDates();

    // 3. Form States
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        customerCity: "",
        pickupDate: defaults.pickup,
        returnDate: defaults.returnDate,
        eventType: dict?.custom_pack?.event_mariage || "Mariage & Cortège de luxe",
        withChauffeur: false,
        withDecoration: false,
        notes: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successModalData, setSuccessModalData] = useState(null);

    // Categories list extracted from cars
    const categories = useMemo(() => {
        const set = new Set();
        cars.forEach(c => {
            if (c.category) set.add(c.category);
        });
        return Array.from(set);
    }, [cars]);

    // Toggle Car Selection
    const toggleCarSelection = (carId) => {
        setSelectedCarIds(prev => {
            if (prev.includes(carId)) {
                return prev.filter(id => id !== carId);
            } else {
                return [...prev, carId];
            }
        });
        setErrorMessage("");
    };

    // Selected cars objects
    const selectedCars = useMemo(() => {
        return cars.filter(c => selectedCarIds.includes(c.id));
    }, [cars, selectedCarIds]);

    // Calculate Rental Days
    const rentalDays = useMemo(() => {
        if (!formData.pickupDate || !formData.returnDate) return 1;
        const p = new Date(formData.pickupDate);
        const r = new Date(formData.returnDate);
        const diffTime = r - p;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [formData.pickupDate, formData.returnDate]);

    // Format price in Millions (or مليون)
    const formatPrice = (priceVal) => {
        const num = Number(priceVal);
        if (isNaN(num)) return priceVal;

        // In Algerian car rental, prices are stored in millions (e.g., 1, 2, 3, 6) or in full DZD (e.g., 20000)
        const val = num > 100 ? (num / 10000) : num;
        const formatted = val.toLocaleString(isRtl ? 'ar-DZ' : 'fr-FR', { maximumFractionDigits: 1 });

        if (isRtl) {
            const unitAr = val >= 3 && val <= 10 ? (dict?.custom_pack?.millions || "ملايين") : (dict?.custom_pack?.million || "مليون");
            return `${formatted} ${unitAr}`;
        }
        const unit = val > 1 ? (dict?.custom_pack?.millions || "Millions") : (dict?.custom_pack?.million || "Million");
        return `${formatted} ${unit}`;
    };

    // Daily & Total Price Estimates (in Millions)
    const dailyTotal = useMemo(() => {
        return selectedCars.reduce((acc, car) => {
            const p = Number(car.price || 0);
            const normalized = p > 100 ? (p / 10000) : p;
            return acc + normalized;
        }, 0);
    }, [selectedCars]);

    const estimatedTotal = useMemo(() => {
        return dailyTotal * rentalDays;
    }, [dailyTotal, rentalDays]);

    // Filtered Cars
    const filteredCars = useMemo(() => {
        return cars.filter(car => {
            if (showOnlySelected && !selectedCarIds.includes(car.id)) {
                return false;
            }
            if (selectedCategory !== "all" && car.category !== selectedCategory) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = (car.name || "").toLowerCase().includes(q);
                const matchCat = (car.category || "").toLowerCase().includes(q);
                if (!matchName && !matchCat) return false;
            }
            return true;
        });
    }, [cars, selectedCarIds, showOnlySelected, selectedCategory, searchQuery]);

    // Event Types Definition
    const eventTypes = [
        {
            id: "mariage",
            title: dict?.custom_pack?.event_mariage || "Mariage & Cortège de luxe",
            icon: FiHeart,
            badge: "Top Choix"
        },
        {
            id: "vip",
            title: dict?.custom_pack?.event_vip || "VIP, Diplomatique & Délégation",
            icon: FiShield,
            badge: "Prestige"
        },
        {
            id: "prive",
            title: dict?.custom_pack?.event_private || "Événement privé & Célébration",
            icon: FiAward,
            badge: null
        },
        {
            id: "groupe",
            title: dict?.custom_pack?.event_vacation || "Vacances & Escapade en groupe",
            icon: FiCompass,
            badge: null
        },
        {
            id: "autre",
            title: dict?.custom_pack?.event_other || "Autre besoin sur-mesure",
            icon: FiSliders,
            badge: null
        }
    ];

    const todayStr = new Date().toISOString().split("T")[0];

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const nextState = {
                ...prev,
                [name]: type === "checkbox" ? checked : value
            };
            if (name === "pickupDate" && nextState.returnDate < value) {
                const nextDay = new Date(value);
                nextDay.setDate(nextDay.getDate() + 1);
                nextState.returnDate = nextDay.toISOString().split("T")[0];
            }
            return nextState;
        });
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (selectedCars.length === 0) {
            setErrorMessage(dict?.custom_pack?.no_cars_selected || "Veuillez sélectionner au moins un véhicule.");
            // Scroll to cars selection
            const carsSec = document.getElementById("select-cars-section");
            if (carsSec) carsSec.scrollIntoView({ behavior: "smooth" });
            return;
        }

        if (!formData.customerName.trim()) {
            setErrorMessage("Veuillez renseigner votre nom et prénom.");
            return;
        }

        if (!formData.customerPhone.trim() || formData.customerPhone.trim().length < 8) {
            setErrorMessage("Veuillez renseigner un numéro de téléphone valide.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                customer_name: formData.customerName,
                customer_phone: formData.customerPhone,
                customer_city: formData.customerCity,
                pickup_date: formData.pickupDate,
                return_date: formData.returnDate,
                total_days: rentalDays,
                event_type: formData.eventType,
                with_chauffeur: formData.withChauffeur,
                with_decoration: formData.withDecoration,
                selected_cars: selectedCars.map(c => ({
                    id: c.id,
                    name: c.name,
                    price: c.price,
                    formatted_price: formatPrice(c.price),
                    category: c.category,
                    image: c.image
                })),
                estimated_total: estimatedTotal,
                formatted_total: formatPrice(estimatedTotal),
                notes: formData.notes
            };

            const res = await fetch("/api/custom-pack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                setSuccessModalData({
                    whatsappUrl: data.whatsapp_url,
                    bookingId: data.booking_id,
                    carsCount: selectedCars.length,
                    total: formatPrice(estimatedTotal)
                });

                // Attempt to open WhatsApp directly
                if (data.whatsapp_url) {
                    window.open(data.whatsapp_url, "_blank");
                }
            } else {
                setErrorMessage(data.message || "Une erreur est survenue lors de l'enregistrement.");
            }
        } catch (err) {
            console.error("Pack submit error:", err);
            setErrorMessage("Impossible d'envoyer la demande. Vérifiez votre connexion internet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const scrollToForm = () => {
        const formEl = document.getElementById("pack-form-section");
        if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-gold-500 selection:text-slate-950 pt-24 pb-32 relative overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
            {/* Ambient Background Lights */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-gold-500/10 via-gold-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-[600px] -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-[1200px] -right-32 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto pt-6 pb-12">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 font-semibold text-xs tracking-widest uppercase mb-5">
                        <FiAward size={15} className="shrink-0 text-gold-400" />
                        <span>{dict?.custom_pack?.badge || "Service VIP & Événements"}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                        {dict?.custom_pack?.title || "Composez Votre Pack Personnalisé"}
                    </h1>

                    <div className="w-28 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full mb-6"></div>

                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                        {dict?.custom_pack?.subtitle || "Mariages, cortèges d'exception, délégations VIP ou événements privés : sélectionnez vos véhicules, personnalisez vos prestations et recevez un devis sur-mesure instantanément."}
                    </p>

                    {/* 3 Step Interactive Stepper */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-10 text-start">
                        {/* Step 1 */}
                        <div
                            onClick={() => {
                                const el = document.getElementById("select-cars-section");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3.5 ${
                                selectedCars.length > 0
                                    ? "bg-slate-900/90 border-gold-500/50 shadow-lg shadow-gold-500/10"
                                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                            }`}
                        >
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 ${
                                selectedCars.length > 0
                                    ? "bg-gold-500 text-slate-950 shadow-md shadow-gold-500/40"
                                    : "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                            }`}>
                                {selectedCars.length > 0 ? <FiCheck size={18} strokeWidth={3} /> : "1"}
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>{dict?.custom_pack?.step_1_title || "1. Choisissez vos voitures"}</span>
                                    {selectedCars.length > 0 && (
                                        <span className="text-[10px] text-gold-400 font-extrabold">({selectedCars.length})</span>
                                    )}
                                </h4>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{dict?.custom_pack?.step_1_desc || "Cochez vos véhicules préférés"}</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div
                            onClick={() => {
                                const el = document.getElementById("pack-form-section");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3.5 ${
                                formData.customerName && formData.customerPhone
                                    ? "bg-slate-900/90 border-gold-500/50 shadow-lg shadow-gold-500/10"
                                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                            }`}
                        >
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 ${
                                formData.customerName && formData.customerPhone
                                    ? "bg-gold-500 text-slate-950 shadow-md shadow-gold-500/40"
                                    : "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                            }`}>
                                {formData.customerName && formData.customerPhone ? <FiCheck size={18} strokeWidth={3} /> : "2"}
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-white">{dict?.custom_pack?.step_2_title || "2. Personnalisez l'événement"}</h4>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{dict?.custom_pack?.step_2_desc || "Chauffeur, cortège, dates"}</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3.5">
                            <span className="w-9 h-9 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-sm border border-gold-500/30 shrink-0">3</span>
                            <div>
                                <h4 className="text-xs font-bold text-white">{dict?.custom_pack?.step_3_title || "3. Devis sur WhatsApp"}</h4>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{dict?.custom_pack?.step_3_desc || "Réponse VIP en quelques minutes"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STEP 1: CAR SELECTION SECTION */}
                <div id="select-cars-section" className="mb-14 scroll-mt-28">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-gold-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                                    1
                                </span>
                                <h2 className="text-2xl font-bold text-white">
                                    {dict?.custom_pack?.step_1_title || "Sélectionnez vos véhicules"}
                                </h2>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">
                                {dict?.custom_pack?.step_1_desc || "Cochez les véhicules que vous souhaitez intégrer à votre pack ou cortège."}
                            </p>
                        </div>

                        {/* Selected Counter & Toggle */}
                        <div className="flex items-center gap-3 self-start md:self-auto">
                            <button
                                type="button"
                                onClick={() => setShowOnlySelected(!showOnlySelected)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                                    showOnlySelected
                                        ? "bg-gold-500 text-slate-950 border-gold-400 shadow-md shadow-gold-500/20"
                                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-gold-500/40"
                                }`}
                            >
                                <FiFilter size={14} className={showOnlySelected ? "text-slate-950" : "text-gold-400"} />
                                <span>{dict?.custom_pack?.filter_selected_only || "Voir ma sélection"}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${showOnlySelected ? "bg-slate-950 text-gold-400" : "bg-gold-500/20 text-gold-400"}`}>
                                    {selectedCarIds.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Category Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                        {/* Search input */}
                        <div className="relative w-full sm:w-72">
                            <FiSearch className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={dict?.custom_pack?.search_cars || "Rechercher un modèle..."}
                                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-9 rtl:pl-9 rtl:pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <FiX size={15} />
                                </button>
                            )}
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("all")}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                                    selectedCategory === "all"
                                        ? "bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 shadow-md shadow-gold-500/20"
                                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                                }`}
                            >
                                {dict?.custom_pack?.all_categories || "Toutes les catégories"}
                            </button>
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                                        selectedCategory === cat
                                            ? "bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 shadow-md shadow-gold-500/20"
                                            : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cars Grid */}
                    {filteredCars.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400">
                            <FiAlertCircle className="mx-auto mb-3 text-gold-400" size={36} />
                            <p className="text-base font-semibold text-white mb-1">Aucun véhicule trouvé</p>
                            <p className="text-xs text-slate-400">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCars.map((car) => {
                                const isSelected = selectedCarIds.includes(car.id);

                                return (
                                    <div
                                        key={car.id}
                                        onClick={() => toggleCarSelection(car.id)}
                                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col border-2 select-none ${
                                            isSelected
                                                ? "bg-gradient-to-b from-slate-900 to-[#121927] border-gold-500 shadow-xl shadow-gold-500/20 scale-[1.02]"
                                                : "bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-gold-500/40 shadow-lg hover:-translate-y-1"
                                        }`}
                                    >
                                        {/* Top Checkmark Indicator */}
                                        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-20">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                                                    isSelected
                                                        ? "bg-gold-500 text-slate-950 scale-110 shadow-gold-500/40"
                                                        : "bg-black/60 backdrop-blur-md text-slate-300 border border-white/20 group-hover:border-gold-500/60"
                                                }`}
                                            >
                                                {isSelected ? <FiCheck size={16} strokeWidth={3} /> : <FiPlus size={16} />}
                                            </div>
                                        </div>

                                        {/* Category Badge */}
                                        {car.category && (
                                            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-20">
                                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-black/60 backdrop-blur-md text-gold-400 border border-gold-500/30">
                                                    {car.category}
                                                </span>
                                            </div>
                                        )}

                                        {/* Car Image */}
                                        <div className="relative h-48 bg-slate-800/50 overflow-hidden">
                                            <Image
                                                src={car.image}
                                                alt={car.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                className={`transition-transform duration-500 ease-out group-hover:scale-105 ${
                                                    isSelected ? "scale-105" : ""
                                                }`}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70"></div>
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-gold-500/10 transition-colors"></div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4 flex flex-col justify-between flex-1">
                                            <div>
                                                <h3 className={`text-base font-bold transition-colors ${
                                                    isSelected ? "text-gold-300" : "text-white group-hover:text-gold-400"
                                                }`}>
                                                    {car.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {car.transmission || "Automatique"}
                                                </p>
                                            </div>

                                            {/* Price and Action Button */}
                                            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-extrabold text-gold-400">
                                                        {formatPrice(car.price)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 ms-1">/ {dict?.custom_pack?.day || "jour"}</span>
                                                </div>

                                                <span
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                                                        isSelected
                                                            ? "bg-gold-500 text-slate-950 shadow-md shadow-gold-500/30"
                                                            : "bg-slate-800 text-slate-300 group-hover:bg-gold-500 group-hover:text-slate-950"
                                                    }`}
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <FiCheck size={13} strokeWidth={3} />
                                                            <span>{dict?.custom_pack?.selected || "Sélectionné"}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiPlus size={13} />
                                                            <span>{dict?.custom_pack?.select_car || "Ajouter"}</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* STEP 2: EVENT CUSTOMIZATION & CLIENT FORM */}
                <div id="pack-form-section" className="scroll-mt-24">
                    <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-gold-500/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md">
                        
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
                            <span className="w-7 h-7 rounded-lg bg-gold-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                                2
                            </span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {dict?.custom_pack?.step_2_title || "Détails de votre événement & Coordonnées"}
                                </h2>
                                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                                    {dict?.custom_pack?.step_2_desc || "Précisez vos besoins pour obtenir le meilleur tarif de pack sur-mesure."}
                                </p>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {errorMessage && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
                                <FiAlertCircle size={20} className="shrink-0 text-red-400" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* 1. Event Type Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-200 mb-3">
                                {dict?.custom_pack?.event_type || "Type d'événement"}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {eventTypes.map((ev) => {
                                    const isChosen = formData.eventType === ev.title;
                                    const IconComp = ev.icon;
                                    return (
                                        <div
                                            key={ev.id}
                                            onClick={() => setFormData(p => ({ ...p, eventType: ev.title }))}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                                                isChosen
                                                    ? "bg-gold-500/10 border-gold-500 shadow-md shadow-gold-500/10 text-white"
                                                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                                                    isChosen ? "bg-gold-500 text-slate-950 border-gold-400 shadow-sm" : "bg-slate-900 border-slate-800 text-gold-400"
                                                }`}>
                                                    <IconComp size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs sm:text-sm font-bold">{ev.title}</h4>
                                                    {ev.badge && (
                                                        <span className="inline-block mt-0.5 text-[9px] uppercase font-bold text-gold-400 tracking-wider">
                                                            {ev.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Radio-style indicator */}
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ms-3 ${
                                                isChosen ? "border-gold-500" : "border-slate-700"
                                            }`}>
                                                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                                    isChosen ? "bg-gold-500 scale-100" : "bg-transparent scale-0"
                                                }`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Extra VIP Options (Chauffeur & Wedding Decoration) */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-200 mb-3">
                                {dict?.custom_pack?.services_options || "Services & Options VIP"}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Chauffeur */}
                                <div
                                    onClick={() => setFormData(p => ({ ...p, withChauffeur: !p.withChauffeur }))}
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start justify-between gap-4 ${
                                        formData.withChauffeur
                                            ? "bg-gold-500/10 border-gold-500 shadow-md shadow-gold-500/15"
                                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                                            formData.withChauffeur ? "bg-gold-500 text-slate-950 border-gold-400 shadow-sm" : "bg-slate-900 border-slate-800 text-gold-400"
                                        }`}>
                                            <FiUserCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">
                                                {dict?.custom_pack?.with_chauffeur || "Chauffeurs professionnels dédiés"}
                                            </h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {dict?.custom_pack?.with_chauffeur_desc || "Chauffeurs en costume, expérimentés et discrets pour tous vos véhicules."}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Checkbox-style indicator */}
                                    <div className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 mt-0.5 ${
                                        formData.withChauffeur ? "bg-gold-500 border-gold-400 text-slate-950" : "border-slate-700 bg-slate-900"
                                    }`}>
                                        {formData.withChauffeur && <FiCheck size={14} strokeWidth={3} />}
                                    </div>
                                </div>

                                {/* Wedding Decoration */}
                                <div
                                    onClick={() => setFormData(p => ({ ...p, withDecoration: !p.withDecoration }))}
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start justify-between gap-4 ${
                                        formData.withDecoration
                                            ? "bg-gold-500/10 border-gold-500 shadow-md shadow-gold-500/15"
                                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                                            formData.withDecoration ? "bg-gold-500 text-slate-950 border-gold-400 shadow-sm" : "bg-slate-900 border-slate-800 text-gold-400"
                                        }`}>
                                            <FiGift size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">
                                                {dict?.custom_pack?.with_decoration || "Décoration cortège de mariage"}
                                            </h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {dict?.custom_pack?.with_decoration_desc || "Fleurs naturelles ou d'ornement, rubans d'honneur et nœuds de cérémonie."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 mt-0.5 ${
                                        formData.withDecoration ? "bg-gold-500 border-gold-400 text-slate-950" : "border-slate-700 bg-slate-900"
                                    }`}>
                                        {formData.withDecoration && <FiCheck size={14} strokeWidth={3} />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Dates & Wilaya */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <FiCalendar className="text-gold-400" size={14} />
                                    <span>{dict?.custom_pack?.pickup_date || "Date de début"}</span>
                                </label>
                                <input
                                    type="date"
                                    name="pickupDate"
                                    min={todayStr}
                                    value={formData.pickupDate}
                                    onChange={handleFormChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <FiCalendar className="text-gold-400" size={14} />
                                    <span>{dict?.custom_pack?.return_date || "Date de fin"}</span>
                                </label>
                                <input
                                    type="date"
                                    name="returnDate"
                                    min={formData.pickupDate || todayStr}
                                    value={formData.returnDate}
                                    onChange={handleFormChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <FiMapPin className="text-gold-400" size={14} />
                                    <span>{dict?.custom_pack?.wilaya || "Wilaya de livraison"}</span>
                                </label>
                                <select
                                    name="customerCity"
                                    value={formData.customerCity}
                                    onChange={handleFormChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                >
                                    <option value="">{dict?.custom_pack?.select_wilaya || "Sélectionnez votre wilaya"}</option>
                                    {wilayasList.map((w, idx) => (
                                        <option key={idx} value={w} className="bg-slate-900">
                                            {w}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 4. Client Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <FiUser className="text-gold-400" size={14} />
                                    <span>{dict?.custom_pack?.full_name || "Nom et prénom"}</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleFormChange}
                                    placeholder="Ex: Mohamed Benali"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 placeholder-slate-600 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                    <FiPhone className="text-gold-400" size={14} />
                                    <span>{dict?.custom_pack?.phone_number || "Numéro de téléphone (WhatsApp)"}</span>
                                </label>
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleFormChange}
                                    placeholder="05 / 06 / 07..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 placeholder-slate-600 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Special Notes */}
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-slate-300 mb-2">
                                {dict?.custom_pack?.special_notes || "Précisions ou demandes spécifiques (optionnel)"}
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={handleFormChange}
                                placeholder={dict?.custom_pack?.notes_placeholder || "Ex: Heure du cortège, itinéraire souhaité, modèles précis..."}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 placeholder-slate-600 resize-none transition-colors"
                            ></textarea>
                        </div>

                        {/* Pack Live Summary & Calculation */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0c1322] border border-gold-500/40 mb-8">
                            <h3 className="text-base font-bold text-gold-300 mb-4 flex items-center gap-2">
                                <FiAward size={18} className="text-gold-400" />
                                <span>{dict?.custom_pack?.summary_title || "Récapitulatif de votre Pack"}</span>
                            </h3>

                            {selectedCars.length === 0 ? (
                                <p className="text-xs text-slate-400">
                                    {dict?.custom_pack?.no_cars_selected || "Aucun véhicule sélectionné pour l'instant. Cochez les voitures de votre choix ci-dessus."}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {/* List of chosen cars */}
                                    <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-800">
                                        {selectedCars.map((car) => (
                                            <span
                                                key={car.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold"
                                            >
                                                <span>{car.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCarSelection(car.id);
                                                    }}
                                                    className="hover:text-white ms-1 flex items-center justify-center text-slate-400"
                                                    aria-label={`Remove ${car.name}`}
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Financial Breakdown */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-sm">
                                        <span className="text-slate-400">
                                            {selectedCars.length} {dict?.custom_pack?.cars_selected || "voiture(s)"} × {rentalDays} {rentalDays > 1 ? (dict?.custom_pack?.days || "jours") : (dict?.custom_pack?.day || "jour")}
                                        </span>
                                        <div className="text-end">
                                            <div className="text-xs text-slate-400">
                                                {dict?.custom_pack?.estimated_daily || "Journalier indicatif"}: <span className="text-white font-bold">{formatPrice(dailyTotal)}</span>
                                            </div>
                                            <div className="text-xl font-extrabold text-gold-400 mt-0.5">
                                                {formatPrice(estimatedTotal)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Discount notice */}
                                    <div className="pt-2 text-[11px] text-slate-400 leading-relaxed bg-gold-500/5 p-3 rounded-xl border border-gold-500/20 flex items-start gap-2.5">
                                        <FiInfo size={16} className="text-gold-400 shrink-0 mt-0.5" />
                                        <span>{dict?.custom_pack?.quote_notice || "Tarif indicatif. Une remise avantageuse de pack sur-mesure vous sera proposée sur WhatsApp selon la durée et le nombre de véhicules."}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{dict?.custom_pack?.sending || "Envoi en cours..."}</span>
                                </>
                            ) : (
                                <>
                                    <FaWhatsapp size={22} className="text-white shrink-0" />
                                    <span>{dict?.custom_pack?.submit_button || "Valider et Envoyer sur WhatsApp"}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>

            {/* STICKY BOTTOM SELECTION PILL (When cars are selected) */}
            {selectedCars.length > 0 && (
                <div className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-xl w-full animate-slideUp">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-gold-500/60 p-3 sm:p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold-500 text-slate-950 font-extrabold flex items-center justify-center text-base shadow-md">
                                {selectedCars.length}
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white">
                                    {selectedCars.length} {dict?.custom_pack?.cars_selected || "véhicules sélectionnés"}
                                </h4>
                                <p className="text-[11px] text-gold-400 font-semibold">
                                    ~ {formatPrice(dailyTotal)} / {dict?.custom_pack?.day || "jour"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={scrollToForm}
                            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-gold-500/30 flex items-center gap-1.5 transition-all"
                        >
                            <span>Continuer</span>
                            <FiArrowRight className="rtl:rotate-180" size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* SUCCESS CONFIRMATION MODAL */}
            {successModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative bg-slate-900 border-2 border-gold-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl text-white">
                        {/* Success circle with checkmark */}
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                            <FiCheckCircle size={40} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                            {dict?.custom_pack?.success_title || "Demande de Pack Transmise !"}
                        </h3>

                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            {dict?.custom_pack?.success_desc || "Votre demande a été envoyée à notre équipe VIP et sur Telegram. WhatsApp va s'ouvrir pour finaliser les détails avec vous."}
                        </p>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-start text-xs text-slate-300 space-y-1.5 mb-6">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Véhicules sélectionnés:</span>
                                <span className="font-bold text-white">{successModalData.carsCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Estimation totale:</span>
                                <span className="font-bold text-gold-400">{successModalData.total}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href={successModalData.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                            >
                                <FaWhatsapp size={20} />
                                <span>{dict?.custom_pack?.open_whatsapp_manually || "Ouvrir WhatsApp maintenant"}</span>
                            </a>

                            <button
                                type="button"
                                onClick={() => setSuccessModalData(null)}
                                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
                            >
                                {dict?.custom_pack?.close || "Fermer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
