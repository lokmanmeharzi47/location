"use client";
import { useState } from "react";
import {
    FiUser,
    FiLock,
    FiShoppingBag,
    FiGlobe,
    FiBell,
    FiSave,
    FiCheck
} from "react-icons/fi";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs = [
        { id: "profile", label: "الملف الشخصي", icon: FiUser },
        { id: "store", label: "المتجر", icon: FiShoppingBag },
        { id: "password", label: "كلمة المرور", icon: FiLock },
        { id: "notifications", label: "الإشعارات", icon: FiBell },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
                <p className="text-gray-500 mt-1">إدارة إعدادات حسابك والمتجر</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 text-right transition-colors ${activeTab === tab.id
                                    ? "bg-gold-50 text-gold-600 border-r-4 border-gold-500"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <tab.icon size={18} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Profile Settings */}
                        {activeTab === "profile" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">الملف الشخصي</h2>

                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                        م
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors text-sm font-medium">
                                            تغيير الصورة
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">JPG, PNG أو GIF. الحد الأقصى 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            defaultValue="المسؤول"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            defaultValue="admin@embrocraft.dz"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                        <input
                                            type="tel"
                                            defaultValue="0555 123 456"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الولاية</label>
                                        <input
                                            type="text"
                                            defaultValue="الجزائر"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Store Settings */}
                        {activeTab === "store" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات المتجر</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
                                        <input
                                            type="text"
                                            defaultValue="Boutique Rital"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">وصف المتجر</label>
                                        <textarea
                                            rows={3}
                                            defaultValue="متجر متخصص في الملابس المطرزة يدوياً بأجود الخامات"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">العملة</label>
                                            <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400">
                                                <option>دينار جزائري (د.ج)</option>
                                                <option>دولار أمريكي ($)</option>
                                                <option>يورو (€)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">سعر التوصيل الافتراضي</label>
                                            <input
                                                type="text"
                                                defaultValue="600"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password Settings */}
                        {activeTab === "password" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">تغيير كلمة المرور</h2>

                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            placeholder="أدخل كلمة المرور الحالية"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            placeholder="أدخل كلمة المرور الجديدة"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400"
                                            placeholder="أعد إدخال كلمة المرور الجديدة"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات الإشعارات</h2>

                                <div className="space-y-4">
                                    {[
                                        { label: "إشعارات الطلبات الجديدة", desc: "تلقي إشعار عند استلام طلب جديد", default: true },
                                        { label: "إشعارات البريد الإلكتروني", desc: "تلقي تحديثات عبر البريد الإلكتروني", default: true },
                                        { label: "إشعارات التقييمات", desc: "تلقي إشعار عند تقييم منتج", default: false },
                                        { label: "إشعارات المخزون", desc: "تنبيه عند انخفاض المخزون", default: true },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.label}</p>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${saved
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gold-500 text-white hover:bg-gold-600"
                                    }`}
                            >
                                {saved ? (
                                    <>
                                        <FiCheck size={18} />
                                        تم الحفظ
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={18} />
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
