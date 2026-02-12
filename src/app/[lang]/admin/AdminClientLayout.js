"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import TopHeader from "@/components/admin/TopHeader";

export default function AdminClientLayout({ children, lang, dict }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    // Check if we are on the login page (e.g. /ar/admin or /en/admin)
    // Adjust logic if your login page path differs
    const isLoginPage = pathname === `/${lang}/admin` || pathname === `/admin`;

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 font-tajawal ltr:flex-row-reverse" dir="ltr">
            {/* Sidebar - Fixed height via parent */}
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                dict={dict}
                lang={lang}
            />

            {/* Main Content wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-all duration-300">

                {/* Header */}
                <TopHeader
                    collapsed={collapsed}
                    onMenuClick={() => setCollapsed(!collapsed)}
                />

                {/* Page Content - This is the only scrolling area */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
