"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiGrid,
  FiPackage,
  FiFileText,
  FiUsers,
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
  FiLogOut,
} from "react-icons/fi";

export default function Sidebar({ collapsed, setCollapsed, dict, lang }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: FiHome, label: dict?.admin?.dashboard || "Dashboard", href: `/${lang}/admin/dashboard` },
    { icon: FiGrid, label: dict?.admin?.categories || "Categories", href: `/${lang}/admin/dashboard/categories` },
    { icon: FiPackage, label: dict?.admin?.cars || "Cars", href: `/${lang}/admin/dashboard/products` },
    { icon: FiFileText, label: dict?.admin?.orders || "Orders", href: `/${lang}/admin/dashboard/orders` },
    { icon: FiUsers, label: dict?.admin?.customers || "Customers", href: `/${lang}/admin/dashboard/customers` },
    { icon: FiSettings, label: dict?.admin?.settings || "Settings", href: `/${lang}/admin/dashboard/settings` },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    window.location.href = `/${lang}/admin`;
  };

  return (
    <aside
      className={`relative h-full flex-shrink-0 bg-slate-900 border-l border-white/5 text-white transition-all duration-300 z-30 ${collapsed ? "w-20" : "w-72"
        } shadow-2xl flex flex-col`}
    >
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-95 -z-10"></div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b border-white/5 mx-4 shrink-0">
          {collapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="text-xl font-bold text-white">L</span>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">LUXURY</h1>
              <p className="text-[10px] text-gold-400 font-medium tracking-[0.2em] mt-0.5">RENTAL ADMIN</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-3 top-24 bg-gold-500 text-white p-1 rounded-full shadow-lg hover:bg-gold-400 transition-all hover:scale-110 border-2 border-slate-900 z-50"
        >
          {collapsed ? <FiChevronLeft size={12} /> : <FiChevronRight size={12} />}
        </button>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${isActive
                      ? "bg-gradient-to-r from-gold-500/20 to-transparent border-r-2 border-gold-500 text-gold-400"
                      : "hover:bg-white/5 text-slate-400 hover:text-white"
                      } ${collapsed ? "justify-center" : "justify-start"}`}
                    title={collapsed ? item.label : ""}
                  >
                    <item.icon
                      size={20}
                      className={`transition-colors duration-300 flex-shrink-0 ${isActive ? "text-gold-400" : "group-hover:text-gold-400"
                        }`}
                    />
                    {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 ${collapsed ? "justify-center" : "justify-start"
              }`}
            title={collapsed ? (dict?.admin?.logout || "تسجيل الخروج") : ""}
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{dict?.admin?.logout || "تسجيل الخروج"}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
