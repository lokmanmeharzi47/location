"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayoutClient({ children, dict, lang }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        const auth = sessionStorage.getItem("adminAuth");
        if (!auth) {
            router.push(`/${lang}/admin`);
        } else {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [router, lang]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">{dict?.booking?.loading || "Loading..."}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Return content directly (Layout is handled by AdminClientLayout)
    return <>{children}</>;
}
