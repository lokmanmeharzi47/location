"use client";
import { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

export default function CarFilter({ onFilterChange, dict, initialMinPrice = 0, initialMaxPrice = 50000 }) {
    const [filters, setFilters] = useState({
        search: "",
        category: "all",
        transmission: "all",
        minPrice: initialMinPrice,
        maxPrice: initialMaxPrice,
    });

    // Use dictionary for category labels, falling back to English keys if dict is missing
    const categories = [
        { value: "economy", label: dict?.cars_page?.categories_list?.economy || "Economy" },
        { value: "luxury", label: dict?.cars_page?.categories_list?.luxury || "Luxury" },
        { value: "wedding", label: dict?.cars_page?.categories_list?.wedding || "Wedding" },
        { value: "suv", label: dict?.cars_page?.categories_list?.suv || "SUV" },
        { value: "sport", label: dict?.cars_page?.categories_list?.sport || "Sport" }
    ];

    const transmissions = [
        { value: "Automatique", label: dict?.cars_page?.transmission_auto || "Automatic" },
        { value: "Manuelle", label: dict?.cars_page?.transmission_manual || "Manual" }
    ];

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
                <FaFilter className="text-gold-500" />
                <h2 className="text-xl font-bold text-white">{dict?.cars_page?.filter_title || "Filter Search"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="space-y-2">
                    <label className="text-sm text-slate-400">{dict?.cars_page?.search_label || "Car Name"}</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={dict?.cars_page?.search_placeholder || "Mercedes, Audi..."}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-gold-500 transition-colors"
                            value={filters.search}
                            onChange={(e) => handleChange("search", e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-3.5 text-slate-500" />
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm text-slate-400">{dict?.cars_page?.category_label || "Category"}</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-gold-500 appearance-none cursor-pointer"
                        value={filters.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                    >
                        <option value="all">{dict?.cars_page?.all || "All"}</option>
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                {/* Transmission */}
                <div className="space-y-2">
                    <label className="text-sm text-slate-400">{dict?.cars_page?.transmission_label || "Transmission"}</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-gold-500 appearance-none cursor-pointer"
                        value={filters.transmission}
                        onChange={(e) => handleChange("transmission", e.target.value)}
                    >
                        <option value="all">{dict?.cars_page?.all || "All"}</option>
                        {transmissions.map((trans) => (
                            <option key={trans.value} value={trans.value}>{trans.label}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>{dict?.cars_page?.price_range_label || "Price Range"}</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">{dict?.cars_page?.price_min || "Min"}</span>
                            <input
                                type="number"
                                min="0"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 pl-8 text-white text-sm focus:outline-none focus:border-gold-500 appearance-none"
                                value={filters.minPrice}
                                onChange={(e) => handleChange("minPrice", Number(e.target.value))}
                            />
                        </div>
                        <span className="text-slate-500">-</span>
                        <div className="relative w-full">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">{dict?.cars_page?.price_max || "Max"}</span>
                            <input
                                type="number"
                                min="0"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 pl-8 text-white text-sm focus:outline-none focus:border-gold-500 appearance-none"
                                value={filters.maxPrice}
                                onChange={(e) => handleChange("maxPrice", Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
