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
            label: dict?.admin?.status || "Status",
            render: (value) => {
                // Map DB status to Dictionary values if possible, or use status directly
                // Assuming API returns localized status or we map it here.
                // For now, let's keep the existing status logic but maybe try to translate it?
                // The current API returns "قيد التنفيذ" etc.
                const statusColors = {
                    "قيد التنفيذ": "bg-yellow-100 text-yellow-700",
                    "مكتمل": "bg-emerald-100 text-emerald-700",
                    "جاري الشحن": "bg-blue-100 text-blue-700",
                    "ملغي": "bg-red-100 text-red-700",
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-700"}`}>
                        {value}
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
        <div className="space-y-6 animate-fadeIn">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{dict?.admin?.dashboard}</h1>
                    <p className="text-gray-500 mt-1">{dict?.admin?.welcome_msg || "Welcome back!"}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{dict?.admin?.last_update || "Last update"}:</span>
                    <span className="font-medium text-gray-700">{dict?.admin?.now || "Just now"}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {statsCards.map((stat, idx) => (
                    <StatsCard key={idx} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders - Takes 2 columns */}
                <div className="xl:col-span-2">
                    <DataTable
                        title={dict?.admin?.recent_orders || "Recent Orders"}
                        columns={orderColumns}
                        data={recentOrders}
                        pageSize={5}
                        actions={(row) => (
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gold-600 transition-colors">
                                <FiEye size={16} />
                            </button>
                        )}
                    />
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                    {/* Performance Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">{dict?.admin?.monthly_performance || "Monthly Performance"}</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">{dict?.admin?.completed_orders || "Completed"}</span>
                                    <span className="font-medium text-gray-700">
                                        {stats?.ordersByStatus?.["مكتمل"] || 0}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: "85%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">{dict?.admin?.pending_orders || "Pending"}</span>
                                    <span className="font-medium text-gray-700">
                                        {stats?.ordersByStatus?.["قيد التنفيذ"] || 0}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" style={{ width: "60%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">{dict?.admin?.out_of_stock || "Out of Stock"}</span>
                                    <span className="font-medium text-gray-700">
                                        {stats?.outOfStockProducts || 0}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: "20%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800">{dict?.admin?.top_products || "Top Products"}</h3>
                            <FiTrendingUp className="text-emerald-500" />
                        </div>
                        <div className="space-y-3">
                            {(stats?.topProducts || []).slice(0, 3).map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-700 text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-400">{product.sales} {dict?.admin?.sales || "sales"}</p>
                                    </div>
                                    <span className="text-xs font-medium text-emerald-500">#{idx + 1}</span>
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
