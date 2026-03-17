"use client";
import { useState, useEffect } from "react";
import { FiShoppingBag, FiDollarSign, FiUsers, FiPackage, FiEye, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import StatsCard from "@/components/admin/StatsCard";
import DataTable from "@/components/admin/DataTable";

export default function DashboardClient({ dict }) {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch stats
            const statsResponse = await fetch("/api/stats");
            const statsData = await statsResponse.json();

            if (statsData.success) {
                setStats(statsData.stats);
                setRecentOrders(statsData.stats.recentOrders || []);
            } else {
                setError(statsData.message);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(dict?.common?.error || "Error fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const orderColumns = [
        { key: "id", label: dict?.admin?.order_id || "Order ID" },
        { key: "customer", label: dict?.admin?.customer || "Customer" },
        { key: "product", label: dict?.admin?.product || "Product" },
        { key: "total", label: dict?.admin?.total || "Total" },
        {
            key: "status",
            label: dict?.admin?.status_label || "Status",
            render: (value) => {
                // Map API status (English) to display colors
                const statusColors = {
                    "pending": "bg-yellow-100 text-yellow-700",
                    "completed": "bg-emerald-100 text-emerald-700",
                    "shipped": "bg-blue-100 text-blue-700",
                    "cancelled": "bg-red-100 text-red-700",
                };

                // Get localized status text or fallback to value
                const localizedStatus = dict?.admin?.status?.[value] || value;

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-700"}`}>
                        {localizedStatus}
                    </span>
                );
            },
        },
        { key: "date", label: dict?.admin?.date || "Date" },
    ];

    // Fallback stats for when database is not connected
    const fallbackCards = [
        { title: dict?.admin?.total_orders || "Total Orders", value: "0", change: 0, changeType: "increase", icon: FiShoppingBag, color: "gold" },
        { title: dict?.admin?.revenue || "Revenue", value: "0", change: 0, changeType: "increase", icon: FiDollarSign, color: "green" },
        { title: dict?.admin?.new_customers || "New Customers", value: "0", change: 0, changeType: "increase", icon: FiUsers, color: "purple" },
        { title: dict?.admin?.products || "Products", value: "0", change: 0, changeType: "increase", icon: FiPackage, color: "blush" },
        { title: dict?.admin?.sales || "Sales", value: "0", change: 0, changeType: "increase", icon: FiTrendingUp, color: "green" },
    ];

    const statsCards = stats ? [
        { title: dict?.admin?.total_orders, value: stats.totalOrders?.value || "0", change: stats.totalOrders?.change || 0, changeType: stats.totalOrders?.changeType || "increase", icon: FiShoppingBag, color: "gold" },
        { title: dict?.admin?.revenue, value: stats.totalRevenue?.value || "0", change: stats.totalRevenue?.change || 0, changeType: stats.totalRevenue?.changeType || "increase", icon: FiDollarSign, color: "green" },
        { title: dict?.admin?.new_customers, value: "89", change: 5, changeType: "decrease", icon: FiUsers, color: "purple" },
        { title: dict?.admin?.products, value: stats.totalProducts?.value || "0", change: stats.totalProducts?.change || 0, changeType: stats.totalProducts?.changeType || "increase", icon: FiPackage, color: "blush" },
        { title: dict?.admin?.sales, value: stats.totalSales?.value || "0", change: stats.totalSales?.change || 0, changeType: stats.totalSales?.changeType || "increase", icon: FiTrendingUp, color: "green" },
    ] : fallbackCards;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-8">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <FiAlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-red-700 font-medium">خطأ في الاتصال</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        {dict?.common?.retry || "Retry"}
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{dict?.admin?.dashboard}</h1>
                    <p className="text-gray-500 mt-2 text-lg">{dict?.admin?.welcome_msg || "مرحباً بك في لوحة التحكم"}</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{dict?.admin?.last_update || "آخر تحديث"}:</span>
                    <span className="font-bold text-gray-700 font-mono text-base">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Stats Cards - 4 Columns as requested */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statsCards.slice(0, 4).map((stat, idx) => (
                    <StatsCard key={idx} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Orders - Takes 2 columns */}
                <div className="xl:col-span-2 space-y-8">
                    <DataTable
                        title={dict?.admin?.recent_orders || "أحدث الطلبات"}
                        columns={orderColumns}
                        data={recentOrders}
                        pageSize={5}
                        actions={(row) => (
                            <button className="p-2 hover:bg-gold-50 rounded-lg text-gray-400 hover:text-gold-600 transition-all hover:scale-110">
                                <FiEye size={20} />
                            </button>
                        )}
                    />

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">النشاط الأخير</h3>
                            <button className="text-sm text-gold-600 font-medium hover:text-gold-700">عرض الكل</button>
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500">
                                        <FiAlertCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-medium text-sm">تم تسجيل طلب جديد #25{i}9</p>
                                        <p className="text-gray-400 text-xs mt-1">منذ {i * 15 + 5} دقيقة</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats & Charts */}
                <div className="space-y-8">
                    {/* Monthly Performance Chart (Visual Representation) */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{dict?.admin?.monthly_performance || "الأداء الشهري"}</h3>
                                <p className="text-gray-400 text-sm mt-1">إحصائيات المبيعات</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                <FiTrendingUp size={20} />
                            </div>
                        </div>

                        <div className="flex items-end gap-3 h-48 justify-between px-2">
                            {/* Simple CSS Chart Bars */}
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden h-full flex items-end transition-all">
                                        <div
                                            style={{ height: `${h}%` }}
                                            className={`w-full ${h > 80 ? 'bg-gold-500' : 'bg-slate-800'} rounded-t-lg transition-all duration-500 group-hover:opacity-80 relative`}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {h}% مبيعات
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6">حالة الطلبات</h3>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">{dict?.admin?.completed_orders || "مكتمل"}</span>
                                    <span className="font-bold text-gray-900">
                                        {stats?.ordersByStatus?.["مكتمل"] || 0}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: "85%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">{dict?.admin?.pending_orders || "قيد التنفيذ"}</span>
                                    <span className="font-bold text-gray-900">
                                        {stats?.ordersByStatus?.["قيد التنفيذ"] || 0}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)]" style={{ width: "60%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">{dict?.admin?.out_of_stock || "نفذت الكمية"}</span>
                                    <span className="font-bold text-gray-900">
                                        {stats?.outOfStockProducts || 0}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" style={{ width: "20%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">{dict?.admin?.top_products || "الأكثر مبيعاً"}</h3>
                        </div>
                        <div className="space-y-4">
                            {(stats?.topProducts || []).slice(0, 3).map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-gold-100 text-gold-600' :
                                                idx === 1 ? 'bg-gray-200 text-gray-600' :
                                                    'bg-orange-100 text-orange-600'
                                            }`}>
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{product.sales} {dict?.admin?.sales || "مبيعات"}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-600">
                                        {product.revenue || "$0"}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.topProducts || stats.topProducts.length === 0) && (
                                <p className="text-gray-400 text-sm text-center py-4">{dict?.admin?.no_data || "No data"}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
