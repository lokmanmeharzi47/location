"use client";
import { useState, useEffect } from "react";
import { FiEye, FiCheck, FiTruck, FiX, FiFilter, FiDownload, FiAlertCircle } from "react-icons/fi";
import DataTable from "@/components/admin/DataTable";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/orders");
            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError("حدث خطأ في جلب الطلبات. تأكد من أن قاعدة البيانات تعمل.");
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();

            if (data.success) {
                fetchOrders();
                if (selectedOrder?.dbId === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("حدث خطأ في تحديث الحالة");
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = filterStatus === "all"
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const orderColumns = [
        { key: "id", label: "رقم الطلب" },
        { key: "customer", label: "العميل" },
        { key: "phone", label: "الهاتف" },
        { key: "product", label: "المنتج" },
        { key: "wilaya", label: "الولاية" },
        { key: "total", label: "المجموع" },
        {
            key: "status",
            label: "الحالة",
            render: (value) => {
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
        { key: "date", label: "التاريخ" },
    ];

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
                        onClick={fetchOrders}
                        className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
                    <p className="text-gray-500 mt-1">عرض وإدارة جميع طلبات العملاء</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <FiDownload size={18} />
                        <span>تحديث</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                        <FiFilter size={16} />
                        تصفية:
                    </span>
                    {["all", "قيد التنفيذ", "جاري الشحن", "مكتمل", "ملغي"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === status
                                ? "bg-gold-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {status === "all" ? "الكل" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <DataTable
                title={`الطلبات (${filteredOrders.length})`}
                columns={orderColumns}
                data={filteredOrders}
                pageSize={10}
                actions={(row) => (
                    <>
                        <button
                            onClick={() => setSelectedOrder(row)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gold-600 transition-colors"
                            title="عرض التفاصيل"
                        >
                            <FiEye size={16} />
                        </button>
                        {row.status === "قيد التنفيذ" && (
                            <button
                                onClick={() => updateOrderStatus(row.dbId, "جاري الشحن")}
                                disabled={updating}
                                className="p-2 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                                title="شحن الطلب"
                            >
                                <FiTruck size={16} />
                            </button>
                        )}
                        {row.status === "جاري الشحن" && (
                            <button
                                onClick={() => updateOrderStatus(row.dbId, "مكتمل")}
                                disabled={updating}
                                className="p-2 hover:bg-emerald-50 rounded-lg text-gray-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                title="تأكيد التسليم"
                            >
                                <FiCheck size={16} />
                            </button>
                        )}
                    </>
                )}
            />

            {filteredOrders.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">لا توجد طلبات في هذه الفئة</p>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg animate-fadeIn">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">تفاصيل الطلب {selectedOrder.id}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">العميل</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.customer}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">الهاتف</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">المنتج</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.product}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">اللون</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.color}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">المقاس</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.size}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">الولاية</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.wilaya}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">المجموع</p>
                                    <p className="font-bold text-gold-600 text-lg">{selectedOrder.total}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">التاريخ</p>
                                    <p className="font-medium text-gray-800">{selectedOrder.date}</p>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">تحديث الحالة</p>
                                <div className="flex flex-wrap gap-2">
                                    {["قيد التنفيذ", "جاري الشحن", "مكتمل", "ملغي"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(selectedOrder.dbId, status)}
                                            disabled={updating || selectedOrder.status === status}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${selectedOrder.status === status
                                                    ? "bg-gold-500 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
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
