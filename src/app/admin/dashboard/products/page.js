"use client";
import { useState, useEffect, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiAlertCircle, FiTrendingUp } from "react-icons/fi";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [saving, setSaving] = useState(false);
    const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);
    const variantFileInputRefs = useRef({});

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        stock: 1,
        description: "",
        variants: [{ colorName: "", colorCode: "#C9A86C", images: [], stock: 0 }],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

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

    const filteredProducts = (selectedCategory === "all"
        ? products
        : products.filter(p =>
            p.categoryId === parseInt(selectedCategory) ||
            p.category === selectedCategory
        )).sort((a, b) => {
            if (sortOrder === "sales") {
                return (b.sales || 0) - (a.sales || 0);
            }
            return 0;
        });

    // Handle image upload for a specific variant
    const handleVariantImageUpload = async (e, variantIndex) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingVariantIndex(variantIndex);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });
            const data = await response.json();

            if (data.success) {
                setFormData(prev => {
                    const newVariants = [...prev.variants];
                    newVariants[variantIndex] = {
                        ...newVariants[variantIndex],
                        images: [...(newVariants[variantIndex].images || []), data.url]
                    };
                    return { ...prev, variants: newVariants };
                });
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في رفع الصورة");
        } finally {
            setUploadingVariantIndex(null);
        }
    };

    // Remove an image from a variant
    const handleRemoveImage = (variantIndex, imageIndex) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[variantIndex] = {
                ...newVariants[variantIndex],
                images: newVariants[variantIndex].images.filter((_, i) => i !== imageIndex)
            };
            return { ...prev, variants: newVariants };
        });
    };

    // Add a new variant
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { colorName: "", colorCode: "#C9A86C", images: [], stock: 0 }]
        }));
    };

    // Remove a variant
    const removeVariant = (index) => {
        if (formData.variants.length <= 1) {
            alert("يجب أن يكون هناك متغير واحد على الأقل");
            return;
        }
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    // Update variant field
    const updateVariant = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[index] = { ...newVariants[index], [field]: value };
            return { ...prev, variants: newVariants };
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category_id || !formData.price) {
            alert("الاسم والفئة والسعر مطلوبون");
            return;
        }

        // Validate variants
        const validVariants = formData.variants.filter(v => v.colorCode && v.colorName);
        if (validVariants.length === 0) {
            alert("يجب إضافة متغير واحد على الأقل مع اسم اللون");
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
                    variants: validVariants,
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

        // Convert product data to form format
        let variants = product.variants || [];
        if (variants.length === 0) {
            // Create variants from legacy data
            if (product.colors && product.colors.length > 0) {
                variants = product.colors.map((color, i) => ({
                    colorName: color,
                    colorCode: color,
                    images: i === 0 && product.image ? [product.image] : [],
                    stock: 0
                }));
            } else {
                variants = [{
                    colorName: "الافتراضي",
                    colorCode: "#C9A86C",
                    images: product.image && !product.image.includes("placeholder") ? [product.image] : [],
                    stock: product.stock || 0
                }];
            }
        }

        setFormData({
            name: product.name,
            category_id: product.categoryId?.toString() || "",
            price: product.priceRaw?.toString() || "",
            stock: product.stock,
            description: product.description || "",
            variants: variants,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category_id: "",
            price: "",
            stock: 1,
            description: "",
            variants: [{ colorName: "", colorCode: "#C9A86C", images: [], stock: 0 }],
        });
        setEditProduct(null);
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

            {/* Filters & Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                <div className="flex bg-white rounded-xl border border-cream-200 p-1 flex-shrink-0">
                    <button
                        onClick={() => setSortOrder("newest")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortOrder === "newest" ? "bg-cream-100 text-brown-dark" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        الأحدث
                    </button>
                    <button
                        onClick={() => setSortOrder("sales")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${sortOrder === "sales" ? "bg-gold-100 text-gold-700" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <FiTrendingUp size={14} />
                        الأكثر مبيعاً
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                    >
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
                            <div className="absolute top-3 inset-x-3 flex items-start justify-between">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === "متوفر"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {product.status}
                                </span>
                                {/* Color swatches preview */}
                                {product.variants && product.variants.length > 1 && (
                                    <div className="flex -space-x-1">
                                        {product.variants.slice(0, 4).map((v, i) => (
                                            <div
                                                key={i}
                                                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: v.colorCode }}
                                            />
                                        ))}
                                        {product.variants.length > 4 && (
                                            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                +{product.variants.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            <p className="text-xs text-gold-600 font-medium mb-1">{product.category}</p>
                            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-gold-600 transition-colors">{product.name}</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-gold-600">{product.price}</p>
                                <p className="text-sm text-gray-500">المخزون: {product.stock}</p>
                            </div>
                        </div>

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
                    <div className="bg-white rounded-2xl w-full max-w-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">المخزون الإجمالي</label>
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

                            {/* Color Variants Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">متغيرات الألوان</label>
                                    <button
                                        type="button"
                                        onClick={addVariant}
                                        className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
                                    >
                                        <FiPlus size={14} />
                                        إضافة لون
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.variants.map((variant, variantIndex) => (
                                        <div
                                            key={variantIndex}
                                            className="border border-cream-200 rounded-xl p-4 bg-cream-50/30"
                                        >
                                            {/* Variant Header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Color Picker */}
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={variant.colorCode}
                                                        onChange={(e) => updateVariant(variantIndex, 'colorCode', e.target.value)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <div
                                                        className="w-10 h-10 rounded-lg shadow-md border-2 border-white cursor-pointer"
                                                        style={{ backgroundColor: variant.colorCode }}
                                                    />
                                                </div>

                                                {/* Color Name */}
                                                <input
                                                    type="text"
                                                    value={variant.colorName}
                                                    onChange={(e) => updateVariant(variantIndex, 'colorName', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                                                    placeholder="اسم اللون (مثال: أحمر)"
                                                />

                                                {/* Remove Variant */}
                                                {formData.variants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(variantIndex)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="حذف هذا اللون"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Variant Images */}
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">صور هذا اللون:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Existing Images */}
                                                    {variant.images?.map((img, imgIndex) => (
                                                        <div key={imgIndex} className="relative group">
                                                            <img
                                                                src={img}
                                                                alt={`${variant.colorName} ${imgIndex + 1}`}
                                                                className="w-16 h-16 object-cover rounded-lg border border-cream-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(variantIndex, imgIndex)}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <FiX size={12} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* Add Image Button */}
                                                    <input
                                                        type="file"
                                                        ref={el => variantFileInputRefs.current[variantIndex] = el}
                                                        onChange={(e) => handleVariantImageUpload(e, variantIndex)}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => variantFileInputRefs.current[variantIndex]?.click()}
                                                        disabled={uploadingVariantIndex === variantIndex}
                                                        className="w-16 h-16 border-2 border-dashed border-cream-300 rounded-lg flex items-center justify-center hover:border-gold-400 transition-colors cursor-pointer bg-white"
                                                    >
                                                        {uploadingVariantIndex === variantIndex ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-500"></div>
                                                        ) : (
                                                            <FiUpload size={20} className="text-cream-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-400 mt-2">
                                    كل لون يمكن أن يحتوي على صور متعددة. انقر على الصورة لحذفها.
                                </p>
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
