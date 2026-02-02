"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import wilayaCommunes from "@/data/wilaya_communes.json";

// ============================================
// STATIC COLOR CONFIG (base info + fallback images)
// ============================================
const baseColorConfig = {
  green: {
    name: "أخضر",
    hex: "#16A34A",
    tag: "green",
    images: ["embrocraft/products/green_shirt"], // fallback
  },
  black: {
    name: "أسود",
    hex: "#111111",
    tag: "black",
    images: ["embrocraft/products/black_shirt"],
  },
  red: {
    name: "أحمر",
    hex: "#DC2626",
    tag: "red",
    images: ["embrocraft/products/red_shirt"],
  },
  purple: {
    name: "بنفسجي",
    hex: "#8B5CF6",
    tag: "purple",
    images: ["embrocraft/products/purple_shirt"],
  },
};

// Cloudinary cloud name from environment
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Build Cloudinary URL with optimizations
function buildCloudinaryUrl(publicId, cloudName = CLOUD_NAME) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_fill,w_900,ar_4:3/${publicId}`;
}

// ============================================
// PRICING DATA
// ============================================
const pricingData = {
  "01 ~ أدرار": { office: 1100, home: 1400 },
  "02 ~ الشلف": { office: 500, home: 850 },
  "03 ~ الأغواط": { office: 600, home: 1000 },
  "04 ~ أم البواقي": { office: 450, home: 850 },
  "05 ~ باتنة": { office: 450, home: 800 },
  "06 ~ بجاية": { office: 450, home: 750 },
  "07 ~ بسكرة": { office: 550, home: 950 },
  "08 ~ بشار": { office: 650, home: 1100 },
  "09 ~ البليدة": { office: 450, home: 750 },
  "10 ~ البويرة": { office: 450, home: 750 },
  "11 ~ تمنراست": { office: 1000, home: 1600 },
  "12 ~ تبسة": { office: 450, home: 850 },
  "13 ~ تلمسان": { office: 500, home: 900 },
  "14 ~ تيارت": { office: 450, home: 850 },
  "15 ~ تيزي وزو": { office: 450, home: 750 },
  "16 ~ الجزائر": { office: 400, home: 600 },
  "17 ~ الجلفة": { office: 550, home: 950 },
  "18 ~ جيجل": { office: 450, home: 750 },
  "19 ~ سطيف": { office: 450, home: 750 },
  "20 ~ السعيدة": { office: 450, home: 800 },
  "21 ~ سكيكدة": { office: 450, home: 750 },
  "22 ~ سيدي بلعباس": { office: 450, home: 800 },
  "23 ~ عنابة": { office: 450, home: 800 },
  "24 ~ قالمة": { office: 450, home: 750 },
  "25 ~ قسنطينة": { office: 450, home: 750 },
  "26 ~ المدية": { office: 450, home: 800 },
  "27 ~ مستغانم": { office: 450, home: 800 },
  "28 ~ المسيلة": { office: 500, home: 850 },
  "29 ~ معسكر": { office: 450, home: 800 },
  "30 ~ ورقلة": { office: 600, home: 950 },
  "31 ~ وهران": { office: 450, home: 750 },
  "32 ~ البيض": { office: 0, home: 1100 },
  "33 ~ إليزي": { office: 1100, home: 1600 },
  "34 ~ برج بوعريريج": { office: 450, home: 600 },
  "35 ~ بومرداس": { office: 450, home: 750 },
  "36 ~ الطارف": { office: 450, home: 800 },
  "37 ~ تندوف": { office: 1000, home: 1400 },
  "38 ~ تسيمسيلت": { office: 500, home: 800 },
  "39 ~ الوادي(واد سوف)": { office: 600, home: 950 },
  "40 ~ خنشلة": { office: 500, home: 800 },
  "41 ~ سوق اهراس": { office: 450, home: 750 },
  "42 ~ تيبازة": { office: 450, home: 750 },
  "43 ~ ميلة": { office: 200, home: 500 },
  "44 ~ عين الدفلى": { office: 450, home: 750 },
  "45 ~ النعامة": { office: 600, home: 1100 },
  "46 ~ عين تموشنت": { office: 450, home: 800 },
  "47 ~ غرداية": { office: 600, home: 950 },
  "48 ~ غليزان": { office: 450, home: 800 },
  "49 ~ تيميمون": { office: 1400, home: 1400 },
  "50 ~ برج باجي مختار": { office: 1400, home: 1400 },
  "51 ~ أولاد جلال": { office: 550, home: 900 },
  "52 ~ بني عباس": { office: 1000, home: 1000 },
  "53 ~ عين صالح": { office: 1600, home: 1600 },
  "54 ~ عين قزام": { office: 1600, home: 1600 },
  "55 ~ توقرت": { office: 600, home: 950 },
  "56 ~ جانت": { office: 1400, home: 1400 },
  "57 ~ المغير": { office: 950, home: 950 },
  "58 ~ المنيعة": { office: 1000, home: 1000 },
};

// Helper: returns the delivery fee based on Wilaya and delivery method.
function getDeliveryFee(wilaya, deliveryMethod) {
  if (!wilaya || !deliveryMethod) return 0;
  const pricing = pricingData[wilaya];
  if (!pricing) return 0;
  return deliveryMethod === "استلام من المكتب" ? pricing.office : pricing.home;
}

// Helper: formats the price string with " دج".
function formatPrice(price) {
  return price + " دج";
}

// ============================================
// PRODUCT PREVIEW COMPONENT
// Receives colorConfig as a prop for dynamic images
// ============================================
function ProductPreview({
  colorConfig,
  selectedColor,
  setSelectedColor,
  activeImageIndex,
  setActiveImageIndex,
}) {
  const colorKeys = Object.keys(colorConfig);
  const currentColorData = colorConfig[selectedColor];
  const images = currentColorData?.images || [];
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle color change - switch color and reset to first image
  const handleColorChange = useCallback(
    (colorKey) => {
      if (colorKey === selectedColor) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedColor(colorKey);
        setActiveImageIndex(0); // auto jump to first image of that color
        setIsTransitioning(false);
      }, 150);
    },
    [selectedColor, setSelectedColor, setActiveImageIndex]
  );

  // Handle carousel navigation - previous image
  const handlePrevImage = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 150);
  }, [images.length, setActiveImageIndex]);

  // Handle carousel navigation - next image
  const handleNextImage = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 150);
  }, [images.length, setActiveImageIndex]);

  // Handle dot click for image navigation
  const handleDotClick = useCallback(
    (index) => {
      if (index === activeImageIndex) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveImageIndex(index);
        setIsTransitioning(false);
      }, 150);
    },
    [activeImageIndex, setActiveImageIndex]
  );

  return (
    <div className="mb-8" dir="rtl">
      {/* Product Preview Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          {/* Main Image */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"
              }`}
          >
            {images.length > 0 && (
              <Image
                src={buildCloudinaryUrl(images[activeImageIndex])}
                alt={`${currentColorData.name} - صورة ${activeImageIndex + 1}`}
                fill
                className="object-cover"
                priority={activeImageIndex === 0}
                loading={activeImageIndex === 0 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, 600px"
                unoptimized={true} // Fix next/image blank issue with Cloudinary URLs
              />
            )}
          </div>

          {/* Navigation Arrows - only show if more than 1 image */}
          {images.length > 1 && (
            <>
              {/* Right Arrow (Previous in RTL) */}
              <button
                onClick={handlePrevImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                aria-label="الصورة السابقة"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Left Arrow (Next in RTL) */}
              <button
                onClick={handleNextImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                aria-label="الصورة التالية"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter Badge - Format: total/current */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {images.length}/{activeImageIndex + 1}
          </div>
        </div>

        {/* Dot Indicators - only show if more than 1 image */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 py-3 bg-gray-50/50">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeImageIndex
                  ? "bg-indigo-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={`انتقل إلى الصورة ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Color Name Label */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <p className="text-center text-sm text-gray-600">
            اللون المحدد:{" "}
            <span className="font-semibold" style={{ color: currentColorData.hex }}>
              {currentColorData.name}
            </span>
          </p>
        </div>
      </div>

      {/* Color Selector */}
      <div className="mt-5">
        <p className="text-sm font-medium text-gray-700 text-center mb-3">اختر اللون</p>
        <div className="flex justify-center items-center gap-4">
          {colorKeys.map((colorKey) => {
            const color = colorConfig[colorKey];
            const isSelected = colorKey === selectedColor;

            return (
              <button
                key={colorKey}
                onClick={() => handleColorChange(colorKey)}
                className={`relative w-7 h-7 rounded-full transition-all duration-200 ease-out ${isSelected
                  ? "ring-2 ring-green-500 ring-offset-2 ring-offset-white scale-110"
                  : "hover:scale-110 hover:shadow-md"
                  }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
                title={color.name}
              >
                {/* Inner highlight for depth */}
                <span
                  className="absolute inset-0.5 rounded-full opacity-30"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// ORDER FORM COMPONENT
// ============================================
function OrderForm({ selectedImage }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    wilaya: "",
    deliveryMethod: "",
    commune: "",
    shirtColor: "",
    size: "",
  });
  const [showAlert, setShowAlert] = useState(false);

  // Product Preview States - default to green (first color)
  const [selectedColor, setSelectedColor] = useState("green");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dynamic color config state - starts with base config as fallback
  const [dynamicConfig, setDynamicConfig] = useState(baseColorConfig);

  const pathname = usePathname();
  const category = pathname.split("/").pop();

  // ============================================
  // FETCH IMAGES BY CATEGORY AND BUILD DYNAMIC CONFIG
  // ============================================
  useEffect(() => {
    // Build product key and tag from selectedImage
    const productKey = selectedImage?.public_id?.split("/").pop();
    const productTag = productKey ? `product_${productKey}` : null;

    // Skip fetch if no category or productTag
    if (!category || !productTag) {
      return;
    }

    // Fetch all images for current category
    async function fetchAndBuildConfig() {
      try {
        const response = await fetch(`/api/getImagesByCategory/${category}`);
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        const allImages = data.images || [];

        // Build new config by grouping images by color tag
        const newConfig = {};
        const colorTags = ["green", "black", "red", "purple"];

        colorTags.forEach((colorTag) => {
          // Get base config for this color (name, hex, tag, fallback images)
          const base = baseColorConfig[colorTag];

          // Filter images that have BOTH productTag AND colorTag
          const matchingImages = allImages
            .filter(
              (img) =>
                img.tags &&
                img.tags.includes(productTag) &&
                img.tags.includes(colorTag)
            )
            .map((img) => img.public_id);

          // Use matching images if found, otherwise keep fallback
          newConfig[colorTag] = {
            ...base,
            images: matchingImages.length > 0 ? matchingImages : base.images,
          };
        });

        setDynamicConfig(newConfig);
      } catch (error) {
        console.error("Error fetching product images:", error);
        // On error, keep using base config as fallback
        setDynamicConfig(baseColorConfig);
      }
    }

    fetchAndBuildConfig();
  }, [category, selectedImage]);

  // ============================================
  // SYNC SHIRT COLOR WITH SELECTED COLOR
  // Uses dynamicConfig for the color name
  // ============================================
  useEffect(() => {
    const colorName = dynamicConfig[selectedColor]?.name || "";
    setFormData((prev) => ({ ...prev, shirtColor: colorName }));
  }, [selectedColor, dynamicConfig]);

  // Scroll to top when the selected image changes.
  useEffect(() => {
    if (selectedImage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedImage]);

  // Reset commune when Wilaya changes.
  const handleChange = (e) => {
    if (e.target.name === "wilaya") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        commune: "",
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Pricing calculations.
  const basePrice = selectedImage?.tags ? parseInt(selectedImage.tags[0], 10) : 0;
  const deliveryFee = getDeliveryFee(formData.wilaya, formData.deliveryMethod);
  const totalPrice = basePrice + deliveryFee;

  // ============================================
  // BUILD ORDER MESSAGE (reusable for both channels)
  // ============================================
  const buildMessage = () => {
    const messageLines = [
      "طلب حياكة مخصصة:",
      `الاسم الكامل: ${formData.fullName}`,
      `رقم الهاتف: ${formData.phoneNumber}`,
      `الولاية: ${formData.wilaya}`,
      `طريقة الاستلام: ${formData.deliveryMethod}`,
      formData.commune ? `البلدية: ${formData.commune}` : "",
      `السعر الأساسي: ${formatPrice(basePrice)}`,
      `سعر التوصيل: ${formatPrice(deliveryFee)}`,
      `الإجمالي: ${formatPrice(totalPrice)}`,
      `لون القميص: ${formData.shirtColor}`,
      `القياس: ${formData.size}`,
      selectedImage?.tags ? `السعر: ${selectedImage.tags[0]}` : "",
      selectedImage?.secure_url ? `معاينة التصميم: ${selectedImage.secure_url}` : "",
    ];
    return messageLines.filter(Boolean).join("\n");
  };

  // Clear form and show alert after submission
  const clearFormAndNotify = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      wilaya: "",
      deliveryMethod: "",
      commune: "",
      shirtColor: dynamicConfig[selectedColor]?.name || "",
      size: "",
    });
    setShowAlert(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ============================================
  // OPEN WHATSAPP WITH ORDER MESSAGE
  // ============================================
  const openWhatsApp = () => {
    const message = buildMessage();
    const whatsappUrl = `https://wa.me/+213540207506?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    clearFormAndNotify();
  };

  // ============================================
  // OPEN MESSENGER WITH ORDER MESSAGE
  // ============================================
  const openMessenger = () => {
    const message = buildMessage();
    const messengerUrl = `https://www.messenger.com/t/26298992356354729?text=${encodeURIComponent(message)}`;
    window.open(messengerUrl, "_blank");
    clearFormAndNotify();
  };

  // Prevent default form submission (buttons handle submission)
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center bg-gray-100">
      {showAlert && (
        <div className="top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white py-4 px-6 rounded-lg shadow-xl z-50 flex flex-col sm:flex-row items-center justify-between w-full max-w-md sm:max-w-lg relative">
          <button
            onClick={() => setShowAlert(false)}
            className="absolute top-0 right-2 sm:relative sm:top-auto sm:right-auto sm:ml-4 text-2xl font-bold"
            aria-label="Close alert"
          >
            &times;
          </button>
          <span className="text-base pt-2 sm:pt-0 sm:text-lg text-center sm:text-left">
            رسالتك جاهزة في واتساب. يرجى مراجعتها وإرسالها.
          </span>
        </div>
      )}

      {/* Outer container */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-3xl font-bold text-white text-center">
            طلب حياكة مخصصة
          </h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* ========== PRODUCT PREVIEW SECTION ========== */}
          <ProductPreview
            colorConfig={dynamicConfig}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />

          {/* Price Display */}
          {selectedImage?.tags && (
            <div className="text-center py-3 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <p className="text-lg text-gray-700">
                سعر المنتج:{" "}
                <span className="font-bold text-indigo-600" dir="ltr">
                  {selectedImage.tags[0]} DA
                </span>
              </p>
            </div>
          )}

          {/* Order Form - onSubmit only prevents default, buttons handle actual submission */}
          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="أدخل اسمك الكامل"
                value={formData.fullName}
                onChange={handleChange}
                className="block w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="0555555555"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="block w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                dir="ltr"
              />
            </div>

            {/* Wilaya Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الولاية
              </label>
              <select
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                className="block w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">اختر الولاية</option>
                {Object.keys(pricingData).map((wilaya) => (
                  <option key={wilaya} value={wilaya}>
                    {wilaya}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Method Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                طريقة الاستلام
              </label>
              <select
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="block w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">اختر طريقة الاستلام</option>
                <option value="استلام من المكتب">استلام من المكتب</option>
                <option value="توصيل إلى المنزل">توصيل إلى المنزل</option>
              </select>
            </div>

            {/* Commune Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البلدية
              </label>
              <select
                name="commune"
                value={formData.commune}
                onChange={handleChange}
                className="block w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!formData.wilaya}
              >
                <option value="">
                  {formData.wilaya ? "اختر البلدية" : "اختر الولاية أولاً"}
                </option>
                {formData.wilaya &&
                  wilayaCommunes[formData.wilaya]?.map((commune, index) => (
                    <option key={index} value={commune}>
                      {commune}
                    </option>
                  ))}
              </select>
            </div>

            {/* Shirt Color - Read Only (synced with color selector) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                لون القميص
              </label>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-300 px-4 py-3">
                <span
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: dynamicConfig[selectedColor]?.hex }}
                />
                <span className="text-gray-900 font-medium">
                  {formData.shirtColor}
                </span>
              </div>
              <input type="hidden" name="shirtColor" value={formData.shirtColor} />
            </div>

            {/* Shirt Size Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                القياس
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="block w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">اختر القياس</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            {/* Pricing Breakdown */}
            {formData.wilaya && formData.deliveryMethod && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>السعر الأساسي:</span>
                  <span className="font-medium">{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>سعر التوصيل:</span>
                  <span className="font-medium">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>الإجمالي:</span>
                    <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons - Responsive Grid */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Button */}
              <button
                type="submit"
                onClick={openWhatsApp}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-4 px-6 text-lg font-bold text-white shadow-lg transition-all duration-300 ease-out hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {/* WhatsApp Icon */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                واتساب
              </button>

              {/* Messenger Button */}
              <button
                type="submit"
                onClick={openMessenger}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 px-6 text-lg font-bold text-white shadow-lg transition-all duration-300 ease-out hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {/* Messenger Icon */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
                </svg>
                ماسنجر
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;
