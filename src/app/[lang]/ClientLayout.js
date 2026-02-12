"use client";
import { useState, useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Loading from "../../components/Loading";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children, lang, dict }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Wait for client-side mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <SpeedInsights />
            {!mounted || isLoading ? (
                <Loading />
            ) : (
                <>
                    {!pathname?.includes('/admin') && <Header lang={lang} dict={dict} />}
                    <main>{children}</main>
                    {!pathname?.includes('/admin') && <Footer lang={lang} dict={dict} />}
                </>
            )}
        </>
    );
}
