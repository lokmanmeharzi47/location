"use client";
import { useState } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiEye } from "react-icons/fi";
import DataTable from "@/components/admin/DataTable";

const customers = [
    { id: 1, name: "أحمد محمد", email: "ahmed@email.com", phone: "0555123456", wilaya: "الجزائر", orders: 5, totalSpent: "22,500 د.ج", lastOrder: "2026-01-28" },
    { id: 2, name: "سارة علي", email: "sara@email.com", phone: "0666234567", wilaya: "وهران", orders: 3, totalSpent: "18,400 د.ج", lastOrder: "2026-01-27" },
    { id: 3, name: "محمد خالد", email: "mohamed@email.com", phone: "0777345678", wilaya: "قسنطينة", orders: 7, totalSpent: "35,600 د.ج", lastOrder: "2026-01-27" },
    { id: 4, name: "فاطمة حسن", email: "fatima@email.com", phone: "0555456789", wilaya: "عنابة", orders: 2, totalSpent: "9,400 د.ج", lastOrder: "2026-01-26" },
    { id: 5, name: "يوسف أمين", email: "youssef@email.com", phone: "0666567890", wilaya: "سطيف", orders: 4, totalSpent: "19,800 د.ج", lastOrder: "2026-01-26" },
    { id: 6, name: "ليلى سعيد", email: "leila@email.com", phone: "0777678901", wilaya: "بجاية", orders: 1, totalSpent: "7,900 د.ج", lastOrder: "2026-01-25" },
    { id: 7, name: "كريم بن عمر", email: "karim@email.com", phone: "0555789012", wilaya: "تلمسان", orders: 6, totalSpent: "28,200 د.ج", lastOrder: "2026-01-25" },
    { id: 8, name: "هدى محمود", email: "houda@email.com", phone: "0666890123", wilaya: "البليدة", orders: 8, totalSpent: "42,500 د.ج", lastOrder: "2026-01-24" },
];

const customerColumns = [
    {
        key: "name",
        label: "العميل",
        render: (value, row) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {value.charAt(0)}
                </div>
                <div>
                    <p className="font-medium text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{row.email}</p>
                </div>
            </div>
        )
    },
    { key: "phone", label: "الهاتف" },
    { key: "wilaya", label: "الولاية" },
    {
        key: "orders",
        label: "الطلبات",
        render: (value) => (
            <span className="px-3 py-1 bg-gold-50 text-gold-600 rounded-full text-sm font-medium">
                {value} طلبات
            </span>
        )
    },
    { key: "totalSpent", label: "إجمالي الإنفاق" },
    { key: "lastOrder", label: "آخر طلب" },
];

export default function CustomersPage() {
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Stats
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
    const avgOrders = (totalOrders / totalCustomers).toFixed(1);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">العملاء</h1>
                    <p className="text-gray-500 mt-1">عرض وإدارة بيانات العملاء</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
                            <FiUser size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي العملاء</p>
                            <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                            <FiShoppingBag size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                            <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                            <FiShoppingBag size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">متوسط الطلبات/عميل</p>
                            <p className="text-2xl font-bold text-gray-800">{avgOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <DataTable
                title="قائمة العملاء"
                columns={customerColumns}
                data={customers}
                pageSize={10}
                actions={(row) => (
                    <button
                        onClick={() => setSelectedCustomer(row)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gold-600 transition-colors"
                        title="عرض التفاصيل"
                    >
                        <FiEye size={16} />
                    </button>
                )}
            />

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md animate-fadeIn">
                        <div className="p-6 bg-gradient-to-br from-gold-400 to-gold-600 rounded-t-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gold-600 font-bold text-2xl">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div className="text-white">
                                    <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                                    <p className="text-gold-100">{selectedCustomer.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <FiPhone size={18} />
                                <span>{selectedCustomer.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <FiMapPin size={18} />
                                <span>{selectedCustomer.wilaya}</span>
                            </div>
                            <hr />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-gold-600">{selectedCustomer.orders}</p>
                                    <p className="text-sm text-gray-500">طلبات</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-lg font-bold text-emerald-600">{selectedCustomer.totalSpent}</p>
                                    <p className="text-sm text-gray-500">إجمالي الإنفاق</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 text-center">
                                آخر طلب: {selectedCustomer.lastOrder}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
