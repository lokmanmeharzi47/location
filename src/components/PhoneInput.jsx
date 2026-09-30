"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export const COUNTRIES = [
    { code: "DZ", name: "Algérie", dialCode: "+213", flag: "🇩🇿" },
    { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
    { code: "TN", name: "Tunisie", dialCode: "+216", flag: "🇹🇳" },
    { code: "MA", name: "Maroc", dialCode: "+212", flag: "🇲🇦" },
    { code: "AE", name: "Émirats Arabes Unis", dialCode: "+971", flag: "🇦🇪" },
    { code: "ES", name: "Espagne", dialCode: "+34", flag: "🇪🇸" },
    { code: "IT", name: "Italie", dialCode: "+39", flag: "🇮🇹" },
    { code: "GB", name: "Royaume-Uni", dialCode: "+44", flag: "🇬🇧" },
    { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
    { code: "US", name: "États-Unis", dialCode: "+1", flag: "🇺🇸" },
    { code: "TR", name: "Turquie", dialCode: "+90", flag: "🇹🇷" },
    { code: "SA", name: "Arabie Saoudite", dialCode: "+966", flag: "🇸🇦" },
    { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
];

export default function PhoneInput({
    value = "",
    onChange,
    defaultCountry = "DZ",
    placeholder = "05 59 30 96 80",
    required = false,
    disabled = false,
    className = "",
    id,
    name = "phoneNumber",
}) {
    const [selectedCountryCode, setSelectedCountryCode] = useState(defaultCountry);
    const [localNumber, setLocalNumber] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedCountry = useMemo(() => {
        return COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
    }, [selectedCountryCode]);

    // Parse initial value if provided with dialCode
    useEffect(() => {
        if (!value) {
            setLocalNumber("");
            return;
        }

        // Check if value already starts with any country dial code
        const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
        if (matched) {
            setSelectedCountryCode(matched.code);
            const remaining = value.substring(matched.dialCode.length).trim();
            setLocalNumber(remaining);
        } else {
            // Raw local number
            setLocalNumber(value);
        }
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNumberChange = (e) => {
        let val = e.target.value;
        // Clean characters: keep numbers and spaces
        val = val.replace(/[^\d\s]/g, "");

        // If user typed leading 0 with dial code selected, strip redundant leading 0
        let cleanLocal = val.trim();
        if (cleanLocal.startsWith("0")) {
            cleanLocal = cleanLocal.substring(1);
        }

        setLocalNumber(val);

        if (onChange) {
            const fullNumber = cleanLocal ? `${selectedCountry.dialCode} ${cleanLocal}` : "";
            onChange(fullNumber, {
                country: selectedCountry,
                dialCode: selectedCountry.dialCode,
                localNumber: cleanLocal,
                rawInput: val,
            });
        }
    };

    const handleSelectCountry = (country) => {
        setSelectedCountryCode(country.code);
        setDropdownOpen(false);

        let cleanLocal = localNumber.trim();
        if (cleanLocal.startsWith("0")) {
            cleanLocal = cleanLocal.substring(1);
        }

        if (onChange) {
            const fullNumber = cleanLocal ? `${country.dialCode} ${cleanLocal}` : "";
            onChange(fullNumber, {
                country,
                dialCode: country.dialCode,
                localNumber: cleanLocal,
                rawInput: localNumber,
            });
        }
    };

    return (
        <div className={`relative flex items-center ${className}`} dir="ltr" ref={dropdownRef}>
            {/* Country Selector Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/80 border border-r-0 border-slate-700 rounded-l-xl text-white text-xs font-semibold focus:outline-none focus:border-gold-400 transition-colors shrink-0"
                title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
            >
                <span className="text-base leading-none">{selectedCountry.flag}</span>
                <span className="text-slate-300 font-mono tracking-tight">{selectedCountry.dialCode}</span>
                <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Country Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 backdrop-blur-xl">
                    {COUNTRIES.map((c) => (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => handleSelectCountry(c)}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-slate-800 transition-colors ${c.code === selectedCountry.code ? "bg-gold-500/10 text-gold-400 font-bold" : "text-slate-200"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                            </span>
                            <span className="font-mono text-slate-400 text-[11px] ml-2 shrink-0">{c.dialCode}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Local Phone Input */}
            <input
                type="tel"
                id={id}
                name={name}
                value={localNumber}
                onChange={handleNumberChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-r-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 text-sm font-medium tracking-wide"
            />
        </div>
    );
}
