"use client";
import { useState } from 'react';
import { FaInstagram, FaEnvelope, FaPhone, FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Footer({ dict, lang }) {
    const [twitch, setTwitch] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleContactClick = () => {
        setTwitch(true);
        setTimeout(() => setTwitch(false), 1000);
    };

    const scrollToSection = (sectionId) => {
        const section = document.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleNavigateAndScroll = (sectionId) => {
        if (pathname === "/") {
            scrollToSection(sectionId);
        } else {
            router.push("/");
            setTimeout(() => {
                scrollToSection(sectionId);
            }, 800);
        }
    };

    return (
        <footer className="bg-gradient-to-b from-slate-800 to-slate-900 pt-16 pb-8 text-white" id="footer">
            <div className="max-w-6xl mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="text-center md:text-right">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Image
                                src="/images/logo.jpg"
                                alt="CarRent"
                                width={100}
                                height={100}
                                className="rounded-full w-20 h-20 border-3 border-gold-400 shadow-lg"
                                priority
                            />
                            <div>
                                <h3 className="text-xl font-bold text-white">{dict?.header?.rights || 'CarRent'}</h3>
                                <p className="text-gold-400 text-sm">{dict?.header?.subtitle}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                            {dict?.footer?.description}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center">
                        <h4 className="text-lg font-bold text-white mb-6">{dict?.footer?.quick_links}</h4>
                        <nav className="flex flex-col gap-3">
                            <Link
                                href={`/${lang}`}
                                className="text-slate-300 hover:text-gold-400 transition-colors duration-300"
                            >
                                {dict?.header?.home}
                            </Link>
                            <Link
                                href={`/${lang}/design`}
                                className="text-slate-300 hover:text-gold-400 transition-colors duration-300"
                            >
                                {dict?.header?.cars}
                            </Link>
                            <button
                                onClick={() => handleNavigateAndScroll("#car-categories")}
                                className="text-slate-300 hover:text-gold-400 transition-colors duration-300"
                            >
                                {dict?.header?.categories}
                            </button>
                            <button
                                onClick={handleContactClick}
                                className="text-slate-300 hover:text-gold-400 transition-colors duration-300"
                            >
                                {dict?.header?.contact}
                            </button>
                        </nav>
                    </div>

                    {/* Contact & Social */}
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold text-white mb-6">{dict?.footer?.contact_us}</h4>
                        <div className="flex justify-center md:justify-start gap-4 mb-6">
                            <Link
                                href="https://www.instagram.com/carrent_dz/"
                                aria-label="Instagram"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-700 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:bg-gold-500 transition-all duration-300 group"
                            >
                                <FaInstagram className={`text-white h-5 w-5 transition-colors ${twitch ? 'icon-twitch' : ''}`} />
                            </Link>
                            <Link
                                href="mailto:meharzibr@gmail.com"
                                aria-label="Email"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-700 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:bg-gold-500 transition-all duration-300 group"
                            >
                                <FaEnvelope className={`text-white h-5 w-5 transition-colors ${twitch ? 'icon-twitch' : ''}`} />
                            </Link>
                            <Link
                                href="tel:0791084298"
                                aria-label="Phone"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-700 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:bg-gold-500 transition-all duration-300 group"
                            >
                                <FaPhone className={`text-white h-5 w-5 transition-colors ${twitch ? 'icon-twitch' : ''}`} />
                            </Link>
                            <Link
                                href="https://wa.me/213540207506"
                                aria-label="WhatsApp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-700 shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:bg-gold-500 transition-all duration-300 group"
                            >
                                <FaWhatsapp className={`text-white h-5 w-5 transition-colors ${twitch ? 'icon-twitch' : ''}`} />
                            </Link>
                        </div>
                        <p className="text-slate-300 text-sm">
                            {dict?.footer?.contact_text}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mb-8"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400 text-center md:text-right">
                        © {new Date().getFullYear()} {dict?.header?.rights}. {dict?.footer?.rights}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">{dict?.footer?.made_by}</span>
                        <svg className="w-4 h-4 text-gold-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="text-sm text-slate-400">{dict?.footer?.in_algeria}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}