export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Elegant spinner with gold and slate colors */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-gold-500 border-r-gold-400"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-gold-400 opacity-20"></div>
        </div>
        {/* Loading text */}
        <p className="text-white font-medium text-lg animate-pulse">جارٍ التحميل...</p>
      </div>
    </div>
  );
}