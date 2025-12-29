import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ClothingCategoriesCard = ({ title, href, imageSrc, description }) => {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-cream-200 hover:border-blush-200"
    >
      {/* Image Container */}
      <div className="relative h-64 bg-gradient-to-br from-blush-100 to-cream-100 overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          style={{ objectFit: 'contain' }}
          className="transition-transform duration-500 ease-out group-hover:scale-110 p-4"
          priority
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blush-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title with gold accent */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-brown-dark group-hover:text-blush-600 transition-colors duration-300">
            {title}
          </h3>
          <div className="w-8 h-0.5 bg-gold-400 rounded-full"></div>
        </div>

        {/* Description */}
        <p className="text-brown-light text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-blush-500 font-medium text-sm group-hover:text-blush-600 transition-colors">
            اكتشفي المزيد
          </span>
          <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center group-hover:bg-blush-500 transition-all duration-300">
            <svg
              className="w-4 h-4 text-blush-500 group-hover:text-white transition-colors duration-300 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClothingCategoriesCard;
