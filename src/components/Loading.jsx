export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-cream-50 to-blush-50 z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Elegant spinner with rose gold and gold colors */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blush-200 border-t-rose-gold border-r-gold-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-gold-300 opacity-20"></div>
        </div>
        {/* Loading text */}
        <p className="text-brown-dark font-tajawal text-lg animate-pulse">جارٍ التحميل...</p>
      </div>
    </div>
  );
}