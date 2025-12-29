"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import wilayaCommunes from "@/data/wilaya_communes.json"; // Ensure the path is correct

// Pricing data for each Wilaya
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
  const customLoader = ({ src }) => src;
  const pathname = usePathname();
  const category = pathname.split("/").pop();

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

  // Handle form submission.
  const handleSubmit = (e) => {
    e.preventDefault();
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
      selectedImage.tags ? `السعر: ${selectedImage.tags[0]}` : "",
      `معاينة التصميم: ${selectedImage.secure_url}`,
    ];
    const message = messageLines.filter(Boolean).join("\n");
    const whatsappUrl = `https://wa.me/+213540207506?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Clear form.
    setFormData({
      fullName: "",
      phoneNumber: "",
      wilaya: "",
      deliveryMethod: "",
      commune: "",
      shirtColor: "",
      size: "",
    });
    setShowAlert(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center bg-gray-100  ">
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

      {/* Outer container is now wider */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-3xl font-bold text-white text-center">
            طلب حياكة مخصصة
          </h2>
        </div>

        <div className="p-8 space-y-6">
          {/* Product Preview */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-full max-w-xs overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <Image
                className="object-cover w-full h-auto"
                loader={customLoader}
                unoptimized
                src={selectedImage.secure_url}
                alt={`${category} ${selectedImage.public_id}`}
                width={500}
                height={500}
                placeholder="blur"
                blurDataURL="/images/loader.png"
              />
            </div>
            {selectedImage.tags && (
              <div className="mt-4 text-center">
                <p className="text-base text-gray-600">
                  السعر: <span dir="ltr">{selectedImage.tags[0]} DA</span>
                </p>
              </div>
            )}
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="الاسم الكامل"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="0555555555"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Wilaya Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                الولاية
              </label>
              <select
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700 text-right">
                طريقة الاستلام
              </label>
              <select
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">اختر طريقة الاستلام</option>
                <option value="استلام من المكتب">استلام من المكتب</option>
                <option value="توصيل إلى المنزل">توصيل إلى المنزل</option>
              </select>
            </div>

            {/* Commune Dropdown (Always shown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                البلدية
              </label>
              <select
                name="commune"
                value={formData.commune}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Shirt Color Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                لون القميص
              </label>
              <input
                name="shirtColor"
                value={formData.shirtColor}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />


            </div>

            {/* Shirt Size Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right">
                القياس
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">اختر القياس</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>

            {/* Pricing Breakdown */}
            {(formData.wilaya && formData.deliveryMethod) && (
              <div className="text-center my-4">
                <p className="text-base text-gray-700">
                  السعر الأساسي: <span className="font-bold">{formatPrice(basePrice)}</span>
                </p>
                <p className="text-base text-gray-700">
                  سعر التوصيل: <span className="font-bold">{formatPrice(deliveryFee)}</span>
                </p>
                <p className="text-base text-gray-700">
                  الإجمالي: <span className="font-bold">{formatPrice(totalPrice)}</span>
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                className="w-full rounded-md bg-indigo-600 py-3 px-6 text-base font-semibold text-white shadow-lg transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                إرسال الطلب عبر واتساب
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;
