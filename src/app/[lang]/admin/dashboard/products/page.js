"use client";
import { useState, useEffect, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiUpload, FiAlertCircle } from "react-icons/fi";

export default function CarsPage() {
    const [cars, setCars] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editCar, setEditCar] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        category_id: "",
        price_per_day: "",
        fuel_type: "Essence",
        transmission: "Automatique",
        seats: 5,
        doors: 4,
        air_conditioning: true,
        description: "",
        images: [], // Multiple images support
    });

    // Helper to format price
    // Helper to format price
    const formatPrice = (priceStr) => {
        const price = Number(priceStr);
        if (isNaN(price)) return priceStr;

        if (price > 100) {
            const formatted = price / 10000;
            return `${formatted.toLocaleString('en-US', { maximumFractionDigits: 10 })} مليون`;
        }

        return `${price.toLocaleString('en-US', { maximumFractionDigits: 10 })} مليون`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [carsRes, categoriesRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories?active=true")
            ]);

            const carsData = await carsRes.json();
            const categoriesData = await categoriesRes.json();

            if (carsData.success) {
                setCars(carsData.products || []);
            } else {
                setError(carsData.message);
            }

            if (categoriesData.success) {
                setCategories(categoriesData.categories || []);
            }
        } catch {
            setError("حدث خطأ في جلب البيانات. تأكد من أن قاعدة البيانات تعمل.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCars = selectedCategory === "all"
        ? cars
        : cars.filter(c =>
            c.categoryId === parseInt(selectedCategory) ||
            c.category === selectedCategory
        );

    // Handle image upload - supports multiple images
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });
            const data = await response.json();

            if (data.success) {
                // Add new image to the images array
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, data.url]
                }));
            } else {
                alert(data.message);
            }
        } catch {
            alert("حدث خطأ في رفع الصورة");
        } finally {
            setUploading(false);
        }
    };

    // Remove image from array
    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category_id || !formData.price_per_day) {
            alert("الاسم والفئة والسعر مطلوبون");
            return;
        }

        setSaving(true);
        try {
            const url = editCar ? `/api/products/${editCar.id}` : "/api/products";
            const method = editCar ? "PUT" : "POST";

            // Map form data to API format - using variants for images
            const apiData = {
                name: formData.name,
                category_id: formData.category_id,
                price: parseFloat(formData.price_per_day.toString().replace(/,/g, "")),
                stock: 1,
                description: `${formData.brand} ${formData.model} ${formData.year} | ${formData.fuel_type} | ${formData.transmission} | ${formData.seats} مقاعد`,
                variants: [{
                    colorName: "Default",
                    colorCode: "#333333",
                    images: formData.images, // Multiple images here
                    stock: 1
                }],
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData),
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
            alert("حدث خطأ في حفظ السيارة");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذه السيارة؟")) return;

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
            alert("حدث خطأ في حذف السيارة");
        }
    };

    const openEditModal = (car) => {
        setEditCar(car);

        // Get images from variants
        let carImages = [];
        if (car.variants && car.variants.length > 0 && car.variants[0].images) {
            carImages = car.variants[0].images;
        } else if (car.image) {
            carImages = [car.image];
        }

        // Parse description for car details
        const descParts = (car.description || "").split(" | ");

        setFormData({
            name: car.name,
            brand: descParts[0]?.split(" ")[0] || "",
            model: descParts[0]?.split(" ")[1] || "",
            year: parseInt(descParts[0]?.split(" ")[2]) || new Date().getFullYear(),
            category_id: car.categoryId?.toString() || "",
            price_per_day: car.priceRaw?.toString() || "",
            fuel_type: descParts[1] || "Essence",
            transmission: descParts[2] || "Automatique",
            seats: parseInt(descParts[3]) || 5,
            doors: 4,
            air_conditioning: true,
            description: car.description || "",
            images: carImages,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            category_id: "",
            price_per_day: "",
            fuel_type: "Essence",
            transmission: "Automatique",
            seats: 5,
            doors: 4,
            air_conditioning: true,
            description: "",
            images: [],
        });
        setEditCar(null);
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
                    <h1 className="text-2xl font-bold text-gray-800">إدارة السيارات</h1>
                    <p className="text-gray-500 mt-1">إضافة وتعديل وحذف السيارات</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors font-medium shadow-lg shadow-gold-500/20"
                >
                    <FiPlus size={18} />
                    <span>إضافة سيارة</span>
                </button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === "all"
                        ? "bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                        : "bg-white text-gray-600 hover:bg-cream-100 border border-cream-200"
                        }`}
                >
                    الكل ({cars.length})
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
                        {cat.name} ({cars.filter(c => c.categoryId === cat.id).length})
                    </button>
                ))}
            </div>

            {/* Cars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCars.map((car) => (
                    <div
                        key={car.id}
                        className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                            {car.image && !car.image.includes("placeholder") ? (
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <FiImage size={48} className="text-slate-300" />
                            )}
                            <div className="absolute top-3 right-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${car.status === "متوفر"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {car.status === "متوفر" ? "متاحة" : "محجوزة"}
                                </span>
                            </div>
                            {/* Image count badge */}
                            {car.variants && car.variants[0]?.images?.length > 1 && (
                                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                    {car.variants[0].images.length} صور
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <p className="text-xs text-gold-600 font-medium mb-1">{car.category}</p>
                            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-gold-600 transition-colors">{car.name}</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-gold-600">{formatPrice(car.price)}/يوم</p>
                            </div>
                        </div>

                        <div className="p-5 pt-0 flex gap-2">
                            <button
                                onClick={() => openEditModal(car)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                            >
                                <FiEdit2 size={14} />
                                تعديل
                            </button>
                            <button
                                onClick={() => handleDelete(car.id)}
                                className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {
                filteredCars.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                        <FiImage size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-gray-500 mb-4">لا توجد سيارات في هذه الفئة</p>
                    </div>
                )
            }

            {/* Add/Edit Car Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editCar ? "تعديل السيارة" : "إضافة سيارة جديدة"}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Car Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم السيارة *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                        placeholder="مثال: Toyota Corolla 2024"
                                    />
                                </div>



                                {/* Year & Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                            min="2000"
                                            max="2030"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                        >
                                            <option value="">اختر الفئة</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Price per Day */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر لليوم (million) *</label>
                                    <input
                                        type="text"
                                        value={formData.price_per_day}
                                        onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                        placeholder="1"
                                    />
                                </div>

                                {/* Fuel & Transmission */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوقود</label>
                                        <select
                                            value={formData.fuel_type}
                                            onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                        >
                                            <option value="Essence">بنزين</option>
                                            <option value="Diesel">ديزل</option>
                                            <option value="Électrique">كهربائي</option>
                                            <option value="Hybride">هجين</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ناقل الحركة</label>
                                        <select
                                            value={formData.transmission}
                                            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                        >
                                            <option value="Automatique">أوتوماتيك</option>
                                            <option value="Manuelle">يدوي</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Seats */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">عدد المقاعد</label>
                                    <input
                                        type="number"
                                        value={formData.seats}
                                        onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-slate-50/50"
                                        min="2"
                                        max="12"
                                    />
                                </div>

                                {/* Car Images - Multiple */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        صور السيارة
                                        <span className="text-xs text-gray-400 mr-2">({formData.images.length} صورة)</span>
                                    </label>

                                    <div className="flex flex-wrap gap-3">
                                        {/* Existing Images */}
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`صورة ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 bg-gold-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                        رئيسية
                                                    </span>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add Image Button */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-gold-400 transition-colors cursor-pointer bg-slate-50"
                                        >
                                            {uploading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-500"></div>
                                            ) : (
                                                <>
                                                    <FiUpload size={20} className="text-slate-400 mb-1" />
                                                    <span className="text-xs text-slate-400">إضافة</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2">
                                        الصورة الأولى ستكون الصورة الرئيسية. يمكنك إضافة عدة صور.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
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
                                    {saving ? "جاري الحفظ..." : editCar ? "حفظ التعديلات" : "إضافة السيارة"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
