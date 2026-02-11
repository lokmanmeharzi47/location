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

const menuItems = [
  { icon: FiHome, label: "الرئيسية", href: "/admin/dashboard" },
  { icon: FiGrid, label: "الفئات", href: "/admin/dashboard/categories" },
  { icon: FiPackage, label: "السيارات", href: "/admin/dashboard/products" },
  { icon: FiFileText, label: "الحجوزات", href: "/admin/dashboard/orders" },
  { icon: FiUsers, label: "العملاء", href: "/admin/dashboard/customers" },
  { icon: FiSettings, label: "الإعدادات", href: "/admin/dashboard/settings" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    window.location.href = "/admin";
  };

  return (
    <aside
      className={`fixed right-0 top-0 h-screen bg-gradient-to-b from-brown-dark to-brown-medium text-white transition-all duration-300 z-50 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-white/10">
        {collapsed ? (
          <span className="text-2xl font-bold text-gold-400">C</span>
        ) : (
          <h1 className="text-xl font-bold text-gold-400">Luxury location Admin</h1>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-24 bg-gold-500 text-white p-1.5 rounded-full shadow-lg hover:bg-gold-600 transition-colors"
      >
        {collapsed ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
      </button>

      {/* Navigation Menu */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? "bg-gold-500 text-white shadow-lg"
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                    } ${collapsed ? "justify-center" : "justify-start"}`}
                >
                  <item.icon size={20} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-8 left-0 right-0 px-4">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 ${collapsed ? "justify-center" : "justify-start"
            }`}
        >
          <FiLogOut size={20} />
          {!collapsed && <span className="font-medium">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
