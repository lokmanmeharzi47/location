"use client";
import { useState, useEffect, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image_path: "",
        href: "",
        display_order: 0,
        is_active: true,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/categories");
            const data = await response.json();

            if (data.success) {
                setCategories(data.categories);
            } else {
                setError(data.message);
            }
        } catch {
            setError("حدث خطأ في جلب الفئات. تأكد من أن قاعدة البيانات تعمل.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });
            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, image_path: data.url }));
                setImagePreview(data.url);
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في رفع الصورة");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            alert("اسم الفئة مطلوب");
            return;
        }

        setSaving(true);
        try {
            const url = editCategory ? `/api/categories/${editCategory.id}` : "/api/categories";
            const method = editCategory ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                resetForm();
                fetchCategories();
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في حفظ الفئة");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data.success) {
                fetchCategories();
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في حذف الفئة");
        }
    };

    const toggleActive = async (category) => {
        try {
            const response = await fetch(`/api/categories/${category.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...category, is_active: !category.isActive }),
            });
            const data = await response.json();
            if (data.success) {
                fetchCategories();
            }
        } catch { }
    };

    const openEditModal = (category) => {
        setEditCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            image_path: category.image || "",
            href: category.href || "",
            display_order: category.displayOrder || 0,
            is_active: category.isActive !== false,
        });
        setImagePreview(category.image && !category.image.includes("placeholder") ? category.image : null);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            image_path: "",
            href: "",
            display_order: 0,
            is_active: true,
        });
        setImagePreview(null);
        setEditCategory(null);
    };

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
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <FiAlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-red-700 font-medium">خطأ في الاتصال</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchCategories}
                        className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-medium transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة الفئات</h1>
                    <p className="text-gray-500 mt-1">إضافة وتعديل وحذف فئات المنتجات</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium shadow-lg shadow-gold-500/20"
                >
                    <FiPlus size={18} />
                    <span>إضافة فئة</span>
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`group bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${category.isActive ? 'border-cream-200' : 'border-gray-200 opacity-60'
                            }`}
                    >
                        {/* Category Image */}
                        <div className="relative h-48 bg-gradient-to-br from-cream-100 to-blush-50 overflow-hidden">
                            {category.image && !category.image.includes("placeholder") ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FiImage size={48} className="text-gray-300" />
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 left-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.isActive
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {category.isActive ? "نشط" : "مخفي"}
                                </span>
                            </div>

                            {/* Order Badge */}
                            <div className="absolute top-3 right-3">
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-white/90 text-gold-600 shadow-sm">
                                    #{category.displayOrder || 0}
                                </span>
                            </div>
                        </div>

                        {/* Category Info */}
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-brown-dark mb-2 group-hover:text-gold-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-brown-light line-clamp-2 mb-4 leading-relaxed">
                                {category.description || "لا يوجد وصف"}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cream-100 text-brown-dark rounded-xl hover:bg-cream-200 transition-colors text-sm font-medium"
                                >
                                    <FiEdit2 size={14} />
                                    تعديل
                                </button>
                                <button
                                    onClick={() => toggleActive(category)}
                                    className={`px-3 py-2 rounded-xl transition-colors ${category.isActive
                                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                        }`}
                                    title={category.isActive ? "إخفاء" : "إظهار"}
                                >
                                    {category.isActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="px-3 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl border border-cream-200">
                    <FiImage size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد فئات بعد</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-2.5 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium"
                    >
                        إضافة أول فئة
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-cream-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الفئة *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50"
                                    placeholder="مثال: فساتين سهرة"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50 resize-none"
                                    placeholder="وصف قصير للفئة يظهر في الموقع..."
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الرابط</label>
                                <input
                                    type="text"
                                    value={formData.href}
                                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50"
                                    placeholder="/design/category-name"
                                    dir="ltr"
                                />
                            </div>

                            {/* Order & Active */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب العرض</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-full px-4 py-3 rounded-xl font-medium transition-colors ${formData.is_active
                                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                : "bg-gray-100 text-gray-600 border border-gray-200"
                                            }`}
                                    >
                                        {formData.is_active ? "نشط ✓" : "مخفي"}
                                    </button>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">صورة الفئة</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-cream-300 rounded-xl p-6 text-center hover:border-gold-400 transition-colors cursor-pointer bg-cream-50/50"
                                >
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500 mx-auto"></div>
                                    ) : imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded-xl shadow-sm" />
                                    ) : (
                                        <>
                                            <FiUpload size={32} className="mx-auto text-cream-400 mb-2" />
                                            <p className="text-sm text-gray-500">اضغط لرفع صورة</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG حتى 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-cream-100 flex gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium disabled:opacity-50 shadow-lg shadow-gold-500/20"
                            >
                                {saving ? "جاري الحفظ..." : editCategory ? "حفظ التعديلات" : "إضافة الفئة"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
