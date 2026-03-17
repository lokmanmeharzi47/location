"use client";
import { useState } from "react";
import { FiBell, FiUser, FiSearch, FiMenu } from "react-icons/fi";

export default function TopHeader({ collapsed, onMenuClick }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifications = [
        { id: 1, text: "طلب جديد #1234", time: "منذ 5 دقائق", unread: true },
        { id: 2, text: "تم شحن الطلب #1230", time: "منذ ساعة", unread: true },
        { id: 3, text: "مراجعة جديدة من عميل", time: "منذ ساعتين", unread: false },
    ];

    return (
        <header className="h-20 bg-white shadow-sm border-b border-gray-100 z-20 shrink-0">
            <div className="h-full flex items-center justify-between px-6">
                {/* Search Bar */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    >
                        <FiMenu size={24} />
                    </button>
                    <div className="relative hidden md:block">
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="البحث..."
                            className="w-72 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowProfile(false);
                            }}
                            className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FiBell size={20} className="text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-800">الإشعارات</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${notif.unread ? "bg-gold-50/50" : ""
                                                }`}
                                        >
                                            <p className="text-sm text-gray-800">{notif.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center border-t border-gray-100">
                                    <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                                        عرض جميع الإشعارات
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowProfile(!showProfile);
                                setShowNotifications(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
                                <FiUser size={18} className="text-white" />
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-gray-800">المسؤول</p>
                                <p className="text-xs text-gray-500">admin@carrent.dz</p>
                            </div>
                        </button>

                        {showProfile && (
                            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gold-50 to-cream-50">
                                    <p className="font-bold text-gray-800">المسؤول</p>
                                    <p className="text-sm text-gray-500">admin@carrent.dz</p>
                                </div>
                                <div className="p-2">
                                    <button className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                                        الملف الشخصي
                                    </button>
                                    <button className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                                        الإعدادات
                                    </button>
                                    <hr className="my-2" />
                                    <button
                                        onClick={() => {
                                            sessionStorage.removeItem("adminAuth");
                                            window.location.href = "/admin";
                                        }}
                                        className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                                    >
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
