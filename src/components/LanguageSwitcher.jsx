'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi';

const languages = [
    { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
];

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    // Derive current language safely from pathname
    const currentLangCode = pathname?.split('/')[1] || 'ar';
    const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSwitch = (lang) => {
        if (!pathname) return;

        // Prevent unnecessary reload
        if (lang.code === currentLangCode) {
            setIsOpen(false);
            return;
        }

        const segments = pathname.split('/');
        segments[1] = lang.code;
        const newPath = segments.join('/');

        // Instant UX update
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;

        setIsOpen(false);
        router.push(newPath);
    };

    // Hover handlers with delay to prevent flickering
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300); // 300ms delay before closing
    };

    return (
        <div
            className="relative z-50"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300
                    ${isOpen
                        ? 'bg-slate-800 border-gold-500/50 text-gold-400 shadow-lg shadow-gold-500/20'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-gold-500/30 hover:text-white'
                    }
                `}
                aria-label="Select Language"
                aria-expanded={isOpen}
            >
                <FiGlobe className={`w-4 h-4 ${isOpen ? 'text-gold-400' : 'text-slate-400'}`} />
                <span className="text-sm font-medium uppercase tracking-wider">{currentLang.code}</span>
                <FiChevronDown
                    className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold-400' : 'text-slate-400'}`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`
                    absolute top-full mt-2 right-0 w-48 
                    bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl 
                    transform transition-all duration-300 origin-top-right overflow-hidden
                    ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0 visible'
                        : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                    }
                `}
            >
                <div className="p-1">
                    {languages.map((lang) => {
                        const isActive = currentLangCode === lang.code;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleSwitch(lang)}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200
                                    ${isActive
                                        ? 'bg-gold-500/10 text-gold-400 font-medium'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                    }
                                `}
                                dir={lang.dir} // Ensure correct text alignment per item
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg leading-none filter drop-shadow-sm">{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </div>
                                {isActive && <FiCheck className="w-4 h-4 text-gold-400" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

