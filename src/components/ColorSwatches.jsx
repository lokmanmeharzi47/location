"use client";
import { FiCheck } from "react-icons/fi";

/**
 * ColorSwatches - A color selection component for product variants
 * 
 * Features:
 * - Circular color swatches using actual color codes
 * - Selected state with border and shadow/ring
 * - Tooltip showing color name on hover
 * - Click handler to notify parent of color change
 */
export default function ColorSwatches({
    variants = [],
    selectedIndex = 0,
    onColorChange,
    size = "md", // "sm" | "md" | "lg"
}) {
    // Size configurations
    const sizes = {
        sm: { swatch: "w-6 h-6", checkSize: 12 },
        md: { swatch: "w-8 h-8", checkSize: 14 },
        lg: { swatch: "w-10 h-10", checkSize: 16 },
    };
    const sizeConfig = sizes[size] || sizes.md;

    if (!variants || variants.length === 0) {
        return null;
    }

    // Don't show if only one variant
    if (variants.length === 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-xs text-brown-light/70 ml-2">الألوان:</span>
            <div className="flex gap-2">
                {variants.map((variant, index) => {
                    const isSelected = index === selectedIndex;
                    const hasImages = variant.images && variant.images.length > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => onColorChange?.(index)}
                            className={`${sizeConfig.swatch} rounded-full relative transition-all duration-200 
                                ${isSelected
                                    ? 'ring-2 ring-offset-2 ring-gold-500 scale-110 shadow-lg'
                                    : 'hover:scale-105 shadow-md hover:shadow-lg'
                                }
                                ${!hasImages ? 'opacity-60' : ''}
                            `}
                            style={{
                                backgroundColor: variant.colorCode || '#C9A86C',
                                borderColor: isLightColor(variant.colorCode) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                                borderWidth: '2px',
                                borderStyle: 'solid'
                            }}
                            title={variant.colorName || variant.colorCode}
                            aria-label={`اختر ${variant.colorName || variant.colorCode}`}
                            aria-pressed={isSelected}
                        >
                            {/* Selected checkmark */}
                            {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <FiCheck
                                        size={sizeConfig.checkSize}
                                        className={`${isLightColor(variant.colorCode) ? 'text-gray-800' : 'text-white'} drop-shadow-sm`}
                                        strokeWidth={3}
                                    />
                                </span>
                            )}

                            {/* Stock indicator (optional) */}
                            {variant.stock === 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"
                                    title="غير متوفر"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Determines if a color is light (for contrast purposes)
 */
function isLightColor(hexColor) {
    if (!hexColor || !hexColor.startsWith('#')) return false;

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}
