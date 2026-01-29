"use client";
import { useState, useEffect, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiAlertCircle } from "react-icons/fi";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        stock: 0,
        image_path: "",
        description: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch both products and categories
            const [productsRes, categoriesRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories?active=true")
            ]);

            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();

            if (productsData.success) {
                setProducts(productsData.products);
            } else {
                setError(productsData.message);
            }

            if (categoriesData.success) {
                setCategories(categoriesData.categories);
            }
        } catch {
            setError("حدث خطأ في جلب البيانات. تأكد من أن قاعدة البيانات تعمل.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter(p =>
            p.categoryId === parseInt(selectedCategory) ||
            p.category === selectedCategory
        );

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
        if (!formData.name || !formData.category_id || !formData.price) {
            alert("الاسم والفئة والسعر مطلوبون");
            return;
        }

        setSaving(true);
        try {
            const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
            const method = editProduct ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price.toString().replace(/,/g, "")),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في حفظ المنتج");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data.success) {
                fetchData();
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في حذف المنتج");
        }
    };

    const openEditModal = (product) => {
        setEditProduct(product);
        setFormData({
            name: product.name,
            category_id: product.categoryId?.toString() || "",
            price: product.priceRaw?.toString() || "",
            stock: product.stock,
            image_path: product.image || "",
            description: product.description || "",
        });
        setImagePreview(product.image && !product.image.includes("placeholder") ? product.image : null);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category_id: "",
            price: "",
            stock: 0,
            image_path: "",
            description: "",
        });
        setImagePreview(null);
        setEditProduct(null);
    };

    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.name || "غير محدد";
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <FiAlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-red-700 font-medium">خطأ في الاتصال</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h1>
                    <p className="text-gray-500 mt-1">إضافة وتعديل وحذف المنتجات</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium shadow-lg shadow-gold-500/20"
                >
                    <FiPlus size={18} />
                    <span>إضافة منتج</span>
                </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === "all"
                            ? "bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                            : "bg-white text-gray-600 hover:bg-cream-100 border border-cream-200"
                        }`}
                >
                    الكل ({products.length})
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id.toString())}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === cat.id.toString()
                                ? "bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                                : "bg-white text-gray-600 hover:bg-cream-100 border border-cream-200"
                            }`}
                    >
                        {cat.name} ({products.filter(p => p.categoryId === cat.id).length})
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                    >
                        {/* Product Image */}
                        <div className="relative h-48 bg-gradient-to-br from-cream-100 to-blush-50 flex items-center justify-center overflow-hidden">
                            {product.image && !product.image.includes("placeholder") ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <FiImage size={48} className="text-cream-300" />
                            )}
                            <div className="absolute top-3 left-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === "متوفر"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {product.status}
                                </span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                            <p className="text-xs text-gold-600 font-medium mb-1">{product.category}</p>
                            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-gold-600 transition-colors">{product.name}</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-gold-600">{product.price}</p>
                                <p className="text-sm text-gray-500">المخزون: {product.stock}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-5 pt-0 flex gap-2">
                            <button
                                onClick={() => openEditModal(product)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-cream-100 text-brown-dark rounded-xl hover:bg-cream-200 transition-colors text-sm font-medium"
                            >
                                <FiEdit2 size={14} />
                                تعديل
                            </button>
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl border border-cream-200">
                    <FiImage size={48} className="mx-auto text-cream-300 mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد منتجات في هذه الفئة</p>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-cream-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50"
                                    placeholder="أدخل اسم المنتج"
                                />
                            </div>

                            {/* Category Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50 appearance-none cursor-pointer"
                                >
                                    <option value="">اختر الفئة</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">لا توجد فئات. أضف فئات أولاً من قسم الفئات.</p>
                                )}
                            </div>

                            {/* Price & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر (د.ج) *</label>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">المخزون</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-cream-50/50 resize-none"
                                    placeholder="وصف مختصر للمنتج..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج</label>
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
                                {saving ? "جاري الحفظ..." : editProduct ? "حفظ التعديلات" : "إضافة المنتج"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
