import React from 'react';
import Card from './ClothingCategoriesCard';

export default function ClothingCategories() {
  const clothingCategories = [
    {
      title: "فساتين",
      href: "/design/dresses",
      imageSrc: "/images/t-shirtcat.jpg",
      description: "اكتشفي تشكيلتنا الراقية من الفساتين الأنيقة، مصممة لتبرز جمالك في كل مناسبة.",
    },
    {
      title: "بلايز نسائية",
      href: "/design/tops",
      imageSrc: "/images/hoodiecat.jpg",
      description: "بلايز عصرية بتصاميم أنثوية ناعمة، مثالية للإطلالات اليومية والمميزة.",
    },
    {
      title: "أطقم نسائية",
      href: "/design/sets",
      imageSrc: "/images/sweet-shirtcat.jpg",
      description: "أطقم متناسقة تجمع بين الأناقة والراحة، لإطلالة متكاملة تعكس ذوقك الرفيع.",
    },
    {
      title: "كنزات ناعمة",
      href: "/design/sweaters",
      imageSrc: "/images/sweet-shirtct.jpg",
      description: "كنزات دافئة بملمس ناعم وتطريز أنيق، لأيام الشتاء الباردة.",
    },
  ];

  return (
    <section className="py-20 px-4" id="clothing-categories">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium text-sm tracking-wider mb-2 block">تشكيلتنا المميزة</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brown-dark mb-4">
            تصفحي الفئات
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blush-400 via-gold-400 to-blush-400 mx-auto rounded-full"></div>
          <p className="text-brown-light mt-6 max-w-2xl mx-auto text-lg">
            اكتشفي مجموعتنا الحصرية من الملابس النسائية المصممة بعناية وذوق راقٍ
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {clothingCategories.map((category, index) => (
            <Card
              key={index}
              title={category.title}
              href={category.href}
              imageSrc={category.imageSrc}
              description={category.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
