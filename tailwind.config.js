/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Soft blush pink / Dusty rose
        blush: {
          50: '#FEF5F5',
          100: '#FDEDEF',
          200: '#F8D4DA',
          300: '#F2B8C1',
          400: '#E8A1AD',
          500: '#E8B4BC',
          600: '#D4A5A5',
          700: '#B76E79',
          800: '#9A5A63',
          900: '#7D4850',
        },
        // Secondary - Warm beige / Cream
        cream: {
          50: '#FFFBF7',
          100: '#FFF8F0',
          200: '#F5E6D3',
          300: '#EDD9C4',
          400: '#E5CCB5',
          500: '#DCC0A6',
          600: '#C9A97D',
          700: '#B59262',
          800: '#8C7049',
          900: '#634F33',
        },
        // Accent - Gold / Rose gold
        gold: {
          50: '#FBF8F0',
          100: '#F7F0E0',
          200: '#EFE0C2',
          300: '#E5CFA0',
          400: '#DBBF80',
          500: '#C9A962',
          600: '#B8944A',
          700: '#9A7A3A',
          800: '#7C612E',
          900: '#5E4922',
        },
        rose: {
          gold: '#B76E79',
        },
        // Text colors
        charcoal: '#3D3D3D',
        brown: {
          dark: '#4A3728',
          medium: '#5D4A3A',
          light: '#7A6555',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
